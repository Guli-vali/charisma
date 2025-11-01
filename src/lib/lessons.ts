import { pb } from './pocketbase';
import type { Lesson, UserLessonAttempt, LessonAttemptStatus } from './types';

// Получить урок по ID
export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  try {
    const record = await pb.client.collection('lessons').getOne(lessonId);
    return record as unknown as Lesson;
  } catch (error: unknown) {
    const err = error as { isAbort?: boolean; message?: string };
    if (err.isAbort || err.message?.includes('autocancelled')) {
      return null;
    }
    console.error('Error fetching lesson:', error);
    return null;
  }
}

// Получить все уроки для навыка
export async function getLessonsBySkillNode(skillNode: string): Promise<Lesson[]> {
  try {
    const records = await pb.client.collection('lessons').getFullList({
      filter: `skill_node = "${skillNode}"`,
      sort: 'lesson_number',
    });
    return records as unknown as Lesson[];
  } catch (error: unknown) {
    const err = error as { isAbort?: boolean; message?: string };
    if (err.isAbort || err.message?.includes('autocancelled')) {
      return [];
    }
    console.error('Error fetching lessons:', error);
    return [];
  }
}

// Начать попытку прохождения урока
export async function startLessonAttempt(
  userId: string,
  lessonId: string
): Promise<UserLessonAttempt> {
  try {
    const data = {
      user: userId,
      lesson: lessonId,
      status: 'in_progress' as LessonAttemptStatus,
      hearts_left: 5,
      current_exercise: 0,
      score: 0,
    };

    const record = await pb.client.collection('user_lesson_attempts').create(data);
    return record as unknown as UserLessonAttempt;
  } catch (error) {
    console.error('Error starting lesson attempt:', error);
    throw error;
  }
}

// Получить текущую попытку урока
export async function getCurrentAttempt(
  userId: string,
  lessonId: string
): Promise<UserLessonAttempt | null> {
  try {
    const record = await pb.client.collection('user_lesson_attempts').getFirstListItem(
      `user = "${userId}" && lesson = "${lessonId}" && status = "in_progress"`
    );
    return record as unknown as UserLessonAttempt;
  } catch (error) {
    return null;
  }
}

// Обновить прогресс попытки
export async function updateAttemptProgress(
  attemptId: string,
  data: {
    current_exercise?: number;
    hearts_left?: number;
    score?: number;
    status?: LessonAttemptStatus;
  }
): Promise<UserLessonAttempt> {
  try {
    const record = await pb.client.collection('user_lesson_attempts').update(attemptId, data);
    return record as unknown as UserLessonAttempt;
  } catch (error) {
    console.error('Error updating attempt progress:', error);
    throw error;
  }
}

// Отправить ответ на упражнение
export async function submitExerciseAnswer(
  attemptId: string,
  exerciseIndex: number,
  isCorrect: boolean,
  currentAttempt: UserLessonAttempt
): Promise<UserLessonAttempt> {
  try {
    const newHeartsLeft = isCorrect ? currentAttempt.hearts_left : Math.max(0, currentAttempt.hearts_left - 1);
    const newScore = isCorrect ? currentAttempt.score + 1 : currentAttempt.score;
    const newExerciseIndex = exerciseIndex + 1;

    // Проверяем, закончились ли сердца
    const status: LessonAttemptStatus = newHeartsLeft === 0 ? 'failed' : 'in_progress';

    const data = {
      current_exercise: newExerciseIndex,
      hearts_left: newHeartsLeft,
      score: newScore,
      status,
    };

    return await updateAttemptProgress(attemptId, data);
  } catch (error) {
    console.error('Error submitting exercise answer:', error);
    throw error;
  }
}

// Завершить попытку урока
export async function completeLessonAttempt(
  attemptId: string,
  finalScore: number,
  lesson: Lesson,
  userId: string
): Promise<UserLessonAttempt> {
  try {
    // Обновляем статус попытки
    const data = {
      status: 'completed' as LessonAttemptStatus,
      score: finalScore,
      completed_at: new Date().toISOString(),
    };

    const updatedAttempt = await updateAttemptProgress(attemptId, data);

    // Начисляем XP пользователю
    const currentUser = pb.getCurrentUser();
    if (currentUser) {
      await pb.updateProfile(userId, {
        experience_points: currentUser.experience_points + lesson.xp_reward,
        total_lessons_completed: currentUser.total_lessons_completed + 1,
      } as any);
    }

    return updatedAttempt;
  } catch (error) {
    console.error('Error completing lesson attempt:', error);
    throw error;
  }
}

// Получить прогресс пользователя по навыку
export async function getUserLessonProgress(
  userId: string,
  skillNode: string
): Promise<{ completed: number; total: number }> {
  try {
    // Получаем все уроки для навыка
    const lessons = await getLessonsBySkillNode(skillNode);
    const total = lessons.length;

    // Получаем завершенные попытки
    const completedAttempts = await pb.client.collection('user_lesson_attempts').getFullList({
      filter: `user = "${userId}" && status = "completed"`,
    });

    const completedLessonIds = new Set(completedAttempts.map((a: any) => a.lesson));
    const completed = lessons.filter(l => completedLessonIds.has(l.id)).length;

    return { completed, total };
  } catch (error: unknown) {
    const err = error as { isAbort?: boolean; message?: string };
    if (err.isAbort || err.message?.includes('autocancelled')) {
      return { completed: 0, total: 0 };
    }
    console.error('Error fetching lesson progress:', error);
    return { completed: 0, total: 0 };
  }
}

// Проверить, завершен ли урок
export async function isLessonCompleted(userId: string, lessonId: string): Promise<boolean> {
  try {
    const record = await pb.client.collection('user_lesson_attempts').getFirstListItem(
      `user = "${userId}" && lesson = "${lessonId}" && status = "completed"`
    );
    return !!record;
  } catch (error) {
    return false;
  }
}
