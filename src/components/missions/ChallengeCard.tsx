'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, ProgressBar } from '@/components/ui';
import { Trophy, Calendar } from 'lucide-react';
import type { WeeklyChallenge } from '@/lib/types';

interface ChallengeCardProps {
  challenge: WeeklyChallenge;
  currentProgress: number;
}

export function ChallengeCard({ challenge, currentProgress }: ChallengeCardProps) {
  const progress = Math.min((currentProgress / challenge.target) * 100, 100);
  const daysLeft = Math.ceil(
    (new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-none">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          {challenge.title}
        </CardTitle>
        <CardDescription className="text-white/90">
          {challenge.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Прогресс</span>
              <span className="font-medium">{currentProgress} / {challenge.target}</span>
            </div>
            <ProgressBar
              value={progress}
              variant="accent"
              size="md"
              showLabel={false}
              className="bg-white/20"
            />
          </div>

          {/* Info */}
          <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{daysLeft} дней осталось</span>
            </div>
            <div className="text-sm font-medium">
              ⭐ {challenge.xp_reward} XP
            </div>
          </div>

          {/* Category Badge */}
          <div className="text-xs text-white/80 text-center">
            Категория: {challenge.category}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
