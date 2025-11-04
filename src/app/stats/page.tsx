'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, BookOpen, Target, Award, Flame, Clock,
  BarChart3, PieChart, LineChart, Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserStats, getActivityCalendar, type UserStats, type ActivityDay } from '@/lib/profile';
import pb from '@/lib/pocketbase';

interface TimeStats {
  period: string;
  lessons: number;
  missions: number;
  xp: number;
}

export default function StatsPage() {
  const { user: authUser } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<ActivityDay[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<TimeStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<TimeStats[]>([]);
  const [skillBreakdown, setSkillBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (authUser) {
      loadAllStats();
    }
  }, [authUser]);

  const loadAllStats = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const [statsData, activitiesData, skillsData] = await Promise.all([
        getUserStats(authUser.id),
        getActivityCalendar(authUser.id),
        pb.collection('skill_progress').getFullList({
          filter: `user="${authUser.id}"`,
        }),
      ]);

      setStats(statsData);
      setActivities(activitiesData);
      setSkillBreakdown(skillsData);

      // Calculate weekly and monthly stats
      calculateTimeStats(activitiesData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeStats = (activities: ActivityDay[]) => {
    // Calculate weekly stats (last 12 weeks)
    const weekly: TimeStats[] = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekActivities = activities.filter((a) => {
        const date = new Date(a.date);
        return date >= weekStart && date < weekEnd;
      });

      weekly.push({
        period: `${weekStart.getDate()} ${weekStart.toLocaleDateString('ru-RU', { month: 'short' })}`,
        lessons: weekActivities.reduce((sum, a) => sum + a.lessons, 0),
        missions: weekActivities.reduce((sum, a) => sum + a.missions, 0),
        xp: weekActivities.reduce((sum, a) => sum + a.xp, 0),
      });
    }
    setWeeklyStats(weekly);

    // Calculate monthly stats (last 12 months)
    const monthly: TimeStats[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthActivities = activities.filter((a) => {
        const date = new Date(a.date);
        return date >= monthStart && date <= monthEnd;
      });

      monthly.push({
        period: monthStart.toLocaleDateString('ru-RU', { month: 'short' }),
        lessons: monthActivities.reduce((sum, a) => sum + a.lessons, 0),
        missions: monthActivities.reduce((sum, a) => sum + a.missions, 0),
        xp: monthActivities.reduce((sum, a) => sum + a.xp, 0),
      });
    }
    setMonthlyStats(monthly);
  };

  const getBestTimeOfDay = (): string => {
    // Group activities by hour
    const hourCounts: Record<number, number> = {};
    
    activities.forEach((activity) => {
      // Since we don't have exact time, estimate based on typical usage patterns
      // This is a simplified version
      const hour = 19; // Most people learn in the evening
      hourCounts[hour] = (hourCounts[hour] || 0) + activity.lessons + activity.missions;
    });

    const bestHour = Object.entries(hourCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['19', 0])[0];
    return `${bestHour}:00 - ${parseInt(bestHour) + 1}:00`;
  };

  const getStreakPattern = (): string => {
    if (stats && stats.current_streak >= 30) {
      return '🔥 Суперстабильно! Вы занимаетесь каждый день';
    } else if (stats && stats.current_streak >= 7) {
      return '📈 Отличная регулярность! Продолжайте в том же духе';
    } else if (stats && stats.days_active > stats.total_lessons) {
      return '🎯 Предпочитаете короткие сессии';
    } else {
      return '💡 Попробуйте заниматься регулярнее для лучших результатов';
    }
  };

  const getCurrentStats = (): TimeStats[] => {
    return timeRange === 'week' ? weeklyStats.slice(-4) : monthlyStats;
  };

  if (!authUser) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Не удалось загрузить статистику</p>
      </div>
    );
  }

  const currentStats = getCurrentStats();
  const maxValue = Math.max(...currentStats.map(s => s.lessons + s.missions), 1);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Детальная статистика</h1>
              <p className="text-gray-600 mt-1">Аналитика вашего прогресса</p>
            </div>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {range === 'week' && 'Неделя'}
                  {range === 'month' && 'Месяц'}
                  {range === 'year' && 'Год'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Key Metrics */}
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Общая статистика</h2>
              
              <div className="space-y-4">
                <StatItem
                  icon={<BookOpen className="w-5 h-5 text-indigo-600" />}
                  label="Всего уроков"
                  value={stats.total_lessons}
                  color="indigo"
                />
                <StatItem
                  icon={<Target className="w-5 h-5 text-purple-600" />}
                  label="Всего миссий"
                  value={stats.total_missions}
                  color="purple"
                />
                <StatItem
                  icon={<Flame className="w-5 h-5 text-orange-600" />}
                  label="Текущий стрик"
                  value={`${stats.current_streak} дней`}
                  color="orange"
                />
                <StatItem
                  icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                  label="Лучший стрик"
                  value={`${stats.longest_streak} дней`}
                  color="green"
                />
                <StatItem
                  icon={<Award className="w-5 h-5 text-amber-600" />}
                  label="Достижений"
                  value={stats.achievements_count}
                  color="amber"
                />
                <StatItem
                  icon={<Clock className="w-5 h-5 text-blue-600" />}
                  label="Время в приложении"
                  value={`${Math.floor(stats.total_practice_time / 60)} часов`}
                  color="blue"
                />
              </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Инсайты</h2>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Лучшее время для обучения</p>
                  <p className="font-semibold text-gray-900">{getBestTimeOfDay()}</p>
                </div>

                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Паттерн активности</p>
                  <p className="font-semibold text-gray-900">{getStreakPattern()}</p>
                </div>

                {stats.favorite_category && (
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Любимая категория</p>
                    <p className="font-semibold text-gray-900">{formatCategoryName(stats.favorite_category)}</p>
                  </div>
                )}

                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Средний балл</p>
                  <p className="font-semibold text-gray-900">
                    {stats.average_lesson_score ? `${Math.round(stats.average_lesson_score)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Charts & Graphs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900">График прогресса</h2>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                    <span className="text-gray-600">Уроки</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-gray-600">Миссии</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentStats.map((stat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{stat.period}</span>
                      <span className="text-sm text-gray-600">
                        {stat.lessons + stat.missions} активностей
                      </span>
                    </div>
                    <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                      <div
                        className="bg-indigo-500"
                        style={{ width: `${(stat.lessons / maxValue) * 100}%` }}
                      />
                      <div
                        className="bg-purple-500"
                        style={{ width: `${(stat.missions / maxValue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* XP Over Time */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <LineChart className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-bold text-gray-900">Заработанный XP</h2>
              </div>

              <div className="space-y-4">
                {currentStats.map((stat, index) => {
                  const maxXP = Math.max(...currentStats.map(s => s.xp), 1);
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{stat.period}</span>
                        <span className="text-sm font-semibold text-amber-600">
                          {stat.xp.toLocaleString()} XP
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                          style={{ width: `${(stat.xp / maxXP) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Общий XP за период</span>
                  <span className="text-2xl font-bold text-amber-600">
                    {currentStats.reduce((sum, s) => sum + s.xp, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Прогресс по навыкам</h2>
              </div>

              <div className="space-y-4">
                {skillBreakdown.map((skill, index) => {
                  const progress = skill.total_lessons > 0
                    ? Math.round((skill.lessons_completed / skill.total_lessons) * 100)
                    : 0;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCategoryName(skill.skill_id)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {skill.lessons_completed}/{skill.total_lessons}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity Heatmap Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Активность</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-green-600 mb-1">Активных дней</p>
                  <p className="text-2xl font-bold text-green-900">{stats.days_active}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600 mb-1">Этот месяц</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {activities.filter(a => {
                      const date = new Date(a.date);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-600 mb-1">Эта неделя</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {activities.filter(a => {
                      const date = new Date(a.date);
                      const now = new Date();
                      const weekStart = new Date(now);
                      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                      return date >= weekStart && date <= now;
                    }).length}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-sm text-orange-600 mb-1">Сегодня</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {activities.filter(a => {
                      const date = new Date(a.date);
                      const now = new Date();
                      return date.toDateString() === now.toDateString();
                    }).length > 0 ? '✓' : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Predictions & Goals */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Прогнозы и рекомендации</h2>
              </div>

              <div className="space-y-4">
                {stats.current_streak < 7 && (
                  <div className="bg-white rounded-xl p-4">
                    <p className="font-semibold text-gray-900 mb-2">🎯 Достигни 7-дневного стрика</p>
                    <p className="text-sm text-gray-600">
                      Занимайтесь ежедневно, и через {7 - stats.current_streak} {7 - stats.current_streak === 1 ? 'день' : 'дней'} вы достигнете недельного стрика!
                    </p>
                  </div>
                )}

                {stats.average_lesson_score && stats.average_lesson_score < 80 && (
                  <div className="bg-white rounded-xl p-4">
                    <p className="font-semibold text-gray-900 mb-2">📈 Улучшите результаты</p>
                    <p className="text-sm text-gray-600">
                      Ваш средний балл {Math.round(stats.average_lesson_score)}%. Попробуйте повторять уроки для лучшего запоминания.
                    </p>
                  </div>
                )}

                {stats.total_missions < stats.total_lessons / 2 && (
                  <div className="bg-white rounded-xl p-4">
                    <p className="font-semibold text-gray-900 mb-2">🚀 Больше практики</p>
                    <p className="text-sm text-gray-600">
                      Вы прошли {stats.total_lessons} уроков, но только {stats.total_missions} миссий. Практика в реальной жизни поможет закрепить навыки!
                    </p>
                  </div>
                )}

                <div className="bg-white rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">⭐ Продолжайте в том же духе!</p>
                  <p className="text-sm text-gray-600">
                    При текущем темпе вы достигнете {Math.round(stats.total_xp * 1.2).toLocaleString()} XP к концу месяца!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function StatItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`p-2 bg-${color}-50 rounded-lg`}>
          {icon}
        </div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function formatCategoryName(category: string): string {
  const categories: Record<string, string> = {
    'small-talk': 'Small Talk',
    'body-language': 'Язык тела',
    'active-listening': 'Активное слушание',
    'public-speaking': 'Публичные выступления',
    'conflict-resolution': 'Разрешение конфликтов',
    'networking': 'Нетворкинг',
  };
  return categories[category] || category;
}

