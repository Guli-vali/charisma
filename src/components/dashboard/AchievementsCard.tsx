'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@/components/ui';
import { Trophy, Lock, Zap } from 'lucide-react';
import * as Icons from 'lucide-react';
import { getAllAchievementsWithStatus } from '@/lib/achievements';
import { RARITY_COLORS } from '@/data/achievements';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function AchievementsCard() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    if (user) {
      loadAchievements(mounted);
    }
    
    return () => {
      mounted = false;
    };
  }, [user]);

  async function loadAchievements(mounted: boolean) {
    if (!user || !mounted) return;
    
    try {
      const allAchievements = await getAllAchievementsWithStatus(user.id);
      
      if (!mounted) return;
      // Показываем последние 4 разблокированных или ближайшие к разблокировке
      const sorted = allAchievements
        .sort((a, b) => {
          if (a.unlocked && !b.unlocked) return -1;
          if (!a.unlocked && b.unlocked) return 1;
          if (a.unlocked && b.unlocked) {
            return new Date(b.earned_at!).getTime() - new Date(a.earned_at!).getTime();
          }
          return b.progress - a.progress;
        })
        .slice(0, 4);
      
      setAchievements(sorted);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Достижения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {achievements.map((achievement, index) => {
            const IconComponent = Icons[achievement.icon as keyof typeof Icons] as any;
            const colors = RARITY_COLORS[achievement.rarity];
            
            return (
              <motion.div
                key={achievement.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer hover:scale-105 ${
                  achievement.unlocked
                    ? `${colors.bg} ${colors.border}`
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="mb-2 relative">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                    achievement.unlocked ? colors.bg : 'bg-gray-200'
                  }`}>
                    {achievement.unlocked ? (
                      IconComponent ? (
                        <IconComponent className={`w-6 h-6 ${colors.text}`} />
                      ) : (
                        <Trophy className={`w-6 h-6 ${colors.text}`} />
                      )
                    ) : (
                      <Lock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
                <h4 className={`font-semibold text-sm mb-1 ${
                  achievement.unlocked ? colors.text : 'text-gray-500'
                }`}>
                  {achievement.title}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {achievement.description}
                </p>
                {achievement.unlocked ? (
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <Zap className={`w-3 h-3 ${colors.text}`} />
                    <span className={`font-semibold ${colors.text}`}>+{achievement.xp_reward} XP</span>
                  </div>
                ) : achievement.progress > 0 ? (
                  <div className="text-xs text-gray-500">
                    {achievement.progress}% завершено
                  </div>
                ) : null}
              </motion.div>
            );
          })}
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
