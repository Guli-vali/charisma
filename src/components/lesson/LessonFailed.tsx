'use client';

import { motion } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { HeartCrack, RotateCcw, Home } from 'lucide-react';

interface LessonFailedProps {
  lessonTitle: string;
  score: number;
  totalExercises: number;
  onRestart: () => void;
  onExit: () => void;
}

export function LessonFailed({
  lessonTitle,
  score,
  totalExercises,
  onRestart,
  onExit,
}: LessonFailedProps) {
  const percentage = Math.round((score / totalExercises) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md"
      >
        <Card className="text-center">
          <div className="p-8 space-y-6">
            {/* Sad Animation */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5, delay: 0.3, repeat: 2 }}
            >
              <HeartCrack className="w-20 h-20 text-red-500 mx-auto" />
            </motion.div>

            {/* Title */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
              >
                Не хватило сердец 💔
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

            {/* Encouragement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 bg-gray-50 rounded-xl"
            >
              <p className="text-gray-700 mb-2">
                Не расстраивайтесь! Ошибки — это часть обучения.
              </p>
              <p className="text-sm text-gray-600">
                Вы ответили правильно на <span className="font-bold text-indigo-600">{score}</span> из {totalExercises} ({percentage}%)
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={onRestart}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Начать заново
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={onExit}
              >
                <Home className="w-4 h-4 mr-2" />
                Вернуться на главную
              </Button>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-gray-500"
            >
              <p>💡 Совет: Внимательно читайте объяснения после каждого ответа</p>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
