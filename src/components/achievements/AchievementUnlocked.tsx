/**
 * 🎉 Уведомление о разблокированном достижении
 * Показывает модал/toast с анимацией и конфетти при получении достижения
 */

'use client';

import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { Achievement, RARITY_COLORS } from '@/data/achievements';

interface AchievementUnlockedProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
}

export function AchievementUnlocked({
  achievement,
  isOpen,
  onClose,
  onShare
}: AchievementUnlockedProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen && achievement) {
      setIsAnimating(true);
      
      // Воспроизводим звук (опционально)
      // playAchievementSound();
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, achievement]);

  if (!achievement || !isOpen) return null;

  // Проверяем что у достижения есть все необходимые данные
  if (!achievement.title || !achievement.description) {
    console.error('❌ Achievement missing required data:', achievement);
    return null;
  }

  const IconComponent = Icons[achievement.icon as keyof typeof Icons] as any;
  const colors = RARITY_COLORS[achievement.rarity || 'common'];

  console.log('🎨 Rendering achievement modal:', {
    title: achievement.title,
    icon: achievement.icon,
    rarity: achievement.rarity,
    xp_reward: achievement.xp_reward,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-500 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        {/* Confetti effect (CSS animation) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][
                  Math.floor(Math.random() * 5)
                ]
              }}
            />
          ))}
        </div>

        {/* Header with rarity color */}
        <div className={`${colors.bg} ${colors.border} border-b-4 p-6 text-center`}>
          <h2 className={`text-2xl font-bold ${colors.text} mb-1`}>
            🎉 Достижение получено! 🎉
          </h2>
          <div
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colors.text} ${colors.bg} border ${colors.border}`}
          >
            {achievement.rarity === 'common' && '🥉 Обычное'}
            {achievement.rarity === 'rare' && '🔷 Редкое'}
            {achievement.rarity === 'epic' && '⭐ Эпическое'}
            {achievement.rarity === 'legendary' && '💎 Легендарное'}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Large icon with glow */}
          <div
            className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${colors.bg} border-4 ${colors.border} shadow-2xl ${colors.glow} animate-bounce-slow`}
          >
            {IconComponent ? (
              <IconComponent className={`w-16 h-16 ${colors.text}`} />
            ) : (
              <Icons.Award className={`w-16 h-16 ${colors.text}`} />
            )}
          </div>

          {/* Title and description */}
          <h3 className={`text-3xl font-bold ${colors.text} mb-3`}>{achievement.title}</h3>
          <p className="text-gray-600 text-lg mb-6">{achievement.description}</p>

          {/* XP reward */}
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${colors.bg} border-2 ${colors.border} mb-6`}>
            <Icons.Zap className={`w-6 h-6 ${colors.text}`} />
            <span className={`text-2xl font-bold ${colors.text}`}>+{achievement.xp_reward} XP</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {onShare && (
              <button
                onClick={onShare}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Icons.Share2 className="w-5 h-5" />
                Поделиться
              </button>
            )}
            <button
              onClick={onClose}
              className={`flex-1 px-6 py-3 ${colors.bg} ${colors.text} rounded-lg font-semibold border-2 ${colors.border} hover:opacity-90 transition-opacity`}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Компактная версия уведомления (toast)
 */
export function AchievementUnlockedToast({
  achievement,
  isVisible,
  onClose
}: {
  achievement: Achievement | null;
  isVisible: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Автоматически закрывается через 5 секунд

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!achievement || !isVisible) return null;

  const IconComponent = Icons[achievement.icon as keyof typeof Icons] as any;
  const colors = RARITY_COLORS[achievement.rarity];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`${colors.bg} ${colors.border} border-2 rounded-lg shadow-2xl ${colors.glow} p-4 max-w-sm cursor-pointer hover:scale-105 transition-transform`}
        onClick={onClose}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors.bg} border ${colors.border} flex-shrink-0`}>
            {IconComponent ? (
              <IconComponent className={`w-6 h-6 ${colors.text}`} />
            ) : (
              <Icons.Award className={`w-6 h-6 ${colors.text}`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-600">Достижение получено!</span>
              <span className="text-xs">🎉</span>
            </div>
            <h4 className={`font-bold ${colors.text}`}>{achievement.title}</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{achievement.description}</p>
            <div className={`flex items-center gap-1 mt-1 ${colors.text}`}>
              <Icons.Zap className="w-3 h-3" />
              <span className="text-sm font-semibold">+{achievement.xp_reward} XP</span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

