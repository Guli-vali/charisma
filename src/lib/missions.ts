import { pb } from './pocketbase';
import type { UserMission, MissionStats, MissionCategory, MissionDifficulty, User } from './types';
import { getAllCategories } from '@/data/missionsBank';

// Получить миссии пользователя на сегодня
export async function getTodayMissions(userId: string): Promise<UserMission[]> {
  try {
    // Получаем начало и конец сегодняшнего дня
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log('getTodayMissions - userId:', userId);
    console.log('getTodayMissions - date range:', startOfDay.toISOString(), '-', endOfDay.toISOString());
    
    const records = await pb.client.collection('user_missions').getFullList({
      filter: `user = "${userId}" && assigned_date >= "${startOfDay.toISOString()}" && assigned_date <= "${endOfDay.toISOString()}"`,
      expand: 'mission',
      sort: '-created',
    });
    
    console.log('getTodayMissions - found records:', records.length);
    if (records.length > 0) {
      console.log('First mission:', records[0]);
    }
    
    return records as unknown as UserMission[];
  } catch (error: unknown) {
    const err = error as { isAbort?: boolean; message?: string };
    if (err.isAbort || err.message?.includes('autocancelled')) {
      return [];
    }
    console.error('Error fetching today missions:', error);
    return [];
  }
}

// Генерировать ежедневные миссии для пользователя
export async function generateUserDailyMissions(userId: string, userGoals: User['goals']): Promise<UserMission[]> {
  try {
    // Двойная проверка на существующие миссии (защита от race condition)
    const existing = await getTodayMissions(userId);
    if (existing.length >= 3) {
      console.log('Missions already exist for today, returning existing');
      return existing;
    }
    
    // Если есть частичные миссии (< 3), все равно возвращаем их
    // чтобы не создавать дубли
    if (existing.length > 0) {
      console.log(`Found ${existing.length} missions for today, not generating more`);
      return existing;
    }

    // Определяем категории на основе целей пользователя
    const categories: MissionCategory[] = [];
    if (userGoals.work) categories.push('confidence', 'leadership');
    if (userGoals.dating) categories.push('smalltalk', 'confidence');
    if (userGoals.leadership) categories.push('leadership', 'networking');
    
    // Если нет целей, используем все категории
    const selectedCategories = categories.length > 0 
      ? [...new Set(categories)] 
      : getAllCategories();

    // Генерируем 3 миссии: легкая, средняя, сложная
    const difficulties: MissionDifficulty[] = ['easy', 'medium', 'hard'];
    const newMissions: UserMission[] = [];

    // Сначала проверяем, есть ли вообще миссии в БД
    const allAvailableMissions = await pb.client.collection('missions').getFullList({
      filter: `is_active = true`,
    });
    
    console.log(`Total missions in DB: ${allAvailableMissions.length}`);
    
    if (allAvailableMissions.length === 0) {
      console.error('No missions found in database! Please create missions via admin panel.');
      return [];
    }

    for (let i = 0; i < 3; i++) {
      const category = selectedCategories[i % selectedCategories.length];
      const difficulty = difficulties[i];
      
      console.log(`Trying to find mission: ${category} - ${difficulty}`);
      
      // Ищем случайную миссию из БД с нужной категорией и сложностью
      try {
        let availableMissions = await pb.client.collection('missions').getFullList({
          filter: `category = "${category}" && difficulty = "${difficulty}" && is_active = true`,
        });

        console.log(`Found ${availableMissions.length} missions for ${category} - ${difficulty}`);

        // Если нет миссий с точной комбинацией, пробуем любую сложность для этой категории
        if (availableMissions.length === 0) {
          console.warn(`No missions found for ${category} - ${difficulty}, trying any difficulty`);
          availableMissions = await pb.client.collection('missions').getFullList({
            filter: `category = "${category}" && is_active = true`,
          });
        }

        // Если все еще пусто, пробуем любую категорию с нужной сложностью
        if (availableMissions.length === 0) {
          console.warn(`No missions found for ${category}, trying any category with ${difficulty}`);
          availableMissions = await pb.client.collection('missions').getFullList({
            filter: `difficulty = "${difficulty}" && is_active = true`,
          });
        }

        // Если все еще нет миссий, берем любую доступную
        if (availableMissions.length === 0) {
          console.warn(`No specific missions, using any available`);
          availableMissions = allAvailableMissions;
        }

        // Если все еще нет миссий, пропускаем
        if (availableMissions.length === 0) {
          console.warn(`No missions available at all for slot ${i + 1}`);
          continue;
        }

        // Выбираем случайную миссию
        const randomMission = availableMissions[Math.floor(Math.random() * availableMissions.length)];

        // Проверяем, не назначена ли уже эта миссия сегодня
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        try {
          const existingAssignment = await pb.client.collection('user_missions').getFirstListItem(
            `user = "${userId}" && mission = "${randomMission.id}" && assigned_date >= "${startOfDay.toISOString()}"`
          );
          
          // Если уже назначена, пропускаем
          if (existingAssignment) {
            console.log(`Mission ${randomMission.id} already assigned today, skipping`);
            continue;
          }
        } catch {
          // Не найдена - это хорошо, создаем
        }

        // Назначаем миссию пользователю
        const userMissionData = {
          user: userId,
          mission: randomMission.id,
          status: 'assigned' as const,
          assigned_date: new Date().toISOString(), // DateTime формат
        };

        console.log('Creating user mission with data:', userMissionData);

        const userMission = await pb.client.collection('user_missions').create(userMissionData, {
          expand: 'mission',
        });
        
        console.log('Created user mission:', userMission);
        newMissions.push(userMission as unknown as UserMission);
      } catch (err: unknown) {
        // Игнорируем auto-cancellation
        const error = err as { isAbort?: boolean; message?: string };
        if (error.isAbort || error.message?.includes('autocancelled')) {
          continue;
        }
        console.error(`Error assigning mission for ${category} - ${difficulty}:`, err);
      }
    }

    console.log(`Created ${newMissions.length} new user missions`);

    // Если создали миссии, перезагружаем их с expand для корректного отображения
    if (newMissions.length > 0) {
      const reloadedMissions = await getTodayMissions(userId);
      console.log(`Reloaded missions with expand:`, reloadedMissions.length);
      return reloadedMissions;
    }

    console.warn('No missions were created');
    return newMissions;
  } catch (error) {
    console.error('Error generating daily missions:', error);
    return [];
  }
}

