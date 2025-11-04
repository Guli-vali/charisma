'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { getActivityCalendar, type ActivityDay } from '@/lib/profile';

interface ActivityCalendarProps {
  userId: string;
}

export function ActivityCalendar({ userId }: ActivityCalendarProps) {
  const [activities, setActivities] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<ActivityDay | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await getActivityCalendar(userId);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activity calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar grid (last 365 days)
  const generateCalendarGrid = (): (ActivityDay | null)[][] => {
    const weeks: (ActivityDay | null)[][] = [];
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Start from Sunday of the week containing oneYearAgo
    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Create activity map for quick lookup
    const activityMap = new Map<string, ActivityDay>();
    activities.forEach((activity) => {
      activityMap.set(activity.date, activity);
    });

    let currentDate = new Date(startDate);
    let currentWeek: (ActivityDay | null)[] = [];

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const activity = activityMap.get(dateStr) || null;

      currentWeek.push(activity);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const getIntensityColor = (intensity: number): string => {
    const colors = [
      'bg-gray-100',      // 0 - no activity
      'bg-green-200',     // 1 - low
      'bg-green-400',     // 2 - medium
      'bg-green-600',     // 3 - high
      'bg-green-800',     // 4 - very high
    ];
    return colors[intensity] || colors[0];
  };

  const handleMouseEnter = (day: ActivityDay | null, event: React.MouseEvent) => {
    if (!day) return;
    setHoveredDay(day);
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  // Calculate statistics
  const totalActiveDays = activities.length;
  const totalLessons = activities.reduce((sum, a) => sum + a.lessons, 0);
  const totalMissions = activities.reduce((sum, a) => sum + a.missions, 0);
  const totalXP = activities.reduce((sum, a) => sum + a.xp, 0);

  // Find most productive week
  const getMostProductiveWeek = (): { week: string; count: number } => {
    const weeks = generateCalendarGrid();
    let maxCount = 0;
    let maxWeek = '';

    weeks.forEach((week, index) => {
      const weekCount = week.reduce((sum, day) => {
        if (!day) return sum;
        return sum + day.lessons + day.missions;
      }, 0);

      if (weekCount > maxCount) {
        maxCount = weekCount;
        const firstDay = week.find((d) => d !== null);
        if (firstDay) {
          maxWeek = new Date(firstDay.date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
          });
        }
      }
    });

    return { week: maxWeek, count: maxCount };
  };

  const mostProductiveWeek = getMostProductiveWeek();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <CalendarIcon className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">График активности</h2>
        </div>
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const calendarGrid = generateCalendarGrid();
  const monthLabels = getMonthLabels(calendarGrid);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">График активности</h2>
            <p className="text-sm text-gray-600">Последние 365 дней</p>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">Активных дней</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalActiveDays}/365</p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="text-sm text-indigo-600">Уроков</p>
          <p className="text-2xl font-bold text-indigo-900 mt-1">{totalLessons}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-sm text-purple-600">Миссий</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{totalMissions}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm text-amber-600">XP</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{totalXP.toLocaleString()}</p>
        </div>
      </div>

      {/* Most Productive Week */}
      {mostProductiveWeek.count > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Самая продуктивная неделя</p>
              <p className="text-lg font-bold text-gray-900">
                {mostProductiveWeek.week} - {mostProductiveWeek.count} активностей
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month Labels */}
          <div className="flex mb-2 pl-8">
            {monthLabels.map((label, index) => (
              <div key={index} style={{ width: `${label.width * 14}px` }} className="text-xs text-gray-600">
                {label.month}
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="flex">
            {/* Day Labels */}
            <div className="flex flex-col gap-1 mr-2 text-xs text-gray-600">
              <div className="h-3">Пн</div>
              <div className="h-3"></div>
              <div className="h-3">Ср</div>
              <div className="h-3"></div>
              <div className="h-3">Пт</div>
              <div className="h-3"></div>
              <div className="h-3">Вс</div>
            </div>

            {/* Grid */}
            <div className="flex gap-1">
              {calendarGrid.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => {
                    const intensity = day?.intensity || 0;
                    return (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)} transition-all duration-200 hover:ring-2 hover:ring-indigo-400 cursor-pointer`}
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseLeave={handleMouseLeave}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
            <span>Меньше</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((intensity) => (
                <div key={intensity} className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`} />
              ))}
            </div>
            <span>Больше</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
          }}
        >
          <p className="font-semibold mb-1">
            {new Date(hoveredDay.date).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <div className="space-y-1">
            <p>📚 Уроков: {hoveredDay.lessons}</p>
            <p>🎯 Миссий: {hoveredDay.missions}</p>
            <p>⭐ XP: {hoveredDay.xp}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

function getMonthLabels(weeks: (ActivityDay | null)[][]): { month: string; width: number }[] {
  const labels: { month: string; width: number }[] = [];
  let currentMonth = '';
  let weekCount = 0;

  weeks.forEach((week) => {
    const firstDay = week.find((d) => d !== null);
    if (firstDay) {
      const month = new Date(firstDay.date).toLocaleDateString('ru-RU', { month: 'short' });
      if (month !== currentMonth) {
        if (weekCount > 0) {
          labels.push({ month: currentMonth, width: weekCount });
        }
        currentMonth = month;
        weekCount = 1;
      } else {
        weekCount++;
      }
    }
  });

  if (weekCount > 0) {
    labels.push({ month: currentMonth, width: weekCount });
  }

  return labels;
}

