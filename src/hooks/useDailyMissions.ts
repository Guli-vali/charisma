import { useState, useEffect, useCallback } from 'react';
import { getTodayStreak, getDailyMissions, completeDailyMission, calculateCurrentStreak } from '@/lib/api';
import type { DailyStreak, DailyMission } from '@/lib/types';

export function useDailyMissions(userId: string | undefined) {
  const [todayStreak, setTodayStreak] = useState<DailyStreak | null>(null);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Загружаем данные о сегодняшнем стрике
      const streak = await getTodayStreak(userId);
      setTodayStreak(streak);
      
      // Генерируем дневные задания на основе прогресса
      const dailyMissions = getDailyMissions(userId, streak);
      setMissions(dailyMissions);
      
      // Рассчитываем текущий streak
      const streakCount = await calculateCurrentStreak(userId);
      setCurrentStreak(streakCount);
      
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      if (cancelled) return;
      await loadData();
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, loadData]);

  const completeMission = async (missionType: 'complete_lesson' | 'real_mission' | 'earn_xp') => {
    if (!userId) return;

    try {
      await completeDailyMission(userId, missionType);
      
      // Перезагружаем данные
      await loadData();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    todayStreak,
    missions,
    currentStreak,
    loading,
    error,
    reload: loadData,
    completeMission,
  };
}
