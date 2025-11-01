'use client';

import { Card, CardHeader, CardTitle, CardContent, ProgressBar } from '@/components/ui';
import { Flame, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StreakCardProps {
  streak: number;
  league: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const leagueConfig = {
  bronze: { name: 'Бронзовая', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: '🥉', progress: 25 },
  silver: { name: 'Серебряная', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '🥈', progress: 50 },
  gold: { name: 'Золотая', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '🥇', progress: 75 },
  platinum: { name: 'Платиновая', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '💎', progress: 100 },
};

export function StreakCard({ streak, league }: StreakCardProps) {
  const config = leagueConfig[league];
  
  // Генерируем календарь на неделю
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const today = new Date().getDay(); // 0 = воскресенье
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Стрик и лига
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Streak Section */}
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-center"
            >
              <div className="text-6xl mb-2">🔥</div>
              <div className="text-3xl font-bold text-orange-600">{streak}</div>
              <div className="text-gray-600">дней подряд</div>
            </motion.div>

            {/* Week Calendar */}
            <div className="grid grid-cols-7 gap-2 mt-4">
              {weekDays.map((day, index) => {
                const isActive = index <= todayIndex && streak > (todayIndex - index);
                return (
                  <div key={day} className="text-center">
                    <div className="text-xs text-gray-600 mb-1">{day}</div>
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm ${
                        isActive ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isActive ? '✓' : '○'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* League Section */}
          <div className={`p-4 rounded-xl ${config.bgColor}`}>
            <div className="flex items-center gap-3">
              <div className="text-4xl">{config.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className={`w-4 h-4 ${config.color}`} />
                  <span className={`font-semibold ${config.color}`}>{config.name} лига</span>
                </div>
                <ProgressBar
                  value={config.progress}
                  variant={league === 'bronze' ? 'error' : league === 'silver' ? 'primary' : league === 'gold' ? 'accent' : 'success'}
                  size="sm"
                  showLabel={false}
                />
                <p className="text-xs text-gray-600 mt-1">
                  {league === 'platinum' ? 'Максимальная лига!' : 'Прогресс до следующей лиги'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
