import pb from './pocketbase';
import { League, LeagueRanking, User } from './types';

/**
 * Определение лиг по уровню XP
 */
export const LEAGUE_DEFINITIONS = [
  {
    name: 'Бронзовая лига',
    level: 1,
    min_xp: 0,
    max_xp: 499,
    icon: 'Medal',
    color: '#cd7f32',
  },
  {
    name: 'Серебряная лига',
    level: 2,
    min_xp: 500,
    max_xp: 1499,
    icon: 'Medal',
    color: '#c0c0c0',
  },
  {
    name: 'Золотая лига',
    level: 3,
    min_xp: 1500,
    max_xp: 3499,
    icon: 'Medal',
    color: '#ffd700',
  },
  {
    name: 'Платиновая лига',
    level: 4,
    min_xp: 3500,
    max_xp: 6999,
    icon: 'Crown',
    color: '#e5e4e2',
  },
  {
    name: 'Алмазная лига',
    level: 5,
    min_xp: 7000,
    max_xp: Infinity,
    icon: 'Gem',
    color: '#b9f2ff',
  },
];

/**
 * Получить лигу пользователя по XP
 */
export function getLeagueByXp(xp: number): typeof LEAGUE_DEFINITIONS[0] {
  for (const league of LEAGUE_DEFINITIONS) {
    if (xp >= league.min_xp && xp <= league.max_xp) {
      return league;
    }
  }
  return LEAGUE_DEFINITIONS[0]; // По умолчанию бронзовая
}

/**
 * Получить следующую лигу
 */
export function getNextLeague(currentXp: number): typeof LEAGUE_DEFINITIONS[0] | null {
  const currentLeague = getLeagueByXp(currentXp);
  const nextLeague = LEAGUE_DEFINITIONS.find(league => league.level === currentLeague.level + 1);
  return nextLeague || null;
}

/**
 * Получить информацию о лиге пользователя
 */
export async function getUserLeague(userId: string): Promise<{
  current: typeof LEAGUE_DEFINITIONS[0];
  next: typeof LEAGUE_DEFINITIONS[0] | null;
  xp_to_next: number;
  position_in_league: number;
}> {
  try {
    const user = await pb.client.collection('users').getOne(userId, {
      requestKey: null,
    });
    const current = getLeagueByXp(user.experience_points);
    const next = getNextLeague(user.experience_points);
    
    const xp_to_next = next ? next.min_xp - user.experience_points : 0;

    // Получаем позицию в текущей лиге
    const usersInLeague = await pb.client.collection('users').getFullList({
      filter: `experience_points >= ${current.min_xp} && experience_points <= ${current.max_xp}`,
      sort: '-experience_points',
      requestKey: null, // Отключаем автоотмену
    });

    const position = usersInLeague.findIndex(u => u.id === userId) + 1;

    return {
      current,
      next,
      xp_to_next,
      position_in_league: position,
    };
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      return {
        current: LEAGUE_DEFINITIONS[0],
        next: LEAGUE_DEFINITIONS[1],
        xp_to_next: 500,
        position_in_league: 0,
      };
    }
    console.error('Error getting user league:', error);
    return {
      current: LEAGUE_DEFINITIONS[0],
      next: LEAGUE_DEFINITIONS[1],
      xp_to_next: 500,
      position_in_league: 0,
    };
  }
}

/**
 * Получить рейтинг лиги (топ пользователей)
 */
export async function getLeagueRanking(
  leagueLevel: number,
  limit: number = 10
): Promise<LeagueRanking[]> {
  try {
    const league = LEAGUE_DEFINITIONS.find(l => l.level === leagueLevel);
    if (!league) return [];

    const users = await pb.client.collection('users').getList(1, limit, {
      filter: `experience_points >= ${league.min_xp} && experience_points <= ${league.max_xp}`,
      sort: '-experience_points',
      requestKey: null, // Отключаем автоотмену
    });

    return users.items.map((user, index) => ({
      user_id: user.id,
      name: user.name,
      avatar_url: user.avatar_url,
      experience_points: user.experience_points,
      position: index + 1,
    }));
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      return [];
    }
    console.error('Error getting league ranking:', error);
    return [];
  }
}

/**
 * Получить глобальный рейтинг
 */
export async function getGlobalRanking(
  limit: number = 100
): Promise<LeagueRanking[]> {
  try {
    const users = await pb.client.collection('users').getList(1, limit, {
      sort: '-experience_points',
      requestKey: null, // Отключаем автоотмену
    });

    return users.items.map((user, index) => ({
      user_id: user.id,
      name: user.name,
      avatar_url: user.avatar_url,
      experience_points: user.experience_points,
      position: index + 1,
    }));
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      return [];
    }
    console.error('Error getting global ranking:', error);
    return [];
  }
}

/**
 * Продвинуть пользователя в следующую лигу (если достиг требуемого XP)
 */
export async function promoteToNextLeague(userId: string): Promise<boolean> {
  try {
    const user = await pb.client.collection('users').getOne(userId, {
      requestKey: null, // Отключаем автоотмену
    });
    const currentLeague = getLeagueByXp(user.experience_points);
    const nextLeague = getNextLeague(user.experience_points);

    if (!nextLeague) {
      // Пользователь уже в максимальной лиге
      return false;
    }

    if (user.experience_points >= nextLeague.min_xp) {
      // Обновляем лигу пользователя
      await pb.client.collection('users').update(userId, {
        current_league: nextLeague.name.toLowerCase().split(' ')[0], // "bronze", "silver" и т.д.
      }, {
        requestKey: null, // Отключаем автоотмену
      });
      return true;
    }

    return false;
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      return false;
    }
    console.error('Error promoting to next league:', error);
    return false;
  }
}

