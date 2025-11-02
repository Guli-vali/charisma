'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Flame, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface MissionStreakProps {
  streak: number;
  totalCompleted: number;
}

export function MissionStreak({ streak, totalCompleted }: MissionStreakProps) {
  const streakBonus = Math.floor(streak / 7) * 10; // Бонус каждые 7 дней

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Стрик реальных заданий
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Streak Display */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-6xl mb-2"
            >
              🔥
            </motion.div>
            <div className="text-4xl font-bold text-orange-600 mb-1">{streak}</div>
            <div className="text-gray-600">дней подряд</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-indigo-600">{totalCompleted}</div>
              <div className="text-xs text-gray-600">Всего выполнено</div>
            </div>
            {streakBonus > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl text-center">
                <div className="text-2xl font-bold text-amber-600">+{streakBonus}%</div>
                <div className="text-xs text-gray-600">Бонус к XP</div>
              </div>
            )}
          </div>

          {/* Motivation */}
          {streak > 0 && (
            <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-900">
                  {streak < 7
                    ? `Еще ${7 - streak} дней до первой недели!`
                    : streak < 30
                    ? `Отличный прогресс! Держи темп!`
                    : `Невероятно! Ты на огне!`}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
