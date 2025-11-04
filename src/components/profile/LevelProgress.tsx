/**
 * 📈 Прогресс уровня
 * Отображает текущий уровень пользователя с прогрессом до следующего
 */

'use client';

import * as Icons from 'lucide-react';
import { LevelProgress as LevelProgressType, getLevelRank, getLevelColor, hasRewardForLevel } from '@/lib/levels';
import { Card } from '@/components/ui/Card';

interface LevelProgressProps {
  levelProgress: LevelProgressType;
  className?: string;
  variant?: 'full' | 'compact';
}

export function LevelProgress({ levelProgress, className = '', variant = 'full' }: LevelProgressProps) {
  const {
    current_level,
    current_xp,
    xp_progress_in_level,
    xp_needed_for_next,
    progress_percentage,
    next_level,
    next_reward
  } = levelProgress;

  const rank = getLevelRank(current_level);
  const colorClass = getLevelColor(current_level);
  const hasReward = hasRewardForLevel(next_level);

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Level badge */}
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg`}>
          <div className="text-center">
            <div className="text-2xl font-bold">{current_level}</div>
            <div className="text-[10px] uppercase tracking-wide">LVL</div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-bold ${colorClass}`}>{rank}</span>
            <span className="text-xs text-gray-500">{Math.round(progress_percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress_percentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {xp_needed_for_next} XP до уровня {next_level}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90 mb-1">Текущий уровень</div>
            <div className="text-5xl font-bold">{current_level}</div>
            <div className={`text-lg font-semibold mt-1`}>{rank}</div>
          </div>

          {/* Circular progress */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="44" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
              <circle
                cx="50%"
                cy="50%"
                r="44"
                fill="none"
                stroke="white"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress_percentage / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(progress_percentage)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Прогресс до уровня {next_level}</span>
            <span className="text-sm font-bold text-indigo-600">{xp_needed_for_next} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress_percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{xp_progress_in_level} XP</span>
            <span>Всего: {current_xp} XP</span>
          </div>
        </div>

        {/* Next reward */}
        {hasReward && next_reward && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                {Icons[next_reward.icon as keyof typeof Icons] ? (
                  React.createElement(Icons[next_reward.icon as keyof typeof Icons] as any, {
                    className: 'w-5 h-5 text-yellow-900'
                  })
                ) : (
                  <Icons.Gift className="w-5 h-5 text-yellow-900" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-yellow-900 mb-1">
                  🎁 Награда на уровне {next_level}
                </div>
                <div className="text-sm font-bold text-yellow-800 mb-1">{next_reward.title}</div>
                <div className="text-xs text-yellow-700">{next_reward.description}</div>
                {next_reward.unlocks && next_reward.unlocks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {next_reward.unlocks.map(unlock => (
                      <span
                        key={unlock}
                        className="inline-block px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs font-medium"
                      >
                        {unlock}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Icons.Zap className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">{current_xp}</div>
            <div className="text-xs text-gray-600">Всего XP</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Icons.TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">{current_level}</div>
            <div className="text-xs text-gray-600">Уровень</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Icons.Target className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">{next_level}</div>
            <div className="text-xs text-gray-600">Цель</div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Icons.Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Совет:</span> Проходите уроки и выполняйте миссии для получения XP.
              Достижения также дают бонусный XP!
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Мини версия для дашборда
 */
export function LevelProgressMini({ levelProgress }: { levelProgress: LevelProgressType }) {
  const { current_level, progress_percentage } = levelProgress;
  const rank = getLevelRank(current_level);
  const colorClass = getLevelColor(current_level);

  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
      {/* Level badge */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
        <div className="text-center">
          <div className="text-xl font-bold">{current_level}</div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className={`font-bold ${colorClass} truncate`}>{rank}</div>
        <div className="w-full bg-white rounded-full h-1.5 mt-1">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            style={{ width: `${progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Percentage */}
      <div className={`text-2xl font-bold ${colorClass} flex-shrink-0`}>
        {Math.round(progress_percentage)}%
      </div>
    </div>
  );
}

