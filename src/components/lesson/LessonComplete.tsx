'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { Trophy, Star, Home, ArrowRight, Share2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { useGamification } from '@/hooks/useGamification';
import { AchievementUnlocked } from '@/components/achievements/AchievementUnlocked';
import { RARITY_COLORS } from '@/data/achievements';

interface LessonCompleteProps {
  lessonTitle: string;
  xpEarned: number;
  score: number;
  totalExercises: number;
  hasNextLesson?: boolean;
  nextLessonId?: string;
}

export function LessonComplete({
  lessonTitle,
  xpEarned,
  score,
  totalExercises,
  hasNextLesson,
  nextLessonId,
}: LessonCompleteProps) {
  const router = useRouter();
  const percentage = Math.round((score / totalExercises) * 100);
  const { trackAction, showAchievementModal, currentAchievement, dismissAchievement } = useGamification();
  
  // Используем ref для надежной защиты от повторных вызовов в React Strict Mode
  const hasTrackedRef = useRef(false);

  // Проверяем достижения при завершении урока
  useEffect(() => {
    const checkLessonAchievements = async () => {
      // Используем ref для защиты от двойного выполнения в Strict Mode
      if (hasTrackedRef.current) {
        console.log('⚠️ Achievement check already executed, skipping duplicate');
        return;
      }
      hasTrackedRef.current = true;

      console.log('🎯 Checking achievements for completed lesson...');
      const isPerfect = score === totalExercises;
      
      console.log('📊 Lesson stats:', { 
        score, 
        totalExercises, 
        isPerfect,
        percentage 
      });
      
      await trackAction('lesson_completed', {
        perfect: isPerfect,
        score: score,
        total: totalExercises,
        percentage: percentage,
      });

      console.log('✅ Achievement check completed');
    };

    checkLessonAchievements();
  }, []); // Выполняется один раз при монтировании

  const handleShare = () => {
    // Простая функция для копирования в буфер обмена
    const text = `Я только что завершил урок "${lessonTitle}" в Charisma Pro! Заработал ${xpEarned} XP! 🎉`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Charisma Pro',
        text,
      }).catch(() => {
        // Fallback: копируем в буфер
        navigator.clipboard.writeText(text);
        toast.success('Скопировано в буфер обмена!');
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Скопировано в буфер обмена!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-2xl"
      >
        <Card className="text-center">
          <div className="p-8 space-y-6">
            {/* Success Animation */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Trophy className="w-20 h-20 text-amber-500 mx-auto" />
            </motion.div>

            {/* Title */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
              >
                Урок завершен! 🎉
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600"
              >
                {lessonTitle}
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="text-2xl font-bold text-amber-600">
                    +{formatNumber(xpEarned)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">XP заработано</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {percentage}%
                </div>
                <p className="text-sm text-gray-600">Точность</p>
              </div>
            </motion.div>

            {/* Score Details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-4 bg-gray-50 rounded-xl"
            >
              <p className="text-gray-700">
                Правильных ответов: <span className="font-bold text-emerald-600">{score}</span> из {totalExercises}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              {hasNextLesson && nextLessonId ? (
                <Button
                  variant="success"
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link href={`/lessons/${nextLessonId}`}>
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Следующий урок
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push('/dashboard')}
                >
                  <Home className="w-5 h-5 mr-2" />
                  На главную
                </Button>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/dashboard')}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Поделиться
                </Button>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Модальное окно достижения */}
      {currentAchievement && currentAchievement.expand?.achievement && (
        <AchievementUnlocked
          achievement={currentAchievement.expand.achievement as any}
          isOpen={showAchievementModal}
          onClose={dismissAchievement}
        />
      )}
    </div>
  );
}
