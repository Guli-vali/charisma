'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Calendar, CheckCircle2 } from 'lucide-react';
import type { UserMission } from '@/lib/types';
import { motion } from 'framer-motion';

interface MissionHistoryProps {
  history: UserMission[];
}

export function MissionHistory({ history }: MissionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          История выполнения
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Пока нет выполненных миссий</p>
            <p className="text-sm mt-1">Начните с заданий на сегодня!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((userMission: any, index) => {
              const mission = userMission.expand?.mission;
              if (!mission) return null;

              return (
                <motion.div
                  key={userMission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{mission.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {mission.title}
                        </h4>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(userMission.completed_date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                      {userMission.proof_text && (
                        <p className="text-xs text-gray-500 mt-1 italic line-clamp-2">
                          "{userMission.proof_text}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-amber-600 font-medium">
                          +{mission.xp_reward} XP
                        </span>
                        {userMission.mood_rating && (
                          <span className="text-xs text-gray-500">
                            {'⭐'.repeat(userMission.mood_rating)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
