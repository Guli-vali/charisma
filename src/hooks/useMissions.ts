import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getTodayMissions, 
  generateUserDailyMissions, 
  completeMission, 
  skipMission,
  getMissionHistory,
  getUserMissionStats,
} from '@/lib/missions';
import type { UserMission, MissionStats, User } from '@/lib/types';

export function useMissions(userId: string | undefined, userGoals?: User['goals']) {
  const [todayMissions, setTodayMissions] = useState<UserMission[]>([]);
  const [history, setHistory] = useState<UserMission[]>([]);
  const [stats, setStats] = useState<MissionStats>({
    total_completed: 0,
    total_assigned: 0,
    completion_rate: 0,
    current_streak: 0,
    total_xp_earned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef(false); // Защита от множественных загрузок
  const initializedRef = useRef(false); // Флаг первой инициализации

  const loadMissions = useCallback(async () => {
    if (!userId || loadingRef.current) return;

    loadingRef.current = true;

    try {
      setLoading(true);
      
      // Загружаем миссии на сегодня
      let missions = await getTodayMissions(userId);
      console.log('Loaded today missions:', missions.length);
      
      // Если миссий нет, генерируем новые (только при первой загрузке или reload)
      if (missions.length === 0 && userGoals) {
        console.log('No missions found, generating...');
        missions = await generateUserDailyMissions(userId, userGoals);
        console.log('Generated missions:', missions.length);
      }
      
      console.log('Setting today missions:', missions);
      setTodayMissions(missions);
      
      // Загружаем историю
      const historyData = await getMissionHistory(userId, 10);
      setHistory(historyData);
      
      // Загружаем статистику
      const statsData = await getUserMissionStats(userId, 'all');
      setStats(statsData);
      
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userId, userGoals]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Загружаем только один раз при монтировании
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;
      await loadMissions();
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, loadMissions]);

  const handleCompleteMission = async (
    userMissionId: string,
    proofText?: string,
    moodRating?: number,
    wasDifficult?: boolean
  ) => {
    if (!userId) return;

    try {
      await completeMission(userId, userMissionId, proofText, moodRating, wasDifficult);
      await loadMissions();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const handleSkipMission = async (userMissionId: string) => {
    try {
      await skipMission(userMissionId);
      await loadMissions();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    todayMissions,
    history,
    stats,
    loading,
    error,
    reload: loadMissions,
    completeMission: handleCompleteMission,
    skipMission: handleSkipMission,
  };
}