/**
 * Получить статистику сезона лиги
 */
export async function getLeagueSeasonStats(leagueId: string): Promise<{
  total_users: number;
  average_xp: number;
  top_user: LeagueRanking | null;
}> {
  try {
    const league = await pb.client.collection('leagues').getOne(leagueId, {
      requestKey: null,
    });
    const leagueDef = LEAGUE_DEFINITIONS.find(l => l.level === league.level);
    
    if (!leagueDef) {
      return { total_users: 0, average_xp: 0, top_user: null };
    }

    const users = await pb.client.collection('users').getFullList({
      filter: `experience_points >= ${leagueDef.min_xp} && experience_points <= ${leagueDef.max_xp}`,
      sort: '-experience_points',
      requestKey: null, // Отключаем автоотмену
    });

    const total_users = users.length;
    const average_xp = users.reduce((sum, user) => sum + user.experience_points, 0) / total_users;
    
    const top_user = users.length > 0 ? {
      user_id: users[0].id,
      name: users[0].name,
      avatar_url: users[0].avatar_url,
      experience_points: users[0].experience_points,
      position: 1,
    } : null;

    return {
      total_users,
      average_xp: Math.round(average_xp),
      top_user,
    };
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      return { total_users: 0, average_xp: 0, top_user: null };
    }
    console.error('Error getting league season stats:', error);
    return { total_users: 0, average_xp: 0, top_user: null };
  }
}

/**
 * Расчет наград за сезон (для топ позиций)
 */
export function calculateSeasonRewards(position: number): {
  xp_bonus: number;
  title: string;
  description: string;
} {
  if (position === 1) {
    return {
      xp_bonus: 500,
      title: '🥇 Чемпион лиги',
      description: 'Первое место в сезоне',
    };
  } else if (position === 2) {
    return {
      xp_bonus: 300,
      title: '🥈 Вице-чемпион',
      description: 'Второе место в сезоне',
    };
  } else if (position === 3) {
    return {
      xp_bonus: 200,
      title: '🥉 Бронзовый призер',
      description: 'Третье место в сезоне',
    };
  } else if (position <= 10) {
    return {
      xp_bonus: 100,
      title: '🏆 Топ-10',
      description: 'Вошли в топ-10 лиги',
    };
  } else {
    return {
      xp_bonus: 0,
      title: 'Участник',
      description: 'Спасибо за участие',
    };
  }
}

/**
 * Получить пользователей той же лиги (для сравнения)
 */
export async function getLeagueCompetitors(
  userId: string,
  limit: number = 5
): Promise<LeagueRanking[]> {
  try {
    const user = await pb.client.collection('users').getOne(userId, {
      requestKey: null,
    });
    const currentLeague = getLeagueByXp(user.experience_points);

    const competitors = await pb.client.collection('users').getList(1, limit, {
      filter: `experience_points >= ${currentLeague.min_xp} && experience_points <= ${currentLeague.max_xp} && id != "${userId}"`,
      sort: '-experience_points',
      requestKey: null, // Отключаем автоотмену
    });

    return competitors.items.map((user, index) => ({
      user_id: user.id,
      name: user.name,
      avatar_url: user.avatar_url,
      experience_points: user.experience_points,
      position: index + 1,
    }));
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      return [];
    }
    console.error('Error getting league competitors:', error);
    return [];
  }
}

/**
 * Типы для компонента LeagueCard (обратная совместимость)
 */
export interface UserLeagueInfo {
  league: {
    name: string;
    level: number;
    icon: string;
    color: string;
    min_xp: number;
    max_xp: number;
    max_users: number;
    rewards?: {
      top1?: { xp: number; badge?: boolean };
      top3?: { xp: number };
      top10?: { xp: number };
    };
  };
  rank: number;
  participants_count: number;
  top_participants: Array<{
    id: string;
    username: string;
    level: number;
    season_xp: number;
  }>;
  xp_to_next_league: number | null;
  days_until_season_end: number;
}

/**
 * Тип для участника рейтинга
 */
export interface LeagueParticipant {
  id: string;
  username: string;
  level: number;
  total_xp: number;
  season_xp: number;
}

/**
 * Получить глобальный рейтинг лидеров
 */
export async function getGlobalLeaderboard(limit: number = 100): Promise<LeagueParticipant[]> {
  try {
    const users = await pb.client.collection('users').getList(1, limit, {
      sort: '-experience_points',
      requestKey: null, // Отключаем автоотмену
    });

    console.log('Leaderboard fetched:', users.items.length, 'users');

    const participants = users.items.map(user => ({
      id: user.id,
      username: user.name || user.email.split('@')[0],
      level: Math.floor((user.experience_points || 0) / 100) + 1,
      total_xp: user.experience_points || 0,
      season_xp: user.experience_points || 0, // TODO: реализовать сезонный XP
    }));

    console.log('Leaderboard participants:', participants);
    return participants;
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      return [];
    }
    console.error('Error getting global leaderboard:', error);
    return [];
  }
}

/**
 * Получить недельный рейтинг лидеров
 */
export async function getWeeklyLeaderboard(limit: number = 100): Promise<LeagueParticipant[]> {
  try {
    // TODO: Реализовать фильтрацию по неделе
    // Пока возвращаем глобальный рейтинг
    return getGlobalLeaderboard(limit);
  } catch (error) {
    console.error('Error getting weekly leaderboard:', error);
    return [];
  }
}
