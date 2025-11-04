import { useState, useCallback, useEffect } from 'react';
import { UserAchievement, GamificationAction } from '@/lib/types';
import { checkAchievements } from '@/lib/achievements';
import { getUserLeague, promoteToNextLeague } from '@/lib/leagues';
import { getLevelInfo, hasRewardForLevel } from '@/lib/levels';
import { useAuth } from './useAuth';

interface UseGamificationReturn {
  newAchievements: UserAchievement[];
  showAchievementModal: boolean;
  currentAchievement: UserAchievement | null;
  trackAction: (action: GamificationAction, data?: Record<string, any>) => Promise<void>;
  dismissAchievement: () => void;
  leagueInfo: {
    current: any;
    next: any;
    xp_to_next: number;
    position_in_league: number;
  } | null;
  levelInfo: {
    current_level: number;
    current_xp: number;
    xp_for_next_level: number;
    progress_percentage: number;
    total_xp: number;
  } | null;
  isLoading: boolean;
}

/**
 * Хук для геймификации и отслеживания достижений
 * Автоматически проверяет достижения при действиях пользователя
 */
export function useGamification(): UseGamificationReturn {
  const { user } = useAuth();
  const [newAchievements, setNewAchievements] = useState<UserAchievement[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<UserAchievement | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<UserAchievement[]>([]);
  const [leagueInfo, setLeagueInfo] = useState<any>(null);
  const [levelInfo, setLevelInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем информацию о лиге и уровне при изменении пользователя
  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  // Показываем модальное окно для каждого нового достижения из очереди
  useEffect(() => {
    if (achievementQueue.length > 0 && !showAchievementModal) {
      const [nextAchievement, ...rest] = achievementQueue;
      
      console.log('🔍 Processing achievement from queue:', {
        id: nextAchievement?.id,
        hasExpand: !!nextAchievement?.expand,
        hasAchievementInExpand: !!nextAchievement?.expand?.achievement,
        achievementData: nextAchievement?.expand?.achievement,
      });
      
      // Проверяем что данные достижения загружены
      const achievementData = nextAchievement?.expand?.achievement;
      const hasRequiredData = achievementData && 
                             achievementData.title && 
                             achievementData.description;
      
      if (hasRequiredData) {
        console.log('🎊 Showing achievement:', achievementData.title);
        setCurrentAchievement(nextAchievement);
        setShowAchievementModal(true);
        setAchievementQueue(rest);
      } else {
        console.warn('⚠️ Achievement data incomplete, skipping modal:', {
          achievement: nextAchievement,
          expand: nextAchievement?.expand,
          achievementData,
        });
        // Пропускаем и показываем следующее
        setAchievementQueue(rest);
      }
    }
  }, [achievementQueue, showAchievementModal]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      const [league, level] = await Promise.all([
        getUserLeague(user.id),
        Promise.resolve(getLevelInfo(user.experience_points)),
      ]);

      setLeagueInfo(league);
      setLevelInfo(level);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  /**
   * Отследить действие пользователя и проверить достижения
   */
  const trackAction = useCallback(async (
    action: GamificationAction,
    data?: Record<string, any>
  ) => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Проверяем достижения
      const achievements = await checkAchievements(user.id, action, data);
      
      console.log('🎯 Achievements checked:', achievements.length, 'new achievements');
      
      if (achievements.length > 0) {
        // Фильтруем дубликаты по ID достижения
        const uniqueAchievements = achievements.filter((achievement, index, self) => {
          // Проверяем, что достижение валидно
          if (!achievement || !achievement.expand?.achievement?.id) {
            console.warn('⚠️ Invalid achievement data, skipping:', achievement);
            return false;
          }
          
          // Оставляем только первое вхождение каждого достижения
          return index === self.findIndex(a => 
            a?.expand?.achievement?.id === achievement.expand.achievement.id
          );
        });
        
        console.log('✨ Unique achievements after deduplication:', uniqueAchievements.length);
        
        setNewAchievements(uniqueAchievements);
        setAchievementQueue(prev => {
          // Создаем Set для быстрой проверки существующих ID
          const existingIds = new Set(
            prev
              .filter(a => a?.expand?.achievement?.id)
              .map(a => a.expand!.achievement!.id)
          );
          
          // Добавляем только новые достижения
          const newAchievements = uniqueAchievements.filter(achievement => {
            const achievementId = achievement.expand?.achievement?.id;
            if (!achievementId) return false;
            return !existingIds.has(achievementId);
          });
          
          if (newAchievements.length > 0) {
            console.log(`📋 Adding ${newAchievements.length} achievements to queue`);
            return [...prev, ...newAchievements];
          }
          
          console.log('📋 No new achievements to add to queue');
          return prev;
        });
      }

      // Проверяем повышение лиги
      const promoted = await promoteToNextLeague(user.id);
      if (promoted) {
        console.log('User promoted to next league!');
        await loadUserStats();
      }

      // Проверяем повышение уровня
      const previousLevel = levelInfo?.current_level || 1;
      const newLevelInfo = getLevelInfo(user.experience_points);
      
      if (newLevelInfo.current_level > previousLevel) {
        console.log('User leveled up!', newLevelInfo.current_level);
        
        // Проверяем награду за уровень
        if (hasRewardForLevel(newLevelInfo.current_level)) {
          // TODO: Показать модальное окно награды за уровень
          console.log('Level reward unlocked!');
        }
      }

      // Обновляем статистику
      await loadUserStats();

    } catch (error) {
      console.error('Error tracking action:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, levelInfo]);

  /**
   * Закрыть модальное окно достижения
   */
  const dismissAchievement = useCallback(() => {
    setShowAchievementModal(false);
    setCurrentAchievement(null);
  }, []);

  return {
    newAchievements,
    showAchievementModal,
    currentAchievement,
    trackAction,
    dismissAchievement,
    leagueInfo,
    levelInfo,
    isLoading,
  };
}

/**
 * Хелпер для отслеживания завершения урока
 */
export function useTrackLessonComplete() {
  const { trackAction } = useGamification();

  return useCallback(async (lessonData: {
    perfect?: boolean;
    duration_seconds?: number;
  }) => {
    await trackAction('lesson_completed', lessonData);
  }, [trackAction]);
}

/**
 * Хелпер для отслеживания завершения миссии
 */
export function useTrackMissionComplete() {
  const { trackAction } = useGamification();

  return useCallback(async (missionData: {
    category?: string;
  }) => {
    await trackAction('mission_completed', missionData);
  }, [trackAction]);
}

/**
 * Хелпер для отслеживания стрика
 */
export function useTrackStreak() {
  const { trackAction } = useGamification();

  return useCallback(async (streakData: {
    days: number;
    restored?: boolean;
  }) => {
    await trackAction('streak_achieved', streakData);
  }, [trackAction]);
}

/**
 * Хелпер для отслеживания входа
 */
export function useTrackLogin() {
  const { trackAction } = useGamification();

  return useCallback(async (loginData?: {
    days_since_last_login?: number;
  }) => {
    await trackAction('login', loginData);
  }, [trackAction]);
}