// Отметить миссию как выполненную
export async function completeMission(
  userId: string,
  userMissionId: string,
  proofText?: string,
  moodRating?: number,
  wasDifficult?: boolean
): Promise<void> {
  try {
    const data = {
      status: 'completed' as const,
      completed_date: new Date().toISOString(),
      proof_text: proofText,
      mood_rating: moodRating,
      was_difficult: wasDifficult,
    };

    await pb.client.collection('user_missions').update(userMissionId, data);

    // Получаем миссию для начисления XP
    const userMission = await pb.client.collection('user_missions').getOne(userMissionId, {
      expand: 'mission',
    });

    // Начисляем XP пользователю
    const currentUser = pb.getCurrentUser();
    if (currentUser && userMission.expand?.mission) {
      await pb.updateProfile(userId, {
        experience_points: currentUser.experience_points + userMission.expand.mission.xp_reward,
      } as Partial<User>);
    }
  } catch (error) {
    console.error('Error completing mission:', error);
    throw error;
  }
}

// Пропустить миссию
export async function skipMission(userMissionId: string): Promise<void> {
  try {
    await pb.client.collection('user_missions').update(userMissionId, {
      status: 'skipped' as const,
    });
  } catch (error) {
    console.error('Error skipping mission:', error);
    throw error;
  }
}

