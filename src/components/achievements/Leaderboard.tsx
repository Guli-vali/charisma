/**
 * 🏆 Глобальный рейтинг
 * Отображает топ игроков по XP
 */

'use client';

import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { LeagueParticipant, getGlobalLeaderboard, getWeeklyLeaderboard } from '@/lib/leagues';
import { Card } from '@/components/ui/Card';

type LeaderboardType = 'global' | 'weekly';

interface LeaderboardProps {
  currentUserId?: string;
  limit?: number;
}

export function Leaderboard({ currentUserId, limit = 100 }: LeaderboardProps) {
  const [type, setType] = useState<LeaderboardType>('global');
  const [participants, setParticipants] = useState<LeagueParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [type]);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const data = type === 'global' 
        ? await getGlobalLeaderboard(limit) 
        : await getWeeklyLeaderboard(limit);
      setParticipants(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icons.Trophy className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Рейтинг</h2>
              <p className="text-sm opacity-90">Соревнуйтесь с лучшими</p>
            </div>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setType('global')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              type === 'global'
                ? 'bg-white text-indigo-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Общий рейтинг
          </button>
          <button
            onClick={() => setType('weekly')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              type === 'weekly'
                ? 'bg-white text-indigo-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Неделя
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <Icons.Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Загрузка рейтинга...</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-12">
            <Icons.Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Пока нет участников</p>
          </div>
        ) : (
          <div className="space-y-2">
            {participants.map((participant, index) => {
              const isCurrentUser = participant.id === currentUserId;
              const isTop3 = index < 3;

              return (
                <div
                  key={participant.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-500 shadow-md'
                      : isTop3
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                      index === 0
                        ? 'bg-yellow-400 text-yellow-900 text-lg'
                        : index === 1
                        ? 'bg-gray-300 text-gray-700 text-lg'
                        : index === 2
                        ? 'bg-orange-400 text-orange-900 text-lg'
                        : 'bg-gray-200 text-gray-600 text-sm'
                    }`}
                  >
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>

                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                      isCurrentUser
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-indigo-400'
                        : 'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}
                  >
                    {participant.username.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold truncate ${
                          isCurrentUser ? 'text-indigo-900' : 'text-gray-900'
                        }`}
                      >
                        {participant.username}
                      </span>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                          Вы
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Icons.TrendingUp className="w-3 h-3" />
                        Уровень {participant.level}
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Icons.Zap className="w-4 h-4 text-yellow-600" />
                      <span
                        className={`text-lg font-bold ${
                          isCurrentUser ? 'text-indigo-900' : 'text-gray-900'
                        }`}
                      >
                        {type === 'global' ? participant.total_xp : participant.season_xp}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Компактная версия рейтинга (топ-5)
 */
export function LeaderboardMini({ currentUserId }: { currentUserId?: string }) {
  const [participants, setParticipants] = useState<LeagueParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const data = await getGlobalLeaderboard(5);
      setParticipants(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Icons.Trophy className="w-5 h-5 text-yellow-600" />
          Топ игроков
        </h3>
      </div>

      {loading ? (
        <div className="text-center py-6">
          <Icons.Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
        </div>
      ) : participants.length === 0 ? (
        <div className="text-center py-6">
          <Icons.Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Пока нет других игроков</p>
        </div>
      ) : participants.length === 1 ? (
        <>
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50 border border-indigo-200"
            >
              <span className="w-6 text-center font-bold text-sm">🥇</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                {participant.username.substring(0, 2).toUpperCase()}
              </div>
              <span className="flex-1 text-sm font-medium text-gray-900 truncate">
                {participant.username}
              </span>
              <span className="text-sm font-bold text-gray-700">{participant.total_xp}</span>
            </div>
          ))}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-2">
            <p className="text-xs text-blue-800 text-center">
              💡 Вы пока один в системе! Пригласите друзей, чтобы соревноваться.
            </p>
          </div>
        </>
      ) : (
        participants.map((participant, index) => (
          <div
            key={participant.id}
            className={`flex items-center gap-2 p-2 rounded-lg ${
              participant.id === currentUserId ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'
            }`}
          >
            {/* Rank */}
            <span className="w-6 text-center font-bold text-sm">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
            </span>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              {participant.username.substring(0, 2).toUpperCase()}
            </div>

            {/* Name */}
            <span className="flex-1 text-sm font-medium text-gray-900 truncate">
              {participant.username}
            </span>

            {/* XP */}
            <span className="text-sm font-bold text-gray-700">{participant.total_xp}</span>
          </div>
        ))
      )}
    </div>
  );
}

