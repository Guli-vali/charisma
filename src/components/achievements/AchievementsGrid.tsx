/**
 * 📊 Сетка достижений
 * Отображает сетку достижений с возможностью фильтрации
 */

'use client';

import { useState, useMemo } from 'react';
import { AchievementCard } from './AchievementCard';
import { Achievement, ACHIEVEMENTS, AchievementCategory, AchievementRarity, CATEGORY_INFO } from '@/data/achievements';
import { UserAchievementRecord } from '@/lib/achievements';
import * as Icons from 'lucide-react';

interface AchievementsGridProps {
  userAchievements: UserAchievementRecord[];
  onAchievementClick?: (achievement: Achievement) => void;
}

type FilterStatus = 'all' | 'earned' | 'in_progress' | 'locked';
type SortBy = 'date' | 'rarity' | 'progress';

export function AchievementsGrid({ userAchievements, onAchievementClick }: AchievementsGridProps) {
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  // Создаем мапу пользовательских достижений для быстрого доступа
  const userAchievementsMap = useMemo(() => {
    const map = new Map<string, UserAchievementRecord>();
    userAchievements.forEach(ua => {
      const achievementKey = ua.expand?.achievement?.key;
      if (achievementKey) {
        map.set(achievementKey, ua);
      }
    });
    return map;
  }, [userAchievements]);

  // Фильтрация и сортировка
  const filteredAchievements = useMemo(() => {
    let filtered = [...ACHIEVEMENTS];

    // Фильтр по категории
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => {
        const userAchievement = userAchievementsMap.get(a.key);
        if (statusFilter === 'earned') {
          return userAchievement && userAchievement.progress === 100;
        } else if (statusFilter === 'in_progress') {
          return userAchievement && userAchievement.progress > 0 && userAchievement.progress < 100;
        } else if (statusFilter === 'locked') {
          return !userAchievement || userAchievement.progress === 0;
        }
        return true;
      });
    }

    // Сортировка
    if (sortBy === 'date') {
      filtered.sort((a, b) => {
        const aUA = userAchievementsMap.get(a.key);
        const bUA = userAchievementsMap.get(b.key);
        
        // Сначала полученные (по дате), потом в прогрессе, потом заблокированные
        if (aUA?.progress === 100 && bUA?.progress === 100) {
          return new Date(bUA.earned_at).getTime() - new Date(aUA.earned_at).getTime();
        }
        if (aUA?.progress === 100) return -1;
        if (bUA?.progress === 100) return 1;
        
        if (aUA && bUA) {
          return bUA.progress - aUA.progress;
        }
        if (aUA) return -1;
        if (bUA) return 1;
        
        return 0;
      });
    } else if (sortBy === 'rarity') {
      const rarityOrder: Record<AchievementRarity, number> = {
        legendary: 0,
        epic: 1,
        rare: 2,
        common: 3
      };
      filtered.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    } else if (sortBy === 'progress') {
      filtered.sort((a, b) => {
        const aUA = userAchievementsMap.get(a.key);
        const bUA = userAchievementsMap.get(b.key);
        return (bUA?.progress || 0) - (aUA?.progress || 0);
      });
    }

    return filtered;
  }, [categoryFilter, statusFilter, sortBy, userAchievementsMap]);

  // Статистика
  const stats = useMemo(() => {
    const earned = userAchievements.filter(ua => ua.progress === 100).length;
    const inProgress = userAchievements.filter(ua => ua.progress > 0 && ua.progress < 100).length;
    const locked = ACHIEVEMENTS.length - userAchievements.length;

    return { earned, inProgress, locked, total: ACHIEVEMENTS.length };
  }, [userAchievements]);

  const categories: Array<{ key: AchievementCategory | 'all'; label: string; icon: string }> = [
    { key: 'all', label: 'Все', icon: 'Grid' },
    { key: 'lessons', label: 'Уроки', icon: 'BookOpen' },
    { key: 'missions', label: 'Миссии', icon: 'Target' },
    { key: 'streaks', label: 'Стрики', icon: 'Flame' },
    { key: 'social', label: 'Социальные', icon: 'Users' },
    { key: 'special', label: 'Особые', icon: 'Sparkles' }
  ];

  const statusFilters: Array<{ key: FilterStatus; label: string; icon: string }> = [
    { key: 'all', label: 'Все', icon: 'Grid' },
    { key: 'earned', label: 'Полученные', icon: 'CheckCircle' },
    { key: 'in_progress', label: 'В прогрессе', icon: 'Clock' },
    { key: 'locked', label: 'Заблокированные', icon: 'Lock' }
  ];

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-700">
            {stats.earned}/{stats.total}
          </div>
          <div className="text-sm text-green-600">Получено</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
          <div className="text-sm text-blue-600">В прогрессе</div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-700">{stats.locked}</div>
          <div className="text-sm text-gray-600">Заблокировано</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">
            {Math.round((stats.earned / stats.total) * 100)}%
          </div>
          <div className="text-sm text-purple-600">Завершено</div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="space-y-4">
        {/* Категории */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Категория</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const IconComponent = Icons[cat.icon as keyof typeof Icons] as any;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    categoryFilter === cat.key
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400 hover:shadow-md'
                  }`}
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Статус и сортировка */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Статус */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Статус</h3>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map(status => {
                const IconComponent = Icons[status.icon as keyof typeof Icons] as any;
                return (
                  <button
                    key={status.key}
                    onClick={() => setStatusFilter(status.key)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      statusFilter === status.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {IconComponent && <IconComponent className="w-3 h-3" />}
                    <span>{status.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Сортировка */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Сортировка</h3>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortBy)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date">По дате</option>
              <option value="rarity">По редкости</option>
              <option value="progress">По прогрессу</option>
            </select>
          </div>
        </div>
      </div>

      {/* Сетка достижений */}
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-12">
          <Icons.Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Достижения не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => {
            const userAchievement = userAchievementsMap.get(achievement.key);
            return (
              <AchievementCard
                key={achievement.key}
                achievement={achievement}
                earned={userAchievement?.progress === 100}
                progress={userAchievement?.progress || 0}
                progress_current={userAchievement?.progress_current}
                progress_target={userAchievement?.progress_target}
                earned_at={userAchievement?.earned_at}
                onClick={() => onAchievementClick?.(achievement)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

