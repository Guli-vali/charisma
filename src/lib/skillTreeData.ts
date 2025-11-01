import type { SkillTreeNode } from './types';

export const SKILL_TREE_DATA: SkillTreeNode[] = [
  // Level 1
  {
    id: 'greetings',
    name: 'Приветствия',
    description: 'Основы приветствия и первого впечатления',
    icon: '👋',
    level: 1,
    prerequisites: [],
    xp_reward: 100,
  },
  {
    id: 'smalltalk',
    name: 'SmallTalk',
    description: 'Искусство легкого общения и small talk',
    icon: '💬',
    level: 1,
    prerequisites: ['greetings'],
    xp_reward: 100,
  },
  {
    id: 'active_listening',
    name: 'Активное слушание',
    description: 'Техники эффективного слушания',
    icon: '👂',
    level: 1,
    prerequisites: ['smalltalk'],
    xp_reward: 100,
  },
  
  // Level 2
  {
    id: 'body_language',
    name: 'Язык тела',
    description: 'Чтение и использование языка тела',
    icon: '🤸',
    level: 2,
    prerequisites: ['active_listening'],
    xp_reward: 150,
  },
  {
    id: 'compliments',
    name: 'Комплименты',
    description: 'Искусство делать комплименты',
    icon: '✨',
    level: 2,
    prerequisites: ['body_language'],
    xp_reward: 150,
  },
  {
    id: 'stress_management',
    name: 'Работа со стрессом',
    description: 'Управление стрессом в общении',
    icon: '🧘',
    level: 2,
    prerequisites: ['compliments'],
    xp_reward: 150,
  },
  
  // Level 3
  {
    id: 'humor',
    name: 'Юмор',
    description: 'Использование юмора в общении',
    icon: '😄',
    level: 3,
    prerequisites: ['stress_management'],
    xp_reward: 200,
  },
  {
    id: 'storytelling',
    name: 'Сторителлинг',
    description: 'Рассказывание увлекательных историй',
    icon: '📖',
    level: 3,
    prerequisites: ['humor'],
    xp_reward: 200,
  },
  {
    id: 'influence',
    name: 'Влияние',
    description: 'Техники убеждения и влияния',
    icon: '🎯',
    level: 3,
    prerequisites: ['storytelling'],
    xp_reward: 200,
  },
  
  // Level 4
  {
    id: 'public_speaking',
    name: 'Публичные выступления',
    description: 'Мастерство публичных выступлений',
    icon: '🎤',
    level: 4,
    prerequisites: ['influence'],
    xp_reward: 250,
  },
  {
    id: 'negotiations',
    name: 'Переговоры',
    description: 'Искусство переговоров',
    icon: '🤝',
    level: 4,
    prerequisites: ['public_speaking'],
    xp_reward: 250,
  },
  {
    id: 'leadership',
    name: 'Лидерство',
    description: 'Развитие лидерских качеств',
    icon: '👑',
    level: 4,
    prerequisites: ['negotiations'],
    xp_reward: 250,
  },
];

export const getSkillById = (id: string): SkillTreeNode | undefined => {
  return SKILL_TREE_DATA.find(skill => skill.id === id);
};

export const getSkillsByLevel = (level: number): SkillTreeNode[] => {
  return SKILL_TREE_DATA.filter(skill => skill.level === level);
};

export const getTotalLevels = (): number => {
  return Math.max(...SKILL_TREE_DATA.map(skill => skill.level));
};
