import type { MissionCategory, MissionDifficulty } from '@/lib/types';

interface MissionTemplate {
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
}

export const MISSIONS_BANK: Record<MissionCategory, Record<MissionDifficulty, MissionTemplate[]>> = {
  smalltalk: {
    easy: [
      {
        title: 'Поздоровайся с 3 незнакомыми людьми',
        description: 'Скажи "Здравствуйте" или "Добрый день" трем незнакомцам',
        icon: '👋',
        xp_reward: 5,
      },
      {
        title: 'Задай кассиру вопрос о его дне',
        description: 'Спроси "Как дела?" или "Как день проходит?" у кассира в магазине',
        icon: '💬',
        xp_reward: 5,
      },
      {
        title: 'Сделай комплимент коллеге',
        description: 'Искренне похвали коллегу за что-то конкретное',
        icon: '✨',
        xp_reward: 5,
      },
      {
        title: 'Улыбнись 5 людям',
        description: 'Улыбнись пяти разным людям в течение дня',
        icon: '😊',
        xp_reward: 5,
      },
    ],
    medium: [
      {
        title: 'Начни разговор в лифте',
        description: 'Заведи непринужденную беседу с человеком в лифте',
        icon: '🗨️',
        xp_reward: 10,
      },
      {
        title: 'Поддерживай беседу 5+ минут с незнакомцем',
        description: 'Найди общую тему и говори минимум 5 минут',
        icon: '⏱️',
        xp_reward: 10,
      },
      {
        title: 'Познакомься с кем-то новым на работе',
        description: 'Представься человеку, с которым еще не знаком',
        icon: '🤝',
        xp_reward: 10,
      },
      {
        title: 'Начни разговор в очереди',
        description: 'Заговори с кем-то в очереди о чем угодно',
        icon: '👥',
        xp_reward: 10,
      },
    ],
    hard: [
      {
        title: 'Подойди к интересному человеку в кафе',
        description: 'Заведи разговор с незнакомцем, который кажется интересным',
        icon: '☕',
        xp_reward: 15,
      },
      {
        title: 'Заведи разговор на networking событии',
        description: 'Подойди к незнакомцу и начни профессиональную беседу',
        icon: '🎯',
        xp_reward: 15,
      },
      {
        title: 'Выступи с инициативой на встрече',
        description: 'Предложи свою идею на групповой встрече',
        icon: '💡',
        xp_reward: 15,
      },
    ],
  },
  confidence: {
    easy: [
      {
        title: 'Держи спину ровно весь день',
        description: 'Следи за осанкой в течение всего дня',
        icon: '🧍',
        xp_reward: 5,
      },
      {
        title: 'Говори на 20% громче обычного',
        description: 'Увеличь громкость голоса для уверенности',
        icon: '📢',
        xp_reward: 5,
      },
      {
        title: 'Смотри в глаза при разговоре',
        description: 'Поддерживай зрительный контакт в 3 разговорах',
        icon: '👁️',
        xp_reward: 5,
      },
      {
        title: 'Скажи "нет" без извинений',
        description: 'Откажись от просьбы уверенно, не извиняясь',
        icon: '🚫',
        xp_reward: 5,
      },
    ],
    medium: [
      {
        title: 'Выскажи свое мнение в групповом чате',
        description: 'Поделись своим взглядом на обсуждаемую тему',
        icon: '💭',
        xp_reward: 10,
      },
      {
        title: 'Попроси скидку в магазине',
        description: 'Вежливо попроси скидку или бонус',
        icon: '💰',
        xp_reward: 10,
      },
      {
        title: 'Выступи первым на встрече',
        description: 'Будь первым, кто начнет обсуждение',
        icon: '🎤',
        xp_reward: 10,
      },
      {
        title: 'Дай обратную связь коллеге',
        description: 'Предоставь конструктивный фидбек',
        icon: '📝',
        xp_reward: 10,
      },
    ],
    hard: [
      {
        title: 'Выступи перед группой (5+ человек)',
        description: 'Расскажи что-то группе людей',
        icon: '🎭',
        xp_reward: 15,
      },
      {
        title: 'Защити свою позицию в споре',
        description: 'Аргументированно отстой свою точку зрения',
        icon: '⚔️',
        xp_reward: 15,
      },
    ],
  },
  networking: {
    easy: [
      {
        title: 'Добавь 2 новых контакта в LinkedIn',
        description: 'Найди и добавь двух интересных людей',
        icon: '🔗',
        xp_reward: 5,
      },
      {
        title: 'Напиши сообщение старому знакомому',
        description: 'Восстанови связь с человеком, с которым давно не общался',
        icon: '📱',
        xp_reward: 5,
      },
      {
        title: 'Представь двух людей друг другу',
        description: 'Познакомь двух своих знакомых',
        icon: '🤝',
        xp_reward: 5,
      },
    ],
    medium: [
      {
        title: 'Посети networking событие',
        description: 'Сходи на профессиональное мероприятие',
        icon: '🎪',
        xp_reward: 10,
      },
      {
        title: 'Обменяйся контактами с 3 новыми людьми',
        description: 'Получи контакты трех новых знакомых',
        icon: '📇',
        xp_reward: 10,
      },
      {
        title: 'Организуй встречу с коллегами',
        description: 'Пригласи коллег на кофе или обед',
        icon: '☕',
        xp_reward: 10,
      },
    ],
    hard: [
      {
        title: 'Выступи на публичном мероприятии',
        description: 'Возьми слово на конференции или митапе',
        icon: '🎤',
        xp_reward: 15,
      },
      {
        title: 'Организуй networking встречу',
        description: 'Создай и проведи мероприятие для знакомств',
        icon: '🎯',
        xp_reward: 15,
      },
    ],
  },
  leadership: {
    easy: [
      {
        title: 'Возьми инициативу в малой задаче',
        description: 'Предложи решение для небольшой проблемы',
        icon: '💡',
        xp_reward: 5,
      },
      {
        title: 'Помоги коллеге с задачей',
        description: 'Предложи помощь и поддержи кого-то',
        icon: '🤲',
        xp_reward: 5,
      },
      {
        title: 'Дай позитивный фидбек команде',
        description: 'Отметь хорошую работу команды или коллеги',
        icon: '👏',
        xp_reward: 5,
      },
    ],
    medium: [
      {
        title: 'Возглавь обсуждение',
        description: 'Веди групповое обсуждение или встречу',
        icon: '🎯',
        xp_reward: 10,
      },
      {
        title: 'Разреши конфликт между двумя людьми',
        description: 'Помоги двум людям найти компромисс',
        icon: '⚖️',
        xp_reward: 10,
      },
      {
        title: 'Делегируй задачу эффективно',
        description: 'Поручи задачу так, чтобы она была выполнена отлично',
        icon: '📋',
        xp_reward: 10,
      },
    ],
    hard: [
      {
        title: 'Возглавь проект',
        description: 'Стань лидером проекта или инициативы',
        icon: '👑',
        xp_reward: 15,
      },
      {
        title: 'Проведи презентацию для руководства',
        description: 'Представь свои идеи топ-менеджменту',
        icon: '📊',
        xp_reward: 15,
      },
    ],
  },
};

export function getRandomMissionByCategory(
  category: MissionCategory,
  difficulty: MissionDifficulty
): MissionTemplate | null {
  const missions = MISSIONS_BANK[category][difficulty];
  if (!missions || missions.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * missions.length);
  return missions[randomIndex];
}

export function getAllCategories(): MissionCategory[] {
  return ['smalltalk', 'confidence', 'networking', 'leadership'];
}

export function getDifficultyXP(difficulty: MissionDifficulty): number {
  switch (difficulty) {
    case 'easy': return 5;
    case 'medium': return 10;
    case 'hard': return 15;
    default: return 5;
  }
}
