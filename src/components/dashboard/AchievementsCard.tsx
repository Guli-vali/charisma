'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@/components/ui';
import { Trophy, Lock } from 'lucide-react';
import type { Achievement } from '@/lib/types';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AchievementsCardProps {
  achievements: Achievement[];
}

export function AchievementsCard({ achievements }: AchievementsCardProps) {
  // Показываем последние 4 достижения
  const recentAchievements = achievements.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Достижения
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {recentAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="text-3xl mb-2 relative">
                {achievement.icon}
                {!achievement.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 rounded">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <h4 className={`font-semibold text-sm mb-1 ${
                achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {achievement.name}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {achievement.description}
              </p>
              {achievement.unlocked && achievement.unlocked_at && (
                <p className="text-xs text-amber-600 mt-2">
                  {new Date(achievement.unlocked_at).toLocaleDateString('ru-RU')}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="ghost" asChild>
          <Link href="/achievements">Смотреть все достижения</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
