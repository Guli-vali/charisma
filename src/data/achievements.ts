import { AchievementData, AchievementCategory, AchievementRarity } from '@/lib/types';

/**
 * Цвета по редкости достижений
 */
export const RARITY_COLORS: Record<AchievementRarity, {
  text: string;
  bg: string;
  border: string;
  glow: string;
}> = {
  common: {
    text: 'text-gray-700',
    bg: 'bg-gray-100',
    border: 'border-gray-400',
    glow: 'shadow-gray-300',
  },
  rare: {
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    glow: 'shadow-blue-300',
  },
  epic: {
    text: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-500',
    glow: 'shadow-purple-300',
  },
  legendary: {
    text: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    glow: 'shadow-yellow-300',
  },
};

/**
 * Информация о категориях достижений
 */
export const CATEGORY_INFO: Record<AchievementCategory, {
  label: string;
  icon: string;
  description: string;
}> = {
  lessons: {
    label: 'Уроки',
    icon: 'BookOpen',
    description: 'Достижения за прохождение уроков',
  },
  missions: {
    label: 'Миссии',
    icon: 'Target',
    description: 'Достижения за выполнение реальных заданий',
  },
  streaks: {
    label: 'Стрики',
    icon: 'Flame',
    description: 'Достижения за регулярность занятий',
  },
  social: {
    label: 'Социальные',
    icon: 'Users',
    description: 'Достижения за освоение навыков',
  },
  special: {
    label: 'Особые',
    icon: 'Sparkles',
    description: 'Уникальные и секретные достижения',
  },
};

// Экспортируем тип для обратной совместимости
export type Achievement = AchievementData;

/**
 * Банк всех доступных достижений в приложении
 * Организованы по категориям: уроки, миссии, стрики, социальные, особые
 */
