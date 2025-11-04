import { pb } from './pocketbase';
import type { UserProgress, DailyStreak, DailyMission, Achievement, User } from './types';

// User Progress Functions

/**
 * Инициализирует начальный прогресс для нового пользователя
 * Разблокирует первые навыки без prerequisites
 */
export async function initializeUserProgress(userId: string): Promise<void> {
  try {
    console.log('🚀 Initializing user progress for:', userId);
    
    // Динамический импорт для избежания циклических зависимостей
    const { SKILL_TREE_DATA } = await import('@/lib/skillTreeData');
    
    // Проверяем, есть ли уже прогресс
    const existingProgress = await pb.client.collection('progress').getFullList({
      filter: `user = "${userId}"`,
      requestKey: null,
    });
    
    if (existingProgress.length > 0) {
      console.log('✅ User already has progress records');
      return;
    }
    
    // Находим навыки без prerequisites (стартовые)
    const startingSkills = SKILL_TREE_DATA.filter(skill => 
      skill.prerequisites.length === 0
    );
    
    console.log(`📋 Found ${startingSkills.length} starting skills:`, startingSkills.map(s => s.id));
    
    // Создаем записи для стартовых навыков (available)
    for (const skill of startingSkills) {
      await pb.client.collection('progress').create({
        user: userId,
        skill_tree_node: skill.id,
        status: 'available',
        progress_percentage: 0,
        completed_exercises: [],
      }, { requestKey: null });
      
      console.log(`✅ Initialized skill: ${skill.id} as available`);
    }
    
    // Создаем записи для остальных навыков (locked)
    const lockedSkills = SKILL_TREE_DATA.filter(skill => 
      skill.prerequisites.length > 0
    );
    
    for (const skill of lockedSkills) {
      await pb.client.collection('progress').create({
        user: userId,
        skill_tree_node: skill.id,
        status: 'locked',
        progress_percentage: 0,
        completed_exercises: [],
      }, { requestKey: null });
      
      console.log(`🔒 Initialized skill: ${skill.id} as locked`);
    }
    
    console.log('🎉 User progress initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing user progress:', error);
  }
}

export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  try {
    const records = await pb.client.collection('progress').getFullList({
      filter: `user = "${userId}"`,
      sort: '-updated',
    });
    
    // Если нет записей, инициализируем
    if (records.length === 0) {
      console.log('⚠️ No progress records found, initializing...');
      await initializeUserProgress(userId);
      
      // Повторно получаем записи
      const newRecords = await pb.client.collection('progress').getFullList({
        filter: `user = "${userId}"`,
        sort: '-updated',
      });
      
      return newRecords as unknown as UserProgress[];
    }
    
    return records as unknown as UserProgress[];
  } catch (error: unknown) {
    // Игнорируем ошибку auto-cancellation - это нормальное поведение PocketBase
    const err = error as { isAbort?: boolean; message?: string };
    if (err.isAbort || err.message?.includes('autocancelled')) {
      return [];
    }
    console.error('Error fetching user progress:', error);
    return [];
  }
}

export async function getSkillProgress(userId: string, skillNodeId: string): Promise<UserProgress | null> {
  try {
    const record = await pb.client.collection('progress').getFirstListItem(
      `user = "${userId}" && skill_tree_node = "${skillNodeId}"`
    );
    
    return record as unknown as UserProgress;
  } catch {
    // Игнорируем auto-cancellation и not found
    return null;
  }
}

export async function updateProgress(
  userId: string,
  skillNode: string,
  progressPercentage: number,
  completedExercises: string[] = []
): Promise<UserProgress> {
  try {
    // Определяем статус на основе прогресса
    let status: 'locked' | 'available' | 'completed' = 'available';
    if (progressPercentage >= 100) {
      status = 'completed';
    }

    // Проверяем, существует ли запись
    const existing = await getSkillProgress(userId, skillNode);
    
    const data = {
      user: userId,
      skill_tree_node: skillNode,
      status,
      progress_percentage: Math.min(progressPercentage, 100),
      completed_exercises: completedExercises,
    };

    let record;
    if (existing) {
      record = await pb.client.collection('progress').update(existing.id, data);
    } else {
      record = await pb.client.collection('progress').create(data);
    }
    
    return record as unknown as UserProgress;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
}

// Daily Streaks Functions
export async function getTodayStreak(userId: string): Promise<DailyStreak | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`🔍 getTodayStreak for user ${userId}, date: ${today}`);
    
    // Используем >= и < для поиска по дате (работает с date полями)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const record = await pb.client.collection('daily_streaks').getFirstListItem(
      `user = "${userId}" && date >= "${today}" && date < "${tomorrowStr}"`
    );
    
    console.log('✅ Found today streak:', record);
    return record as unknown as DailyStreak;
  } catch (err) {
    console.log('⚠️ getTodayStreak: no record found or error:', err);
    // Игнорируем auto-cancellation и not found
    return null;
  }
}

