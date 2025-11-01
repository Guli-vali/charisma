import { useState, useEffect, useCallback } from 'react';
import { 
  getLessonById, 
  startLessonAttempt, 
  getCurrentAttempt, 
  submitExerciseAnswer, 
  completeLessonAttempt 
} from '@/lib/lessons';
import type { Lesson, UserLessonAttempt, Exercise } from '@/lib/types';

interface LessonState {
  lesson: Lesson | null;
  attempt: UserLessonAttempt | null;
  currentExercise: Exercise | null;
  currentExerciseIndex: number;
  totalExercises: number;
  heartsLeft: number;
  score: number;
  isCompleted: boolean;
  isFailed: boolean;
  loading: boolean;
  error: Error | null;
}

export function useLessonState(lessonId: string, userId: string | undefined) {
  const [state, setState] = useState<LessonState>({
    lesson: null,
    attempt: null,
    currentExercise: null,
    currentExerciseIndex: 0,
    totalExercises: 0,
    heartsLeft: 5,
    score: 0,
    isCompleted: false,
    isFailed: false,
    loading: true,
    error: null,
  });

  // Инициализация урока
  const initializeLesson = useCallback(async () => {
    if (!userId || !lessonId) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      // Загружаем урок
      const lesson = await getLessonById(lessonId);
      if (!lesson) {
        throw new Error('Урок не найден');
      }

      // Проверяем текущую попытку
      let attempt = await getCurrentAttempt(userId, lessonId);
      
      // Если нет активной попытки, создаем новую
      if (!attempt) {
        attempt = await startLessonAttempt(userId, lessonId);
      }

      // Сохраняем состояние в localStorage для восстановления
      localStorage.setItem(`lesson_${lessonId}_attempt`, JSON.stringify(attempt));

      setState({
        lesson,
        attempt,
        currentExercise: lesson.exercises[attempt.current_exercise] || null,
        currentExerciseIndex: attempt.current_exercise,
        totalExercises: lesson.exercises.length,
        heartsLeft: attempt.hearts_left,
        score: attempt.score,
        isCompleted: attempt.status === 'completed',
        isFailed: attempt.status === 'failed',
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err as Error,
      }));
    }
  }, [lessonId, userId]);

  useEffect(() => {
    initializeLesson();
  }, [initializeLesson]);

  // Отправка ответа
  const submitAnswer = useCallback(async (isCorrect: boolean) => {
    if (!state.attempt || !state.lesson) return;

    try {
      const updatedAttempt = await submitExerciseAnswer(
        state.attempt.id,
        state.currentExerciseIndex,
        isCorrect,
        state.attempt
      );

      // Проверяем, закончились ли сердца
      if (updatedAttempt.hearts_left === 0) {
        setState(prev => ({
          ...prev,
          attempt: updatedAttempt,
          heartsLeft: 0,
          isFailed: true,
        }));
        return false; // Failed
      }

      // Проверяем, закончились ли упражнения
      const nextIndex = updatedAttempt.current_exercise;
      if (nextIndex >= state.lesson.exercises.length) {
        // Урок завершен
        const finalAttempt = await completeLessonAttempt(
          updatedAttempt.id,
          updatedAttempt.score,
          state.lesson,
          userId!
        );

        setState(prev => ({
          ...prev,
          attempt: finalAttempt,
          isCompleted: true,
        }));

        // Очищаем localStorage
        localStorage.removeItem(`lesson_${lessonId}_attempt`);
        return true; // Completed
      }

      // Переходим к следующему упражнению
      setState(prev => ({
        ...prev,
        attempt: updatedAttempt,
        currentExercise: state.lesson.exercises[nextIndex],
        currentExerciseIndex: nextIndex,
        heartsLeft: updatedAttempt.hearts_left,
        score: updatedAttempt.score,
      }));

      // Обновляем localStorage
      localStorage.setItem(`lesson_${lessonId}_attempt`, JSON.stringify(updatedAttempt));

      return null; // Continue
    } catch (err) {
      setState(prev => ({ ...prev, error: err as Error }));
      throw err;
    }
  }, [state.attempt, state.lesson, state.currentExerciseIndex, lessonId, userId]);

  // Начать урок заново
  const restart = useCallback(async () => {
    if (!userId || !lessonId) return;

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Создаем новую попытку
      const newAttempt = await startLessonAttempt(userId, lessonId);
      
      setState(prev => ({
        ...prev,
        attempt: newAttempt,
        currentExercise: prev.lesson?.exercises[0] || null,
        currentExerciseIndex: 0,
        heartsLeft: 5,
        score: 0,
        isCompleted: false,
        isFailed: false,
        loading: false,
      }));

      localStorage.setItem(`lesson_${lessonId}_attempt`, JSON.stringify(newAttempt));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: err as Error }));
    }
  }, [lessonId, userId]);

  return {
    ...state,
    submitAnswer,
    restart,
    reload: initializeLesson,
  };
}
