import pb from './pocketbase';
import { UserAchievement, AchievementData, GamificationAction } from './types';
import { ACHIEVEMENTS } from '@/data/achievements';

/**
 * Тип для дополнительных данных при проверке достижений
 */
export interface AchievementCheckData {
  perfect?: boolean;
  score?: number;
  total?: number;
  percentage?: number;
  duration_seconds?: number;
  skill_completed?: boolean;
  mission_streak_days?: number;
  weekly_challenge_completed?: boolean;
  streak_restored?: boolean;
  days_since_last_login?: number;
  lessons_today?: number;
}

/**
 * Расширенная запись пользовательского достижения с дополнительными полями
 */
export interface UserAchievementRecord extends UserAchievement {
  progress_current?: number;
  progress_target?: number;
}

/**
 * Проверка достижений пользователя на основе действия
 * Автоматически разблокирует подходящие достижения
 */
export async function checkAchievements(
  userId: string, 
  action: GamificationAction, 
  data?: AchievementCheckData
): Promise<UserAchievement[]> {
  try {
    const newAchievements: UserAchievement[] = [];

    // Получаем все достижения пользователя
    const userAchievements = await getUserAchievements(userId);
    const earnedKeys = new Set(
      userAchievements
        .filter(ua => ua.expand?.achievement)
        .map(ua => ua.expand!.achievement!.key)
    );

    console.log(`🔍 Checking achievements for action: ${action}`);
    console.log(`   Already earned: ${earnedKeys.size} achievements`);

    // Фильтруем достижения по типу действия для оптимизации
    const relevantAchievements = ACHIEVEMENTS.filter(achievement => {
      // Пропускаем уже полученные
      if (earnedKeys.has(achievement.key)) return false;

      // Фильтруем по типу действия
      if (!achievement.unlock_condition) return false;
      
      const conditionType = achievement.unlock_condition.type;
      
      // Проверяем релевантность для текущего действия
      if (action === 'lesson_completed') {
        // Только достижения связанные с уроками
        return conditionType.includes('lesson') || 
               conditionType === 'perfect_lesson' || 
               conditionType === 'fast_lesson' || 
               conditionType === 'late_night_lesson' || 
               conditionType === 'early_morning_lesson' || 
               conditionType === 'daily_lessons' ||
               conditionType === 'weekend_lessons';
      } else if (action === 'mission_completed') {
        // Только достижения связанные с миссиями
        return conditionType.includes('mission');
      } else if (action === 'streak_achieved') {
        // Только достижения связанные со стриками
        return conditionType.includes('streak');
      } else if (action === 'login') {
        // Только достижения связанные с входом
        return conditionType === 'long_break_return';
      }
      
      return false; // Для неизвестных действий не проверяем
    });

    console.log(`   Relevant achievements to check: ${relevantAchievements.length}`);
    console.log(`   Achievement keys:`, relevantAchievements.map(a => a.key));

    // Проверяем только релевантные достижения
    for (const achievement of relevantAchievements) {
      if (!achievement.unlock_condition) continue;
      
      console.log(`🔎 Checking achievement: ${achievement.key} (${achievement.unlock_condition.type})`);
      
      // Проверяем условие разблокировки
      const shouldUnlock = await checkUnlockCondition(
        userId, 
        achievement, 
        action, 
        data
      );

      console.log(`   Should unlock ${achievement.key}:`, shouldUnlock);

      if (shouldUnlock) {
        console.log(`✨ Unlocking achievement: ${achievement.key}`);
        const unlocked = await unlockAchievement(userId, achievement.key);
        if (unlocked) {
          newAchievements.push(unlocked);
        }
      }
    }

    console.log(`🎉 Total new achievements unlocked: ${newAchievements.length}`);
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

/**
 * Проверка условия разблокировки достижения
 */
async function checkUnlockCondition(
  userId: string,
  achievement: AchievementData,
  action: GamificationAction,
  data?: AchievementCheckData
): Promise<boolean> {
  if (!achievement.unlock_condition) return false;

  const { type, value } = achievement.unlock_condition;

  try {
    // Получаем данные пользователя
    const user = await pb.client.collection('users').getOne(userId, {
      requestKey: null,
    });

    switch (type) {
      case 'lessons_completed':
        return user.total_lessons_completed >= value;

      case 'missions_completed':
        const missions = await pb.client.collection('user_missions').getFullList({
          filter: `user = "${userId}" && status = "completed"`,
          requestKey: null,
        });
        return missions.length >= value;

      case 'streak_days':
        return user.current_streak >= value;

      case 'mission_streak_days':
        // Реализуется позже через подсчет дней подряд с миссиями
        return (data?.mission_streak_days ?? 0) >= value;

      case 'perfect_lesson':
        console.log('🎯 Checking perfect_lesson:', { perfect: data?.perfect, score: data?.score, total: data?.total });
        const isPerfect = data?.perfect === true;
        console.log('   Result:', isPerfect);
        return isPerfect;

      case 'skill_completed':
        // Проверяем завершение навыка
        return data?.skill_completed === true;

      case 'all_skills_completed':
        try {
          const completedSkills = await pb.client.collection('progress').getFullList({
            filter: `user = "${userId}" && status = "completed"`,
            requestKey: null,
          });
          // Предполагаем, что всего навыков определенное количество
          return completedSkills.length >= 20; // TODO: заменить на реальное число
        } catch {
          // Коллекция progress может не существовать
          console.warn('Collection progress not found, skipping achievement check');
          return false;
        }

      case 'late_night_lesson':
        const hour = new Date().getHours();
        return action === 'lesson_completed' && hour >= 23;

      case 'early_morning_lesson':
        const morningHour = new Date().getHours();
        return action === 'lesson_completed' && morningHour < 6;

      case 'fast_lesson':
        return (data?.duration_seconds ?? Infinity) < 120;

      case 'long_break_return':
        return (data?.days_since_last_login ?? 0) >= 30;

      case 'weekend_lessons':
        try {
          const weekendLessons = await pb.client.collection('daily_streaks').getFullList({
            filter: `user = "${userId}"`,
            sort: '-date',
            requestKey: null,
          });
          // Подсчитываем уроки в выходные (суббота=6, воскресенье=0)
          const weekendCount = weekendLessons.filter(streak => {
            const day = new Date(streak.date).getDay();
            return day === 0 || day === 6;
          }).reduce((sum, streak) => sum + streak.lessons_completed, 0);
          return weekendCount >= value;
        } catch {
          // Коллекция daily_streaks может не существовать
          console.warn('Collection daily_streaks not found, skipping achievement check');
          return false;
        }

      case 'daily_lessons':
        return (data?.lessons_today ?? 0) >= value;

      case 'weekly_challenge_completed':
        return data?.weekly_challenge_completed === true;

      case 'streak_restored':
        return data?.streak_restored === true;

      case 'registration':
        return true; // Автоматически при регистрации

      case 'profile_completed':
        return user.goals && Object.values(user.goals).some(Boolean);

      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking unlock condition:', error);
    return false;
  }
}

// Глобальный кэш для отслеживания достижений в процессе разблокировки (защита от race condition)
const unlockingAchievements = new Set<string>();

/**
 * Разблокировать достижение для пользователя
 */
export async function unlockAchievement(
  userId: string, 
  achievementKey: string
): Promise<UserAchievement | null> {
  // Создаем уникальный ключ для этой комбинации пользователя и достижения
  const lockKey = `${userId}:${achievementKey}`;
  
  // Проверяем, не разблокируется ли это достижение прямо сейчас
  if (unlockingAchievements.has(lockKey)) {
    console.log('⏳ Achievement is already being unlocked, waiting...', achievementKey);
    // Ждем немного и проверяем снова
    await new Promise(resolve => setTimeout(resolve, 100));
    // После ожидания пытаемся получить уже созданное достижение
    try {
      const dbAchievements = await pb.client.collection('achievements').getFullList({
        filter: `key = "${achievementKey}"`,
        requestKey: null,
      });
      if (dbAchievements.length > 0) {
        const existing = await pb.client.collection('user_achievements').getFullList({
          filter: `user = "${userId}" && achievement = "${dbAchievements[0].id}"`,
          expand: 'achievement',
          requestKey: null,
        });
        if (existing.length > 0) {
          console.log('✅ Found achievement that was being unlocked:', achievementKey);
          return existing[0] as unknown as UserAchievement;
        }
      }
    } catch (error) {
      console.error('Error fetching achievement after wait:', error);
    }
    return null;
  }

  // Помечаем, что разблокируем это достижение
  unlockingAchievements.add(lockKey);

  try {
    // Находим достижение в базе данных
    const dbAchievements = await pb.client.collection('achievements').getFullList({
      filter: `key = "${achievementKey}"`,
      requestKey: null,
    });

    if (dbAchievements.length === 0) {
      console.error(`Achievement with key "${achievementKey}" not found in database`);
      return null;
    }

    const achievement = dbAchievements[0];

    // Проверяем, не получено ли уже
    const existing = await pb.client.collection('user_achievements').getFullList({
      filter: `user = "${userId}" && achievement = "${achievement.id}"`,
      expand: 'achievement',
      requestKey: null,
    });

    if (existing.length > 0) {
      console.log('ℹ️ Achievement already unlocked, skipping:', achievement.key);
      return existing[0] as unknown as UserAchievement;
    }

    console.log('✨ New achievement to unlock:', achievement.key);

    // Создаем запись о получении достижения
    console.log('📝 Creating user_achievement:', {
      user: userId,
      achievement: achievement.id,
      earned_at: new Date().toISOString(),
      progress: 100,
    });

    try {
      const userAchievement = await pb.client.collection('user_achievements').create({
        user: userId,
        achievement: achievement.id,
        earned_at: new Date().toISOString(),
        progress: 100,
      }, {
        requestKey: null,
      });

      console.log('✅ User achievement created:', userAchievement);

      // Начисляем XP пользователю
      const user = await pb.client.collection('users').getOne(userId, {
        requestKey: null,
      });
      
      console.log(`💎 Achievement XP reward:`);
      console.log(`   Current XP: ${user.experience_points}`);
      console.log(`   Achievement reward: +${achievement.xp_reward} XP`);
      console.log(`   New XP will be: ${user.experience_points + achievement.xp_reward}`);
      
      await pb.client.collection('users').update(userId, {
        experience_points: user.experience_points + achievement.xp_reward,
      }, {
        requestKey: null,
      });

      console.log(`✅ Achievement XP awarded: +${achievement.xp_reward}`);

      // Обновляем Zustand store для синхронизации UI
      try {
        const { useAuth } = await import('@/hooks/useAuth');
        await useAuth.getState().refreshUser();
        console.log('✅ Zustand store refreshed after achievement unlock');
      } catch (error) {
        console.error('Error refreshing Zustand store:', error);
      }

      // Получаем полную информацию с expand
      console.log('🔄 Fetching achievement with expand for:', userAchievement.id);
      
      const fullAchievement = await pb.client.collection('user_achievements').getOne(
        userAchievement.id,
        { expand: 'achievement', requestKey: null }
      );

      console.log('📦 Full achievement with expand:', JSON.stringify(fullAchievement, null, 2));
      console.log('📦 Has expand?', !!fullAchievement.expand);
      console.log('📦 Expanded achievement data:', fullAchievement.expand?.achievement);
      
      // Если expand не сработал, загружаем достижение вручную
      if (!fullAchievement.expand?.achievement) {
        console.warn('⚠️ Expand failed, manually loading achievement data');
        const achievementData = ACHIEVEMENTS.find(a => a.key === achievementKey);
        if (achievementData) {
          fullAchievement.expand = {
            achievement: {
              ...achievement,
              ...achievementData,
            }
          };
          console.log('✅ Manually attached achievement data');
        }
      }

      return fullAchievement as unknown as UserAchievement;
    } catch (createError: unknown) {
      const error = createError as { status?: number; data?: { data?: { user?: { code?: string } } } };
      
      // Если это ошибка дубликата (unique constraint), достижение уже получено
      if (error.status === 400 && error.data?.data?.user?.code === 'validation_not_unique') {
        console.log('ℹ️ Achievement already exists (unique constraint), fetching existing...');
        
        // Получаем существующее достижение
        const existing = await pb.client.collection('user_achievements').getFullList({
          filter: `user = "${userId}" && achievement = "${achievement.id}"`,
          expand: 'achievement',
          requestKey: null,
        });
        
        if (existing.length > 0) {
          console.log('✅ Returning existing achievement from DB');
          return existing[0] as unknown as UserAchievement;
        }
      }

      console.error('❌ Failed to create user_achievement:', error);
      
      // Не выбрасываем ошибку, просто возвращаем null
      return null;
    }
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      return null;
    }
    console.error('Error unlocking achievement:', error);
    return null;
  } finally {
    // Всегда удаляем из кэша в конце
    unlockingAchievements.delete(lockKey);
  }
}

/**
 * Получить все достижения пользователя
 */
export async function getUserAchievements(
  userId: string, 
  filter?: string
): Promise<UserAchievement[]> {
  try {
    let filterQuery = `user = "${userId}"`;
    
    if (filter && filter !== 'all') {
      // Фильтр по категории
      filterQuery += ` && achievement.category = "${filter}"`;
    }

    const achievements = await pb.client.collection('user_achievements').getFullList({
      filter: filterQuery,
      expand: 'achievement',
      sort: '-earned_at',
      // Отключаем автоотмену для этого запроса
      requestKey: null,
    });

    return achievements as unknown as UserAchievement[];
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      return [];
    }
    console.error('Error getting user achievements:', error);
    return [];
  }
}

/**
 * Получить прогресс достижения
 */
export async function getAchievementProgress(
  userId: string, 
  achievementKey: string
): Promise<number> {
  try {
    const achievement = ACHIEVEMENTS.find(a => a.key === achievementKey);
    if (!achievement || !achievement.unlock_condition) return 0;

    const { type, value } = achievement.unlock_condition;
    const user = await pb.client.collection('users').getOne(userId, {
      requestKey: null,
    });

    let current = 0;

    switch (type) {
      case 'lessons_completed':
        current = user.total_lessons_completed;
        break;

      case 'missions_completed':
        const missions = await pb.client.collection('user_missions').getFullList({
          filter: `user = "${userId}" && status = "completed"`,
          requestKey: null,
        });
        current = missions.length;
        break;

      case 'streak_days':
        current = user.current_streak;
        break;

      default:
        return 0;
    }

    return Math.min(100, Math.round((current / value) * 100));
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      return 0;
    }
    console.error('Error getting achievement progress:', error);
    return 0;
  }
}

