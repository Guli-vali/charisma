'use client';

import { Card, CardHeader, CardTitle, CardContent, ProgressBar, Button } from '@/components/ui';
import { Target, CheckCircle } from 'lucide-react';
import type { DailyMission } from '@/lib/types';
import { motion } from 'framer-motion';

interface DailyMissionsProps {
  missions: DailyMission[];
  onComplete?: (missionId: string) => void;
}

export function DailyMissions({ missions, onComplete }: DailyMissionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
          Дневные задания
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {missions.map((mission, index) => {
            const progress = Math.min((mission.current / mission.target) * 100, 100);
            
            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mission.completed
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-white border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{mission.title}</h4>
                    <p className="text-sm text-gray-600">{mission.description}</p>
                  </div>
                  {mission.completed ? (
                    <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                      <span>⭐</span>
                      <span>+{mission.xp_reward}</span>
                    </div>
                  )}
                </div>

                {mission.type === 'real_mission' ? (
                  // Реальная миссия: показываем прогресс, но БЕЗ кнопки "отметить"
                  // Миссия выполняется на странице /missions
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Прогресс</span>
                      <span>{mission.current} / {mission.target}</span>
                    </div>
                    <ProgressBar
                      value={progress}
                      variant={mission.completed ? 'success' : 'primary'}
                      size="sm"
                      showLabel={false}
                    />
                    {mission.current >= mission.target && !mission.completed && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => onComplete?.(mission.id)}
                      >
                        Получить награду +{mission.xp_reward} XP
                      </Button>
                    )}
                    {mission.current === 0 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Выполните миссию на странице <a href="/missions" className="text-indigo-600 hover:underline">Миссии</a>
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Прогресс</span>
                      <span>{mission.current} / {mission.target}</span>
                    </div>
                    <ProgressBar
                      value={progress}
                      variant={mission.completed ? 'success' : 'primary'}
                      size="sm"
                      showLabel={false}
                    />
                    {mission.current >= mission.target && !mission.completed && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => onComplete?.(mission.id)}
                      >
                        Получить награду +{mission.xp_reward} XP
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}

          {missions.every(m => m.completed) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-center text-white"
            >
              <div className="text-3xl mb-2">🎉</div>
              <h4 className="font-semibold mb-1">Все задания выполнены!</h4>
              <p className="text-sm text-white/90">Возвращайтесь завтра за новыми заданиями</p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
