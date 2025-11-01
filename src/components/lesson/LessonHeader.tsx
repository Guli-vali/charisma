'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause, Heart } from 'lucide-react';
import { ProgressBar, Button, Card } from '@/components/ui';

interface LessonHeaderProps {
  currentExercise: number;
  totalExercises: number;
  heartsLeft: number;
  maxHearts?: number;
}

export function LessonHeader({ 
  currentExercise, 
  totalExercises, 
  heartsLeft,
  maxHearts = 5 
}: LessonHeaderProps) {
  const router = useRouter();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const progress = (currentExercise / totalExercises) * 100;

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Exit Button */}
            <button
              onClick={handleExit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Выйти из урока"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {/* Progress Bar */}
            <div className="flex-1">
              <ProgressBar
                value={progress}
                variant="success"
                size="sm"
                showLabel={false}
              />
              <p className="text-xs text-gray-600 mt-1 text-center">
                {currentExercise} из {totalExercises}
              </p>
            </div>

            {/* Hearts */}
            <div className="flex items-center gap-1">
              {Array.from({ length: maxHearts }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      index < heartsLeft
                        ? 'fill-red-500 text-red-500'
                        : 'fill-gray-200 text-gray-300'
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Dialog */}
      <AnimatePresence>
        {showExitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExitDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <div className="p-6 space-y-4">
                  <div className="text-center">
                    <Pause className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Выйти из урока?
                    </h3>
                    <p className="text-gray-600">
                      Ваш прогресс будет сохранен и вы сможете вернуться позже
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowExitDialog(false)}
                    >
                      Продолжить урок
                    </Button>
                    <Button
                      variant="error"
                      className="flex-1"
                      onClick={confirmExit}
                    >
                      Выйти
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
