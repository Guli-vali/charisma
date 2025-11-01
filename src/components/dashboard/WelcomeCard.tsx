'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, ProgressBar } from '@/components/ui';
import { Trophy } from 'lucide-react';
import { getXPProgress } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

interface WelcomeCardProps {
  userName: string;
  xp: number;
  level: number;
}

export function WelcomeCard({ userName, xp, level }: WelcomeCardProps) {
  const xpProgress = getXPProgress(xp);

  return (
    <Card className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-none">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Добро пожаловать, {userName}!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-5xl font-bold"
            >
              {level}
            </motion.div>
            <div className="text-white/80">уровень</div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{formatNumber(xpProgress.current)} XP</span>
              <span>{formatNumber(xpProgress.target)} XP</span>
            </div>
            <ProgressBar
              value={xpProgress.percentage}
              variant="accent"
              size="md"
              showLabel={false}
              className="bg-white/20"
            />
            <p className="text-white/80 text-sm mt-2">
              {formatNumber(xpProgress.target - xpProgress.current)} XP до следующего уровня
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"
          >
            <div className="text-2xl font-bold">{formatNumber(xp)}</div>
            <div className="text-white/80 text-sm">Всего опыта</div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