/**
 * Получить все достижения с информацией о получении
 */
export async function getAllAchievementsWithStatus(
  userId: string
): Promise<Array<AchievementData & { unlocked: boolean; progress: number; earned_at?: string }>> {
  try {
    const userAchievements = await getUserAchievements(userId);
    const earnedMap = new Map(
      userAchievements
        .filter(ua => ua.expand?.achievement)
        .map(ua => [
          ua.expand!.achievement!.key, 
          { earned_at: ua.earned_at, progress: ua.progress }
        ])
    );

    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: earnedMap.has(achievement.key),
      progress: earnedMap.get(achievement.key)?.progress || 0,
      earned_at: earnedMap.get(achievement.key)?.earned_at,
    }));
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      return ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlocked: false,
        progress: 0,
      }));
    }
    console.error('Error getting all achievements with status:', error);
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: false,
      progress: 0,
    }));
  }
}

/**
 * Инициализация достижений в базе данных
 * Запускается один раз для наполнения коллекции achievements
 */
export async function initializeAchievements(): Promise<void> {
  try {
    const existingAchievements = await pb.client.collection('achievements').getFullList({
      requestKey: null,
    });
    const existingKeys = new Set(existingAchievements.map(a => a.key));

    for (const achievement of ACHIEVEMENTS) {
      if (!existingKeys.has(achievement.key)) {
        await pb.client.collection('achievements').create({
          key: achievement.key,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          rarity: achievement.rarity,
          xp_reward: achievement.xp_reward,
          unlock_condition: achievement.unlock_condition,
          is_hidden: achievement.is_hidden || false,
        }, {
          requestKey: null,
        });
      }
    }

    console.log('Achievements initialized successfully');
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      console.log('Initialization request was cancelled');
      return;
    }
    console.error('Error initializing achievements:', error);
    throw error;
  }
}