export const ACHIEVEMENTS: AchievementData[] = [
  // ==================== УРОКИ ====================
  {
    key: "first_lesson",
    title: "Первые шаги",
    description: "Завершите свой первый урок",
    icon: "Baby",
    category: "lessons",
    rarity: "common",
    xp_reward: 25,
    unlock_condition: { type: "lessons_completed", value: 1 }
  },
  {
    key: "lessons_5",
    title: "Ученик",
    description: "Завершите 5 уроков",
    icon: "BookOpen",
    category: "lessons",
    rarity: "common",
    xp_reward: 50,
    unlock_condition: { type: "lessons_completed", value: 5 }
  },
  {
    key: "lessons_10",
    title: "Прилежный студент",
    description: "Завершите 10 уроков",
    icon: "GraduationCap",
    category: "lessons",
    rarity: "rare",
    xp_reward: 100,
    unlock_condition: { type: "lessons_completed", value: 10 }
  },
  {
    key: "lessons_25",
    title: "Знаток харизмы",
    description: "Завершите 25 уроков",
    icon: "Star",
    category: "lessons",
    rarity: "epic",
    xp_reward: 200,
    unlock_condition: { type: "lessons_completed", value: 25 }
  },
  {
    key: "lessons_50",
    title: "Мастер общения",
    description: "Завершите 50 уроков",
    icon: "Crown",
    category: "lessons",
    rarity: "legendary",
    xp_reward: 500,
    unlock_condition: { type: "lessons_completed", value: 50 }
  },
  {
    key: "perfect_lesson",
    title: "Безупречность",
    description: "Пройдите урок без единой ошибки",
    icon: "Target",
    category: "lessons",
    rarity: "rare",
    xp_reward: 75,
    unlock_condition: { type: "perfect_lesson", value: 1 }
  },

  // ==================== СТРИКИ ====================
  {
    key: "streak_3",
    title: "Начало привычки",
    description: "Проходите уроки 3 дня подряд",
    icon: "Flame",
    category: "streaks",
    rarity: "common",
    xp_reward: 30,
    unlock_condition: { type: "streak_days", value: 3 }
  },
  {
    key: "streak_7",
    title: "Неделя знаний",
    description: "Проходите уроки 7 дней подряд",
    icon: "Calendar",
    category: "streaks",
    rarity: "rare",
    xp_reward: 100,
    unlock_condition: { type: "streak_days", value: 7 }
  },
  {
    key: "streak_14",
    title: "Две недели силы",
    description: "Проходите уроки 14 дней подряд",
    icon: "Zap",
    category: "streaks",
    rarity: "epic",
    xp_reward: 250,
    unlock_condition: { type: "streak_days", value: 14 }
  },
  {
    key: "streak_30",
    title: "Месяц триумфа",
    description: "Проходите уроки 30 дней подряд",
    icon: "Trophy",
    category: "streaks",
    rarity: "legendary",
    xp_reward: 600,
    unlock_condition: { type: "streak_days", value: 30 }
  },
  {
    key: "streak_comeback",
    title: "Возвращение легенды",
    description: "Восстановите стрик после его потери",
    icon: "RefreshCw",
    category: "streaks",
    rarity: "rare",
    xp_reward: 50,
    unlock_condition: { type: "streak_restored", value: 1 }
  },

  // ==================== МИССИИ ====================
  {
    key: "first_mission",
    title: "В реальный мир",
    description: "Выполните первое реальное задание",
    icon: "MapPin",
    category: "missions",
    rarity: "common",
    xp_reward: 30,
    unlock_condition: { type: "missions_completed", value: 1 }
  },
  {
    key: "missions_5",
    title: "Активист",
    description: "Выполните 5 реальных заданий",
    icon: "CheckCircle",
    category: "missions",
    rarity: "common",
    xp_reward: 60,
    unlock_condition: { type: "missions_completed", value: 5 }
  },
  {
    key: "missions_10",
    title: "Практик харизмы",
    description: "Выполните 10 реальных заданий",
    icon: "Sparkles",
    category: "missions",
    rarity: "rare",
    xp_reward: 150,
    unlock_condition: { type: "missions_completed", value: 10 }
  },
  {
    key: "missions_25",
    title: "Социальный герой",
    description: "Выполните 25 реальных заданий",
    icon: "Award",
    category: "missions",
    rarity: "epic",
    xp_reward: 300,
    unlock_condition: { type: "missions_completed", value: 25 }
  },
  {
    key: "weekly_challenge",
    title: "Челленджер",
    description: "Завершите недельный челлендж",
    icon: "Flag",
    category: "missions",
    rarity: "rare",
    xp_reward: 100,
    unlock_condition: { type: "weekly_challenge_completed", value: 1 }
  },
  {
    key: "mission_streak_7",
    title: "Неделя в реальности",
    description: "Выполняйте миссии 7 дней подряд",
    icon: "Rocket",
    category: "missions",
    rarity: "epic",
    xp_reward: 200,
    unlock_condition: { type: "mission_streak_days", value: 7 }
  },

  // ==================== СОЦИАЛЬНЫЕ ====================
  {
    key: "smalltalk_complete",
    title: "Мастер светских бесед",
    description: "Завершите все уроки по SmallTalk",
    icon: "MessageCircle",
    category: "social",
    rarity: "epic",
    xp_reward: 200,
    unlock_condition: { type: "skill_completed", value: 1 }
  },
  {
    key: "confidence_complete",
    title: "Уверенность в себе",
    description: "Завершите все уроки по уверенности",
    icon: "Shield",
    category: "social",
    rarity: "epic",
    xp_reward: 200,
    unlock_condition: { type: "skill_completed", value: 1 }
  },
  {
    key: "networking_complete",
    title: "Мастер нетворкинга",
    description: "Завершите все уроки по нетворкингу",
    icon: "Users",
    category: "social",
    rarity: "epic",
    xp_reward: 200,
    unlock_condition: { type: "skill_completed", value: 1 }
  },
  {
    key: "leadership_complete",
    title: "Лидер от природы",
    description: "Завершите все уроки по лидерству",
    icon: "TrendingUp",
    category: "social",
    rarity: "epic",
    xp_reward: 200,
    unlock_condition: { type: "skill_completed", value: 1 }
  },
  {
    key: "all_skills_complete",
    title: "Гуру харизмы",
    description: "Завершите все навыки дерева умений",
    icon: "Sparkle",
    category: "social",
    rarity: "legendary",
    xp_reward: 1000,
    unlock_condition: { type: "all_skills_completed", value: 1 }
  },

  // ==================== ОСОБЫЕ ====================
  {
    key: "night_owl",
    title: "Полуночник",
    description: "Завершите урок после 23:00",
    icon: "Moon",
    category: "special",
    rarity: "rare",
    xp_reward: 50,
    unlock_condition: { type: "late_night_lesson", value: 1 },
    is_hidden: true
  },
  {
    key: "early_bird",
    title: "Ранняя пташка",
    description: "Завершите урок до 6:00 утра",
    icon: "Sunrise",
    category: "special",
    rarity: "rare",
    xp_reward: 50,
    unlock_condition: { type: "early_morning_lesson", value: 1 },
    is_hidden: true
  },
  {
    key: "speed_demon",
    title: "Скоростной демон",
    description: "Завершите урок менее чем за 2 минуты",
    icon: "Gauge",
    category: "special",
    rarity: "rare",
    xp_reward: 75,
    unlock_condition: { type: "fast_lesson", value: 1 },
    is_hidden: true
  },
  {
    key: "comeback_king",
    title: "Король возвращений",
    description: "Вернитесь в приложение после 30 дней отсутствия",
    icon: "RotateCcw",
    category: "special",
    rarity: "epic",
    xp_reward: 100,
    unlock_condition: { type: "long_break_return", value: 1 },
    is_hidden: true
  },
  {
    key: "weekend_warrior",
    title: "Воин выходного дня",
    description: "Завершите 10 уроков в выходные",
    icon: "Coffee",
    category: "special",
    rarity: "rare",
    xp_reward: 80,
    unlock_condition: { type: "weekend_lessons", value: 10 },
    is_hidden: true
  },
  {
    key: "marathon_runner",
    title: "Марафонец знаний",
    description: "Завершите 5 уроков за один день",
    icon: "Activity",
    category: "special",
    rarity: "epic",
    xp_reward: 150,
    unlock_condition: { type: "daily_lessons", value: 5 },
    is_hidden: true
  },
  {
    key: "first_login",
    title: "Добро пожаловать!",
    description: "Зарегистрируйтесь в приложении",
    icon: "PartyPopper",
    category: "special",
    rarity: "common",
    xp_reward: 10,
    unlock_condition: { type: "registration", value: 1 }
  },
  {
    key: "profile_complete",
    title: "Персонализация",
    description: "Заполните профиль и выберите цели",
    icon: "UserCircle",
    category: "special",
    rarity: "common",
    xp_reward: 20,
    unlock_condition: { type: "profile_completed", value: 1 }
  },
];

/**
 * Получить достижение по ключу
 */
export function getAchievementByKey(key: string): AchievementData | undefined {
  return ACHIEVEMENTS.find(achievement => achievement.key === key);
}

/**
 * Получить достижения по категории
 */
export function getAchievementsByCategory(category: string): AchievementData[] {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category);
}

/**
 * Получить достижения по редкости
 */
export function getAchievementsByRarity(rarity: string): AchievementData[] {
  return ACHIEVEMENTS.filter(achievement => achievement.rarity === rarity);
}

/**
 * Получить все скрытые достижения
 */
export function getHiddenAchievements(): AchievementData[] {
  return ACHIEVEMENTS.filter(achievement => achievement.is_hidden === true);
}
