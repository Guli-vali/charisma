'use client';

import React from 'react';
import { BookOpen, Target, Flame, Calendar, Award, TrendingUp, Clock, Star } from 'lucide-react';
import type { UserStats } from '@/lib/profile';

interface ProfileStatsProps {
  stats: UserStats;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const statCards: StatCard[] = [
    {
      label: 'Уроков завершено',
      value: stats.total_lessons,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Миссий выполнено',
      value: stats.total_missions,
      icon: <Target className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Текущий стрик',
      value: `${stats.current_streak} дней`,
      icon: <Flame className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Самый длинный стрик',
      value: `${stats.longest_streak} дней`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Активных дней',
      value: stats.days_active,
      icon: <Calendar className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Достижений',
      value: stats.achievements_count,
      icon: <Award className="w-6 h-6" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Времени в приложении',
      value: `${Math.floor(stats.total_practice_time / 60)} ч`,
      icon: <Clock className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Средний балл',
      value: stats.average_lesson_score ? `${Math.round(stats.average_lesson_score)}%` : 'N/A',
      icon: <Star className="w-6 h-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  const accountAge = calculateAccountAge(stats.join_date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Статистика</h2>
          <p className="text-sm text-gray-600 mt-1">
            С нами с {new Date(stats.join_date).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })} ({accountAge})
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} rounded-xl p-3`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      {stats.favorite_category && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-3 shadow-md">
              <Star className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Любимая категория</p>
              <p className="text-xl font-bold text-gray-900">{formatCategoryName(stats.favorite_category)}</p>
            </div>
          </div>
        </div>
      )}

      {/* XP Progress */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Общий опыт</h3>
            <p className="text-sm text-gray-600">Заработано за все время</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {stats.total_xp.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">XP</p>
          </div>
        </div>
        
        {/* XP Breakdown */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {stats.total_lessons > 0 ? Math.round(stats.total_xp / stats.total_lessons) : 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">XP за урок</p>
          </div>
          <div className="text-center border-l border-r border-gray-200">
            <p className="text-2xl font-bold text-purple-600">
              {stats.days_active > 0 ? Math.round(stats.total_xp / stats.days_active) : 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">XP в день</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">
              {stats.total_missions > 0 ? Math.round((stats.total_xp - stats.total_lessons * 50) / stats.total_missions) : 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">XP за миссию</p>
          </div>
        </div>
      </div>

      {/* Consistency Score */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Показатели эффективности</h3>
        
        <div className="space-y-4">
          {/* Streak Consistency */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Постоянство стрика</span>
              <span className="text-sm font-semibold text-gray-900">
                {calculateStreakConsistency(stats.current_streak, stats.longest_streak)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${calculateStreakConsistency(stats.current_streak, stats.longest_streak)}%` }}
              />
            </div>
          </div>

          {/* Activity Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Активность</span>
              <span className="text-sm font-semibold text-gray-900">
                {calculateActivityRate(stats.days_active, stats.join_date)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${calculateActivityRate(stats.days_active, stats.join_date)}%` }}
              />
            </div>
          </div>

          {/* Lesson Completion */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Успеваемость</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.average_lesson_score ? Math.round(stats.average_lesson_score) : 0}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.average_lesson_score || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

function calculateAccountAge(joinDate: string): string {
  const joined = new Date(joinDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joined.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`;
    }
    return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'} ${remainingMonths} ${remainingMonths === 1 ? 'месяц' : remainingMonths < 5 ? 'месяца' : 'месяцев'}`;
  }
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

function calculateStreakConsistency(currentStreak: number, longestStreak: number): number {
  if (longestStreak === 0) return 0;
  return Math.min(100, Math.round((currentStreak / longestStreak) * 100));
}

function calculateActivityRate(daysActive: number, joinDate: string): number {
  const joined = new Date(joinDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joined.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  return Math.min(100, Math.round((daysActive / totalDays) * 100));
}