export async function updateTodayStreak(
  userId: string,
  lessonsCompleted: number = 0,
  missionsCompleted: number = 0,
  xpEarned: number = 0
): Promise<DailyStreak> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const requestKey = `today_streak_${userId}_${today}`;
    
    const existing = await getTodayStreak(userId);
    
    // Создаем дату на начало сегодняшнего дня для сохранения
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    const data = {
      user: userId,
      date: todayDate.toISOString(), // Полный ISO формат для date поля
      lessons_completed: existing ? existing.lessons_completed + lessonsCompleted : lessonsCompleted,
      missions_completed: existing ? existing.missions_completed + missionsCompleted : missionsCompleted,
      xp_earned_today: existing ? (existing.xp_earned_today || 0) + xpEarned : xpEarned,
    };

    let record;
    if (existing) {
      record = await pb.client.collection('daily_streaks').update(existing.id, data, { requestKey });
      console.log(`✅ Updated daily_streaks: L:${data.lessons_completed} M:${data.missions_completed} XP:${data.xp_earned_today}`);
    } else {
      try {
        record = await pb.client.collection('daily_streaks').create(data, { requestKey });
        console.log(`✅ Created daily_streaks: L:${data.lessons_completed} M:${data.missions_completed} XP:${data.xp_earned_today}`);
      } catch (createErr) {
        // Если уже существует - обновляем
        const err = createErr as { status?: number; data?: { data?: unknown } };
        if (err.status === 400 && err.data?.data) {
          console.log('⚠️ Duplicate on create, fetching and updating...');
          const existing2 = await getTodayStreak(userId);
          if (existing2) {
            record = await pb.client.collection('daily_streaks').update(existing2.id, {
              lessons_completed: existing2.lessons_completed + lessonsCompleted,
              missions_completed: existing2.missions_completed + missionsCompleted,
              xp_earned_today: (existing2.xp_earned_today || 0) + xpEarned,
            });
            console.log('✅ Updated after duplicate on create');
          } else {
            throw createErr;
          }
        } else {
          throw createErr;
        }
      }
    }
    
    return record as unknown as DailyStreak;
  } catch (err) {
    // Игнорируем auto-cancellation
    const error = err as { isAbort?: boolean; message?: string };
    if (error.isAbort || error.message?.includes('autocancelled')) {
      console.log('⏭️ updateTodayStreak cancelled');
      // Возвращаем пустую запись
      return {
        id: '',
        user: userId,
        date: new Date().toISOString().split('T')[0],
        lessons_completed: 0,
        missions_completed: 0,
        xp_earned_today: 0,
        created: new Date().toISOString(),
      } as DailyStreak;
    }
    console.error('Error updating streak:', error);
    throw error;
  }
}

