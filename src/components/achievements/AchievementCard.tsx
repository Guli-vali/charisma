/**
 * 🏆 Карточка достижения
 * Отображает одно достижение с иконкой, названием, описанием и статусом
 */

'use client';

import * as Icons from 'lucide-react';
import { Achievement, RARITY_COLORS } from '@/data/achievements';
import { Card } from '@/components/ui/Card';

interface AchievementCardProps {
  achievement: Achievement;
  earned?: boolean;
  progress?: number; // 0-100
  progress_current?: number;
  progress_target?: number;
  earned_at?: string;
  onClick?: () => void;
}

export function AchievementCard({
  achievement,
  earned = false,
  progress = 0,
  progress_current,
  progress_target,
  earned_at,
  onClick
}: AchievementCardProps) {
  const { title, description, icon, rarity, xp_reward, is_hidden } = achievement;

  // Получаем иконку из Lucide
  const IconComponent = Icons[icon as keyof typeof Icons] as any;
  const LockIcon = Icons.Lock;
  const QuestionIcon = Icons.HelpCircle;

  // Цвета по редкости
  const colors = RARITY_COLORS[rarity];

  // Статусы
  const isLocked = !earned && progress === 0;
  const isHidden = is_hidden && !earned;
  const isInProgress = progress > 0 && progress < 100;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 cursor-pointer hover:scale-105 ${
        earned ? `${colors.bg} border-2 ${colors.border} shadow-lg ${colors.glow}` : 'bg-gray-50 border border-gray-200'
      } ${onClick ? 'hover:shadow-xl' : ''}`}
      onClick={onClick}
    >
      {/* Редкость badge */}
      <div
        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${colors.text} ${colors.bg} border ${colors.border}`}
      >
        {rarity === 'common' && '🥉 Обычное'}
        {rarity === 'rare' && '🔷 Редкое'}
        {rarity === 'epic' && '⭐ Эпическое'}
        {rarity === 'legendary' && '💎 Легенда'}
      </div>

      {/* Основной контент */}
      <div className="flex flex-col items-center text-center p-4 pt-10">
        {/* Иконка */}
        <div
          className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
            earned ? colors.bg : 'bg-gray-200'
          } border-2 ${earned ? colors.border : 'border-gray-300'}`}
        >
          {/* Прогресс-кольцо для достижений в процессе */}
          {isInProgress && (
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="38"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="50%"
                cy="50%"
                r="38"
                fill="none"
                stroke={colors.border.replace('border-', '')}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
          )}

          {/* Иконка */}
          <div className="relative z-10">
            {isHidden ? (
              <QuestionIcon className={`w-10 h-10 text-gray-400`} />
            ) : isLocked ? (
              <LockIcon className="w-10 h-10 text-gray-400" />
            ) : IconComponent ? (
              <IconComponent className={`w-10 h-10 ${earned ? colors.text : 'text-gray-500'}`} />
            ) : (
              <Icons.Award className={`w-10 h-10 ${earned ? colors.text : 'text-gray-500'}`} />
            )}
          </div>
        </div>

        {/* Название */}
        <h3
          className={`text-lg font-bold mb-1 ${
            isHidden ? 'text-gray-400' : earned ? colors.text : 'text-gray-600'
          }`}
        >
          {isHidden ? '???' : title}
        </h3>

        {/* Описание */}
        <p className={`text-sm mb-3 ${isHidden ? 'text-gray-400' : 'text-gray-600'}`}>
          {isHidden ? 'Секретное достижение' : description}
        </p>

        {/* Прогресс */}
        {isInProgress && progress_current !== undefined && progress_target !== undefined && (
          <div className="w-full mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Прогресс</span>
              <span className="font-semibold">
                {progress_current} / {progress_target}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${colors.bg}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* XP награда */}
        {!isHidden && (
          <div className={`flex items-center gap-1 text-sm ${earned ? colors.text : 'text-gray-500'}`}>
            <Icons.Zap className="w-4 h-4" />
            <span className="font-semibold">+{xp_reward} XP</span>
          </div>
        )}

        {/* Дата получения */}
        {earned && earned_at && (
          <div className="mt-2 text-xs text-gray-500">
            Получено: {new Date(earned_at).toLocaleDateString('ru-RU')}
          </div>
        )}

        {/* Статус заблокировано */}
        {isLocked && !isHidden && (
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <LockIcon className="w-3 h-3" />
            <span>Заблокировано</span>
          </div>
        )}
      </div>
    </Card>
  );
}