// Получить историю миссий
export async function getMissionHistory(userId: string, limit: number = 10): Promise<UserMission[]> {
  try {
    const records = await pb.client.collection('user_missions').getFullList({
      filter: `user = "${userId}" && status = "completed"`,
      expand: 'mission',
      sort: '-completed_date',
      limit,
    });
    
    return records as unknown as UserMission[];
  } catch (error: unknown) {
    const err = error as { isAbort?: boolean; message?: string };
    if (err.isAbort || err.message?.includes('autocancelled')) {
      return [];
    }
    console.error('Error fetching mission history:', error);
    return [];
  }
}

// Получить статистику миссий пользователя
export async function getUserMissionStats(
  userId: string,
  period: 'week' | 'month' | 'all' = 'all'
): Promise<MissionStats> {
  try {
    let dateFilter = '';
    
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = ` && assigned_date >= "${weekAgo.toISOString().split('T')[0]}"`;
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      dateFilter = ` && assigned_date >= "${monthAgo.toISOString().split('T')[0]}"`;
    }

    const allMissions = await pb.client.collection('user_missions').getFullList({
      filter: `user = "${userId}"${dateFilter}`,
      expand: 'mission',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completed = allMissions.filter((m: any) => m.status === 'completed');
    const totalCompleted = completed.length;
    const totalAssigned = allMissions.length;
    const completionRate = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;

    // Рассчитываем стрик
    const streak = await calculateMissionStreak(userId);

    // Находим любимую категорию
    const categoryCount: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    completed.forEach((m: any) => {
      const category = m.expand?.mission?.category;
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    const categories = Object.keys(categoryCount);
    const favoriteCategory = categories.length > 0
      ? (categories.reduce((a, b) => 
          categoryCount[a] > categoryCount[b] ? a : b
        ) as MissionCategory)
      : undefined;

    // Считаем заработанный XP
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalXpEarned = completed.reduce((sum: number, m: any) => {
      return sum + (m.expand?.mission?.xp_reward || 0);
    }, 0);

    return {
      total_completed: totalCompleted,
      total_assigned: totalAssigned,
      completion_rate: Math.round(completionRate),
      current_streak: streak,
      favorite_category: favoriteCategory,
      total_xp_earned: totalXpEarned,
    };
  } catch (error: unknown) {
    // Игнорируем auto-cancellation
    const err = error as { isAbort?: boolean; message?: string };
    if (err.isAbort || err.message?.includes('autocancelled')) {
      return {
        total_completed: 0,
        total_assigned: 0,
        completion_rate: 0,
        current_streak: 0,
        total_xp_earned: 0,
      };
    }
    console.error('Error fetching mission stats:', error);
    return {
      total_completed: 0,
      total_assigned: 0,
      completion_rate: 0,
      current_streak: 0,
      total_xp_earned: 0,
    };
  }
}

// Рассчитать текущий стрик миссий
export async function calculateMissionStreak(userId: string): Promise<number> {
  try {
    // Получаем все миссии за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const missions = await pb.client.collection('user_missions').getFullList({
      filter: `user = "${userId}" && assigned_date >= "${thirtyDaysAgo.toISOString().split('T')[0]}"`,
      sort: '-assigned_date',
    });

    // Группируем по дням
    const dayCompletion: Record<string, boolean> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    missions.forEach((m: any) => {
      const date = new Date(m.assigned_date).toISOString().split('T')[0];
      if (!dayCompletion[date]) {
        dayCompletion[date] = false;
      }
      if (m.status === 'completed') {
        dayCompletion[date] = true;
      }
    });

    // Считаем стрик
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (dayCompletion[dateStr]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  } catch (error: unknown) {
    const err = error as { isAbort?: boolean; message?: string };
    if (err.isAbort || err.message?.includes('autocancelled')) {
      return 0;
    }
    console.error('Error calculating mission streak:', error);
    return 0;
  }
}