export async function calculateCurrentStreak(userId: string): Promise<number> {
  try {
    // Получаем все записи за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const records = await pb.client.collection('daily_streaks').getFullList({
      filter: `user = "${userId}" && date >= "${thirtyDaysAgo.toISOString().split('T')[0]}"`,
      sort: '-date',
    });
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < records.length; i++) {
      const recordDate = new Date(records[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      // Проверяем, что дата записи совпадает с ожидаемой
      if (recordDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  } catch (error: unknown) {
    // Игнорируем ошибку auto-cancellation
    const err = error as { isAbort?: boolean; message?: string };
    if (err.isAbort || err.message?.includes('autocancelled')) {
      return 0;
    }
    console.error('Error calculating streak:', error);
    return 0;
  }
}

// Daily Missions Functions
export function getDailyMissions(userId: string, todayStreak: DailyStreak | null): DailyMission[] {
  const lessonsCompleted = todayStreak?.lessons_completed || 0;
  const missionsCompleted = todayStreak?.missions_completed || 0;
  const xpEarned = todayStreak?.xp_earned_today || 0;
  
  // Проверяем, получена ли уже награда за каждую миссию
  const lessonRewardClaimed = todayStreak?.lesson_mission_claimed || false;
  const missionRewardClaimed = todayStreak?.real_mission_claimed || false;
  const xpRewardClaimed = todayStreak?.xp_mission_claimed || false;
  
  return [
    {
      id: 'complete_lesson',
      type: 'complete_lesson',
      title: 'Завершить 1 урок',
      description: 'Пройдите один урок сегодня',
      target: 1,
      current: lessonsCompleted,
      xp_reward: 10,
      completed: lessonsCompleted >= 1 && lessonRewardClaimed, // Выполнено, если урок пройден И награда получена
    },
    {
      id: 'real_mission',
      type: 'real_mission',
      title: 'Выполнить реальную миссию',
      description: 'Практикуйте навыки в реальной жизни',
      target: 1,
      current: missionsCompleted,
      xp_reward: 10,
      completed: missionsCompleted >= 1 && missionRewardClaimed,
    },
    {
      id: 'earn_xp',
      type: 'earn_xp',
      title: 'Заработать 50 XP',
      description: 'Получите 50 XP сегодня',
      target: 50,
      current: xpEarned,
      xp_reward: 10,
      completed: xpEarned >= 50 && xpRewardClaimed,
    },
  ];
}

export async function completeDailyMission(
  userId: string,
  missionType: 'complete_lesson' | 'real_mission' | 'earn_xp'
): Promise<void> {
  try {
    let todayStreak = await getTodayStreak(userId);
    
    // Если записи нет, создаем её (для случая когда пользователь выполняет миссию первым действием за день)
    if (!todayStreak) {
      console.log('Creating daily streak record for today...');
      todayStreak = await updateTodayStreak(userId, 0, 0, 0);
    }
    
    // Для реальной миссии - НЕ увеличиваем счетчик здесь!
    // Счетчик должен увеличиваться только когда реальная миссия выполнена на странице /missions
    // Эта функция только выдает награду, если миссия уже выполнена
    
    // Проверяем, можно ли получить награду
    let canClaim = false;
    let claimField = '';
    
    if (missionType === 'complete_lesson') {
      canClaim = todayStreak.lessons_completed >= 1 && !todayStreak.lesson_mission_claimed;
      claimField = 'lesson_mission_claimed';
    } else if (missionType === 'real_mission') {
      canClaim = todayStreak.missions_completed >= 1 && !todayStreak.real_mission_claimed;
      claimField = 'real_mission_claimed';
    } else if (missionType === 'earn_xp') {
      canClaim = (todayStreak.xp_earned_today || 0) >= 50 && !todayStreak.xp_mission_claimed;
      claimField = 'xp_mission_claimed';
    }
    
    if (!canClaim) {
      console.log('⚠️ Mission reward already claimed or requirements not met');
      console.log('Mission type:', missionType);
      console.log('Today streak:', todayStreak);
      return; // Награда уже получена или требования не выполнены
    }
    
    console.log(`✅ Claiming ${missionType} mission reward...`);
    
    // Отмечаем награду как полученную
    await pb.client.collection('daily_streaks').update(todayStreak.id, {
      [claimField]: true,
    });
    
    console.log(`✅ Updated daily_streaks: ${claimField} = true`);
    
    // Начисляем XP пользователю
    const currentUser = pb.getCurrentUser();
    if (currentUser) {
      const newXP = currentUser.experience_points + 10;
      console.log(`💰 Awarding XP: ${currentUser.experience_points} + 10 = ${newXP}`);
      
      await pb.updateProfile(currentUser.id, {
        experience_points: newXP,
      } as Partial<User>);
      
      // Обновляем Zustand store
      try {
        const { useAuth } = await import('@/hooks/useAuth');
        await useAuth.getState().refreshUser();
        console.log('✅ Daily mission reward claimed: +10 XP, Zustand refreshed');
      } catch (error) {
        console.error('Error refreshing Zustand store:', error);
        throw error;
      }
    } else {
      console.error('❌ No current user found');
      throw new Error('No current user');
    }
  } catch (error) {
    console.error('❌ Error completing daily mission:', error);
    throw error;
  }
}

// Achievements Functions
export function getUserAchievements(): Achievement[] {
  // Mock данные для достижений
  return [
    {
      id: 'first_steps',
      name: 'Первые шаги',
      description: 'Завершить первый урок',
      icon: '🎯',
      xp_reward: 25,
      unlocked: true,
      unlocked_at: new Date().toISOString(),
    },
    {
      id: 'week_power',
      name: 'Неделя силы',
      description: '7 дней подряд',
      icon: '🔥',
      xp_reward: 50,
      unlocked: false,
    },
    {
      id: 'smalltalk_master',
      name: 'Мастер smalltalk',
      description: 'Завершить все базовые уроки',
      icon: '💬',
      xp_reward: 100,
      unlocked: false,
    },
    {
      id: 'social_butterfly',
      name: 'Социальная бабочка',
      description: 'Выполнить 10 реальных миссий',
      icon: '🦋',
      xp_reward: 75,
      unlocked: false,
    },
  ];
}

// Level Calculation Functions
export function calculateUserLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function getNextLevelXP(level: number): number {
  return level * 100;
}

export function getXPProgress(xp: number): { current: number; target: number; percentage: number } {
  const level = calculateUserLevel(xp);
  const prevLevelXP = (level - 1) * 100;
  const nextLevelXP = level * 100;
  const currentXP = xp - prevLevelXP;
  const targetXP = nextLevelXP - prevLevelXP;
  
  return {
    current: currentXP,
    target: targetXP,
    percentage: (currentXP / targetXP) * 100,
  };
}
