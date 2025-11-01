'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LessonHeader } from '@/components/lesson/LessonHeader';
import { LessonComplete } from '@/components/lesson/LessonComplete';
import { LessonFailed } from '@/components/lesson/LessonFailed';
import { MultipleChoice } from '@/components/exercises/MultipleChoice';
import { FillBlanks } from '@/components/exercises/FillBlanks';
import { TrueFalse } from '@/components/exercises/TrueFalse';
import { Matching } from '@/components/exercises/Matching';
import { Sequence } from '@/components/exercises/Sequence';
import { useAuth } from '@/hooks/useAuth';
import { useLessonState } from '@/hooks/useLessonState';
import { Card, Button } from '@/components/ui';
import { XCircle } from 'lucide-react';
import type { Exercise } from '@/lib/types';

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const {
    lesson,
    attempt,
    currentExercise,
    currentExerciseIndex,
    totalExercises,
    heartsLeft,
    score,
    isCompleted,
    isFailed,
    loading,
    error,
    submitAnswer,
    restart,
  } = useLessonState(lessonId, user?.id);

  const handleAnswer = async (isCorrect: boolean) => {
    const result = await submitAnswer(isCorrect);
    
    // result может быть true (completed), false (failed), null (continue)
    // Анимация и переход обрабатываются автоматически в useLessonState
  };

  // Loading state
  if (loading || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-amber-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка урока...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-amber-50 p-4">
        <Card className="max-w-md text-center">
          <div className="p-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ошибка загрузки урока
            </h2>
            <p className="text-gray-600 mb-6">
              {error.message || 'Не удалось загрузить урок'}
            </p>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Вернуться на главную
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Completed state
  if (isCompleted) {
    return (
      <LessonComplete
        lessonTitle={lesson.title}
        xpEarned={lesson.xp_reward}
        score={score}
        totalExercises={totalExercises}
        hasNextLesson={false}
        // TODO: определить следующий урок
      />
    );
  }

  // Failed state
  if (isFailed && lesson) {
    return (
      <LessonFailed
        lessonTitle={lesson.title}
        score={score}
        totalExercises={totalExercises}
        onRestart={restart}
        onExit={() => router.push('/dashboard')}
      />
    );
  }

  // Render current exercise
  const renderExercise = (exercise: Exercise) => {
    switch (exercise.type) {
      case 'multiple_choice':
        return <MultipleChoice exercise={exercise} onAnswer={handleAnswer} />;
      case 'fill_blanks':
        return <FillBlanks exercise={exercise} onAnswer={handleAnswer} />;
      case 'true_false':
        return <TrueFalse exercise={exercise} onAnswer={handleAnswer} />;
      case 'matching':
        return <Matching exercise={exercise} onAnswer={handleAnswer} />;
      case 'sequence':
        return <Sequence exercise={exercise} onAnswer={handleAnswer} />;
      default:
        return <div>Неизвестный тип упражнения</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-amber-50">
      <LessonHeader
        currentExercise={currentExerciseIndex + 1}
        totalExercises={totalExercises}
        heartsLeft={heartsLeft}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentExercise && (
            <motion.div
              key={currentExerciseIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderExercise(currentExercise)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
