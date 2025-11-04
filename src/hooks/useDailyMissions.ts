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
    if (!userId) {
      console.log('⚠️ useDailyMissions.loadData: no userId');
      return;
    }

    try {
      console.log('🔄 useDailyMissions.loadData: loading data for', userId);
      setLoading(true);
      
      // Загружаем данные о сегодняшнем стрике
      console.log('📡 Fetching today streak...');
      const streak = await getTodayStreak(userId);
      console.log('📊 Today streak:', streak);
      setTodayStreak(streak);
      
      // Генерируем дневные задания на основе прогресса
      console.log('🎯 Generating daily missions...');
      const dailyMissions = getDailyMissions(userId, streak);
      console.log('✅ Daily missions generated:', dailyMissions);
      setMissions(dailyMissions);
      
      // Рассчитываем текущий streak
      const streakCount = await calculateCurrentStreak(userId);
      console.log('🔥 Current streak:', streakCount);
      setCurrentStreak(streakCount);
      
      setError(null);
    } catch (err) {
      console.error('❌ Error loading daily missions:', err);
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
