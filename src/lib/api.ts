import { pb } from './pocketbase';
import type { UserProgress, DailyStreak, DailyMission, Achievement, User } from './types';

// User Progress Functions
export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  try {
    const records = await pb.client.collection('progress').getFullList({
      filter: `user = "${userId}"`,
      sort: '-updated',
    });
    
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
  } catch (error: unknown) {
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
    const record = await pb.client.collection('daily_streaks').getFirstListItem(
      `user = "${userId}" && date = "${today}"`
    );
    
    return record as unknown as DailyStreak;
  } catch (error: unknown) {
    // Игнорируем auto-cancellation и not found
    return null;
  }
}

export async function updateTodayStreak(
  userId: string,
  lessonsCompleted: number = 0,
  missionsCompleted: number = 0
): Promise<DailyStreak> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const existing = await getTodayStreak(userId);
    
    const data = {
      user: userId,
      date: today,
      lessons_completed: existing ? existing.lessons_completed + lessonsCompleted : lessonsCompleted,
      missions_completed: existing ? existing.missions_completed + missionsCompleted : missionsCompleted,
    };

    let record;
    if (existing) {
      record = await pb.client.collection('daily_streaks').update(existing.id, data);
    } else {
      record = await pb.client.collection('daily_streaks').create(data);
    }
    
    return record as unknown as DailyStreak;
  } catch (error) {
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
  return [
    {
      id: 'complete_lesson',
      type: 'complete_lesson',
      title: 'Завершить 1 урок',
      description: 'Пройдите один урок сегодня',
      target: 1,
      current: todayStreak?.lessons_completed || 0,
      xp_reward: 10,
      completed: (todayStreak?.lessons_completed || 0) >= 1,
    },
    {
      id: 'real_mission',
      type: 'real_mission',
      title: 'Выполнить реальную миссию',
      description: 'Практикуйте навыки в реальной жизни',
      target: 1,
      current: todayStreak?.missions_completed || 0,
      xp_reward: 10,
      completed: (todayStreak?.missions_completed || 0) >= 1,
    },
    {
      id: 'earn_xp',
      type: 'earn_xp',
      title: 'Заработать 50 XP',
      description: 'Получите 50 XP сегодня',
      target: 50,
      current: 0, // Нужно будет трекать отдельно
      xp_reward: 10,
      completed: false,
    },
  ];
}

export async function completeDailyMission(
  userId: string,
  missionType: 'complete_lesson' | 'real_mission' | 'earn_xp'
): Promise<void> {
  try {
    if (missionType === 'complete_lesson') {
      await updateTodayStreak(userId, 1, 0);
    } else if (missionType === 'real_mission') {
      await updateTodayStreak(userId, 0, 1);
    }
    
    // Обновляем XP пользователя
    const currentUser = pb.getCurrentUser();
    if (currentUser) {
      await pb.updateProfile(currentUser.id, {
        experience_points: currentUser.experience_points + 10,
      } as Partial<User>);
    }
  } catch (error) {
    console.error('Error completing daily mission:', error);
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
