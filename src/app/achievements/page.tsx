/**
 * 🏆 Страница достижений
 * Отображает все достижения пользователя с фильтрами и статистикой
 */

'use client';

import { useEffect, useState } from 'react';
import { Trophy, Lightbulb, BarChart3, BookOpen, Target, Flame, Users, Sparkles, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Утилита для затемнения/осветления цвета
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
import { AchievementsGrid } from '@/components/achievements/AchievementsGrid';
import { AchievementUnlocked } from '@/components/achievements/AchievementUnlocked';
import { LevelProgress } from '@/components/profile/LevelProgress';
import { LeaderboardMini } from '@/components/achievements/Leaderboard';
import { Card } from '@/components/ui/Card';
import { AchievementsSkeleton } from '@/components/ui';
import { getUserAchievements, UserAchievementRecord } from '@/lib/achievements';
import { getUserLeague } from '@/lib/leagues';
import { getLevelProgress, LevelProgress as LevelProgressType } from '@/lib/levels';
import { Achievement, ACHIEVEMENTS } from '@/data/achievements';
import pb from '@/lib/pocketbase';

export default function AchievementsPage() {
  const { user } = useAuth();
  const [userAchievements, setUserAchievements] = useState<UserAchievementRecord[]>([]);
  const [levelProgress, setLevelProgress] = useState<LevelProgressType | null>(null);
  const [leagueInfo, setLeagueInfo] = useState<any>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    completedMissions: 0,
    completedLessons: 0,
  });

  useEffect(() => {
    let mounted = true;
    
    if (user && mounted) {
      loadData(mounted);
    }
    
    return () => {
      mounted = false;
    };
  }, [user]);

  async function loadData(mounted: boolean) {
    if (!user || !mounted) return;

    setLoading(true);
    try {
      const [achievements, league, missions] = await Promise.all([
        getUserAchievements(user.id),
        getUserLeague(user.id).catch(() => null),
        // Получаем количество выполненных миссий
        pb.client.collection('user_missions').getFullList({
          filter: `user = "${user.id}" && status = "completed"`,
          requestKey: null,
        }).catch(() => []),
      ]);

      if (!mounted) return;

      setUserAchievements(achievements);
      setLeagueInfo(league);
      setLevelProgress(getLevelProgress(user.experience_points));
      setUserStats({
        completedMissions: missions.length,
        completedLessons: user.total_lessons_completed || 0,
      });
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }

  // Проверка авторизации
  if (!user) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Достижения</h1>
          </div>
          <p className="text-gray-600">
            Отслеживайте свой прогресс и разблокируйте новые награды
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Загрузка достижений...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Прогресс и статистика */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Уровень */}
              <div className="lg:col-span-2">
                {levelProgress && (
                  <LevelProgress
                    levelProgress={levelProgress}
                    variant="compact"
                  />
                )}
              </div>

              {/* Лига */}
              <div>
                {leagueInfo && leagueInfo.current && (
                  <div
                    className="p-4 rounded-lg text-white relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${leagueInfo.current.color} 0%, ${adjustColor(leagueInfo.current.color, -20)} 100%)`
                    }}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5" />
                          <span className="font-bold">{leagueInfo.current.name}</span>
                        </div>
                        <span className="text-2xl font-bold">#{leagueInfo.position_in_league}</span>
                      </div>
                      <div className="text-xs opacity-90">
                        {leagueInfo.next ? `${leagueInfo.xp_to_next} XP до следующей лиги` : 'Максимальная лига!'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Основной контент */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Достижения (3 колонки) */}
              <div className="lg:col-span-3">
                <AchievementsGrid
                  userAchievements={userAchievements}
                  onAchievementClick={setSelectedAchievement}
                />
              </div>

              {/* Боковая панель (1 колонка) */}
              <div className="space-y-6">
                {/* Топ игроков */}
                <Card className="p-6">
                  <LeaderboardMini currentUserId={user.id} />
                </Card>

                {/* Совет дня */}
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">Совет дня</h3>
                      <p className="text-sm text-blue-800">
                        Проходите уроки ежедневно, чтобы сохранить стрик и получать бонусные достижения!
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Статистика активности */}
                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Ваша активность
                  </h3>
                  <div className="space-y-4">
                    {/* Уроки */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">Уроки</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">
                          {userStats.completedLessons}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        Получено достижений: {userAchievements.filter(ua => ua.expand?.achievement?.category === 'lessons' && ua.progress === 100).length}/{ACHIEVEMENTS.filter(a => a.category === 'lessons').length}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ 
                            width: `${Math.min(100, (userAchievements.filter(ua => ua.expand?.achievement?.category === 'lessons' && ua.progress === 100).length / ACHIEVEMENTS.filter(a => a.category === 'lessons').length) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Миссии */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">Миссии</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          {userStats.completedMissions}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        Получено достижений: {userAchievements.filter(ua => ua.expand?.achievement?.category === 'missions' && ua.progress === 100).length}/{ACHIEVEMENTS.filter(a => a.category === 'missions').length}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ 
                            width: `${Math.min(100, (userAchievements.filter(ua => ua.expand?.achievement?.category === 'missions' && ua.progress === 100).length / ACHIEVEMENTS.filter(a => a.category === 'missions').length) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Стрик */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-gray-700">Текущий стрик</span>
                        </div>
                        <span className="text-sm font-bold text-orange-600">
                          {user.current_streak} {user.current_streak === 1 ? 'день' : user.current_streak < 5 ? 'дня' : 'дней'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        Получено достижений: {userAchievements.filter(ua => ua.expand?.achievement?.category === 'streaks' && ua.progress === 100).length}/{ACHIEVEMENTS.filter(a => a.category === 'streaks').length}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-orange-500"
                          style={{ 
                            width: `${Math.min(100, (userAchievements.filter(ua => ua.expand?.achievement?.category === 'streaks' && ua.progress === 100).length / ACHIEVEMENTS.filter(a => a.category === 'streaks').length) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Социальные достижения */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-700">Социальные</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {userAchievements.filter(ua => ua.expand?.achievement?.category === 'social' && ua.progress === 100).length}/{ACHIEVEMENTS.filter(a => a.category === 'social').length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{ 
                            width: `${Math.min(100, (userAchievements.filter(ua => ua.expand?.achievement?.category === 'social' && ua.progress === 100).length / ACHIEVEMENTS.filter(a => a.category === 'social').length) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Особые достижения */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-pink-600" />
                          <span className="text-sm font-medium text-gray-700">Особые</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {userAchievements.filter(ua => ua.expand?.achievement?.category === 'special' && ua.progress === 100).length}/{ACHIEVEMENTS.filter(a => a.category === 'special').length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-pink-500"
                          style={{ 
                            width: `${Math.min(100, (userAchievements.filter(ua => ua.expand?.achievement?.category === 'special' && ua.progress === 100).length / ACHIEVEMENTS.filter(a => a.category === 'special').length) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* XP статистика */}
                <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-amber-900 mb-1">
                      {user.experience_points}
                    </div>
                    <div className="text-sm text-amber-700">Всего заработано XP</div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно достижения */}
      {selectedAchievement && (
        <AchievementUnlocked
          achievement={selectedAchievement}
          isOpen={!!selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  );
}

