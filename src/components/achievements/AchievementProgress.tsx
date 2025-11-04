/**
 * 📊 Прогресс достижения
 * Компактное отображение прогресса с круговым индикатором
 */

'use client';

import * as Icons from 'lucide-react';
import { Achievement, RARITY_COLORS } from '@/data/achievements';

interface AchievementProgressProps {
  achievement: Achievement;
  progress_current: number;
  progress_target: number;
  progress_percentage?: number;
  showEstimate?: boolean;
  averagePerDay?: number;
}

export function AchievementProgress({
  achievement,
  progress_current,
  progress_target,
  progress_percentage,
  showEstimate = true,
  averagePerDay = 1
}: AchievementProgressProps) {
  const IconComponent = Icons[achievement.icon as keyof typeof Icons] as any;
  const colors = RARITY_COLORS[achievement.rarity];

  const percentage = progress_percentage ?? Math.floor((progress_current / progress_target) * 100);
  const remaining = progress_target - progress_current;

  // Примерная оценка времени
  let estimateText = '';
  if (showEstimate && averagePerDay > 0 && remaining > 0) {
    const daysNeeded = Math.ceil(remaining / averagePerDay);
    if (daysNeeded === 1) {
      estimateText = '~1 день';
    } else if (daysNeeded < 7) {
      estimateText = `~${daysNeeded} дней`;
    } else if (daysNeeded < 30) {
      estimateText = `~${Math.ceil(daysNeeded / 7)} недель`;
    } else {
      estimateText = `~${Math.ceil(daysNeeded / 30)} месяцев`;
    }
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bg}`}>
      <div className="flex items-center gap-4">
        {/* Circular progress */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="50%"
              cy="50%"
              r="28"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <circle
              cx="50%"
              cy="50%"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - percentage / 100)}`}
              strokeLinecap="round"
              className={colors.text}
            />
          </svg>
          
          {/* Icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            {IconComponent ? (
              <IconComponent className={`w-6 h-6 ${colors.text}`} />
            ) : (
              <Icons.Award className={`w-6 h-6 ${colors.text}`} />
            )}
          </div>
        </div>

        {/* Progress details */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold ${colors.text} truncate`}>{achievement.title}</h4>
          <p className="text-sm text-gray-600 truncate">{achievement.description}</p>
          
          <div className="mt-2 space-y-1">
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${colors.bg} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className={`text-sm font-semibold ${colors.text} whitespace-nowrap`}>
                {percentage}%
              </span>
            </div>

            {/* Current / Target */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                {progress_current} / {progress_target}
              </span>
              {estimateText && <span>{estimateText}</span>}
            </div>
          </div>
        </div>

        {/* XP reward */}
        <div className={`flex flex-col items-center ${colors.text} flex-shrink-0`}>
          <Icons.Zap className="w-5 h-5" />
          <span className="text-sm font-bold">+{achievement.xp_reward}</span>
          <span className="text-xs">XP</span>
        </div>
      </div>

      {/* Tips (optional) */}
      {showEstimate && remaining > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-start gap-2">
            <Icons.Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Совет:</span>{' '}
              {getTipForAchievement(achievement)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Получить подсказку для ускорения прогресса достижения
 */
function getTipForAchievement(achievement: Achievement): string {
  const { category, unlock_condition } = achievement;

  switch (category) {
    case 'lessons':
      return 'Проходите уроки ежедневно для быстрого прогресса';
    case 'missions':
      return 'Выполняйте миссии в реальной жизни для практики навыков';
    case 'streaks':
      return 'Не пропускайте дни - занимайтесь каждый день!';
    case 'social':
      return 'Завершите все уроки в категории для получения достижения';
    case 'special':
      if (unlock_condition.type === 'level_reached') {
        return 'Зарабатывайте XP из уроков и миссий для повышения уровня';
      }
      if (unlock_condition.type === 'total_xp') {
        return 'Выполняйте больше заданий и получайте награды за достижения';
      }
      return 'Продолжайте использовать приложение для разблокировки';
    default:
      return 'Продолжайте в том же духе!';
  }
}

