import { LevelInfo, LevelReward } from './types';

/**
 * XP необходимый для достижения каждого уровня
 * Формула: level * 100
 */
export function getXpForLevel(level: number): number {
  return level * 100;
}

/**
 * Расчет уровня по общему XP
 * Формула: level = Math.floor(xp / 100) + 1
 */
export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / 100) + 1;
}

/**
 * Получить информацию о текущем уровне пользователя
 */
export function getLevelInfo(totalXp: number): LevelInfo {
  const current_level = calculateLevel(totalXp);
  const xp_for_current_level = getXpForLevel(current_level - 1);
  const xp_for_next_level = getXpForLevel(current_level);
  const current_xp = totalXp - xp_for_current_level;
  const xp_needed = xp_for_next_level - xp_for_current_level;
  const progress_percentage = Math.min(100, Math.round((current_xp / xp_needed) * 100));

  return {
    current_level,
    current_xp,
    xp_for_next_level: xp_needed,
    progress_percentage,
    total_xp: totalXp,
  };
}

/**
 * Особые уровни с наградами
 */
export const LEVEL_REWARDS: LevelReward[] = [
  {
    level: 5,
    reward_title: "Персонализированные миссии",
    reward_description: "Разблокированы персонализированные миссии на основе ваших целей",
    icon: "Target"
  },
  {
    level: 10,
    reward_title: "Продвинутые уроки",
    reward_description: "Доступ к продвинутым урокам и техникам",
    icon: "BookOpenCheck"
  },
  {
    level: 15,
    reward_title: "Эксклюзивные аватары",
    reward_description: "Набор эксклюзивных аватаров для профиля",
    icon: "UserCircle"
  },
  {
    level: 20,
    reward_title: "XP Бонус +10%",
    reward_description: "Получайте на 10% больше опыта за все действия",
    icon: "TrendingUp"
  },
  {
    level: 25,
    reward_title: "Статус 'Ментор'",
    reward_description: "Особый статус в сообществе и возможность помогать новичкам",
    icon: "Award"
  },
  {
    level: 30,
    reward_title: "Золотая рамка профиля",
    reward_description: "Эксклюзивная золотая рамка для вашего профиля",
    icon: "Frame"
  },
  {
    level: 40,
    reward_title: "Бета-доступ",
    reward_description: "Первыми тестируйте новые функции приложения",
    icon: "Sparkles"
  },
  {
    level: 50,
    reward_title: "Эксклюзивная тема",
    reward_description: "Уникальная тема оформления 'Midnight Gold'",
    icon: "Palette"
  },
  {
    level: 75,
    reward_title: "VIP Статус",
    reward_description: "Доступ ко всем премиум функциям навсегда",
    icon: "Crown"
  },
  {
    level: 100,
    reward_title: "Легендарный статус",
    reward_description: "Легендарная значок и место в зале славы",
    icon: "Trophy"
  },
];

/**
 * Получить награду за уровень
 */
export function getRewardForLevel(level: number): LevelReward | undefined {
  return LEVEL_REWARDS.find(reward => reward.level === level);
}

/**
 * Получить следующую награду после текущего уровня
 */
export function getNextReward(currentLevel: number): LevelReward | undefined {
  return LEVEL_REWARDS.find(reward => reward.level > currentLevel);
}

/**
 * Проверить, есть ли награда за текущий уровень
 */
export function hasRewardForLevel(level: number): boolean {
  return LEVEL_REWARDS.some(reward => reward.level === level);
}

/**
 * Получить все полученные награды до текущего уровня
 */
export function getEarnedRewards(currentLevel: number): LevelReward[] {
  return LEVEL_REWARDS.filter(reward => reward.level <= currentLevel);
}

/**
 * Получить все будущие награды после текущего уровня
 */
export function getFutureRewards(currentLevel: number): LevelReward[] {
  return LEVEL_REWARDS.filter(reward => reward.level > currentLevel);
}

/**
 * Получить ранг/звание для уровня
 */
export function getLevelRank(level: number): string {
  if (level < 5) return 'Новичок';
  if (level < 10) return 'Ученик';
  if (level < 20) return 'Практик';
  if (level < 30) return 'Эксперт';
  if (level < 50) return 'Мастер';
  if (level < 75) return 'Виртуоз';
  if (level < 100) return 'Легенда';
  return 'Гранд-Мастер';
}

/**
 * Получить цвет для уровня (Tailwind класс)
 */
export function getLevelColor(level: number): string {
  if (level < 5) return 'text-gray-600';
  if (level < 10) return 'text-green-600';
  if (level < 20) return 'text-blue-600';
  if (level < 30) return 'text-purple-600';
  if (level < 50) return 'text-orange-600';
  if (level < 75) return 'text-red-600';
  if (level < 100) return 'text-pink-600';
  return 'text-yellow-600';
}

/**
 * Тип для расширенного прогресса уровня (обратная совместимость)
 */
export interface LevelProgress extends LevelInfo {
  xp_progress_in_level: number;
  xp_needed_for_next: number;
  next_level: number;
  next_reward?: LevelReward | null;
}

/**
 * Получить расширенную информацию о прогрессе уровня
 */
export function getLevelProgress(totalXp: number): LevelProgress {
  const levelInfo = getLevelInfo(totalXp);
  const nextReward = getNextReward(levelInfo.current_level);
  
  return {
    ...levelInfo,
    xp_progress_in_level: levelInfo.current_xp,
    xp_needed_for_next: levelInfo.xp_for_next_level - levelInfo.current_xp,
    next_level: levelInfo.current_level + 1,
    next_reward: nextReward || null,
  };
}
