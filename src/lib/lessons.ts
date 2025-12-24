import { pb } from './pocketbase';
import type { Lesson, UserLessonAttempt, LessonAttemptStatus, User } from './types';

/**
 * Обновить прогресс по навыку после завершения урока
 */
/**
 * Разблокирует навыки, которые зависят от завершенного навыка
 */
async function unlockDependentSkills(userId: string, completedSkillId: string): Promise<void> {
  console.log('🔓 Checking dependent skills for:', completedSkillId);
  
  try {
    // Динамический импорт для избежания циклических зависимостей
    const { SKILL_TREE_DATA } = await import('@/lib/skillTreeData');
    
    // Находим навыки, которые зависят от завершенного
    const dependentSkills = SKILL_TREE_DATA.filter(skill => 
      skill.prerequisites.includes(completedSkillId)
    );
    
    console.log(`📋 Found ${dependentSkills.length} dependent skills:`, dependentSkills.map(s => s.id));
    
    for (const skill of dependentSkills) {
      // Проверяем, выполнены ли все prerequisites для этого навыка
      const allPrerequisites = skill.prerequisites;
      let allCompleted = true;
      
      for (const prereqId of allPrerequisites) {
        const prereqProgress = await pb.client.collection('progress').getFirstListItem(
          `user = "${userId}" && skill_tree_node = "${prereqId}"`,
          { requestKey: null }
        ).catch(() => null);
        
        if (!prereqProgress || prereqProgress.status !== 'completed') {
          allCompleted = false;
          console.log(`⏸️ Skill ${skill.id} blocked by ${prereqId}`);
          break;
        }
      }
      
      if (allCompleted) {
        // Все prerequisites выполнены, разблокируем навык
        console.log(`✅ All prerequisites completed for ${skill.id}, unlocking...`);
        
        const existingProgress = await pb.client.collection('progress').getFirstListItem(
          `user = "${userId}" && skill_tree_node = "${skill.id}"`,
          { requestKey: null }
        ).catch(() => null);
        
        if (existingProgress && existingProgress.status === 'locked') {
          // Обновляем статус с locked на available
          await pb.client.collection('progress').update(existingProgress.id, {
            status: 'available',
          }, { requestKey: null });
          console.log(`🔓 Unlocked skill: ${skill.id}`);
        } else if (!existingProgress) {
          // Создаем новую запись со статусом available
          await pb.client.collection('progress').create({
            user: userId,
            skill_tree_node: skill.id,
            status: 'available',
            progress_percentage: 0,
            completed_exercises: [],
          }, { requestKey: null });
          console.log(`🆕 Created available skill: ${skill.id}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error unlocking dependent skills:', error);
  }
}

async function updateSkillProgress(userId: string, lesson: Lesson): Promise<void> {
  console.log('🔄 updateSkillProgress called:', { userId, lessonId: lesson.id, skillNode: lesson.skill_node });
  
  try {
    // Проверяем есть ли коллекция user_progress
    try {
      console.log('🔍 Searching for existing progress...');
      
      // Ищем существующий прогресс по навыку
      const existingProgress = await pb.client.collection('progress').getFirstListItem(
        `user = "${userId}" && skill_tree_node = "${lesson.skill_node}"`,
        { requestKey: null }
      ).catch((err) => {
        console.log('No existing progress found:', err.message);
        return null;
      });

      // Получаем все завершенные уроки пользователя для этого навыка
      const completedAttempts = await pb.client.collection('user_lesson_attempts').getFullList({
        filter: `user = "${userId}" && status = "completed"`,
        requestKey: null,
      });
      
      const completedLessonIds = completedAttempts.map((a: any) => a.lesson);
      console.log('📝 Completed lesson IDs for user:', completedLessonIds);

      // Проверяем, был ли этот урок уже завершен ранее
      if (completedLessonIds.filter(id => id === lesson.id).length > 1) {
        console.log('⚠️ Lesson already completed before, skipping progress update');
        return; // Урок уже засчитан ранее, не обновляем прогресс
      }

      // Получаем все уроки для навыка
      const allLessons = await getLessonsBySkillNode(lesson.skill_node);
      console.log(`📚 Total lessons for skill: ${allLessons.length}`);
      
      // Считаем уникальные завершенные уроки именно этого навыка
      const completedLessonsForSkill = allLessons.filter(l => 
        completedLessonIds.includes(l.id)
      );
      const uniqueCompletedIds = [...new Set(completedLessonsForSkill.map(l => l.id))];
      
      console.log(`📊 Unique completed lessons: ${uniqueCompletedIds.length}/${allLessons.length}`);

      const progress_percentage = Math.round((uniqueCompletedIds.length / allLessons.length) * 100);
      const status = progress_percentage >= 100 ? 'completed' : 'available';
      
      // Проверяем, был ли навык завершен до обновления
      const wasCompleted = existingProgress?.status === 'completed';
      const nowCompleted = status === 'completed';

      if (existingProgress) {
        console.log('✅ Found existing progress, updating...');

        await pb.client.collection('progress').update(existingProgress.id, {
          completed_exercises: uniqueCompletedIds,
          progress_percentage,
          status,
        }, { requestKey: null });

        console.log(`✅ Skill progress updated: ${progress_percentage}% for skill ${lesson.skill_node}`);
      } else {
        console.log('➕ Creating new progress record...');

        const newProgress = await pb.client.collection('progress').create({
          user: userId,
          skill_tree_node: lesson.skill_node,
          status: 'available',
          progress_percentage,
          completed_exercises: uniqueCompletedIds,
        }, { requestKey: null });

        console.log(`✅ Skill progress created for skill ${lesson.skill_node}:`, newProgress);
      }
      
      // Если навык только что завершен, разблокируем зависимые навыки
      if (!wasCompleted && nowCompleted) {
        console.log('🎉 Skill completed! Unlocking dependent skills...');
        await unlockDependentSkills(userId, lesson.skill_node);
      }
    } catch (err: any) {
      console.error('❌ Error in progress operations:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data,
      });
    }
  } catch (error) {
    console.error('❌ Error updating skill progress:', error);
  }
}

/**
 * Обновить стрик пользователя
 * Проверяет последнюю активность и обновляет стрик соответственно
 */
async function updateStreak(userId: string, currentUser: User): Promise<number> {
  try {
    // Проверяем есть ли коллекция daily_streaks
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Диапазоны для поиска
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      console.log('🔥 Updating streak for date:', today);
      
      // Проверяем активность сегодня (используем диапазон для date полей)
      const todayStreak = await pb.client.collection('daily_streaks').getFirstListItem(
        `user = "${userId}" && date >= "${today}" && date < "${tomorrowStr}"`,
        { requestKey: null }
      ).catch(() => null);

      if (todayStreak) {
        // Уже есть активность сегодня - стрик не меняется
        console.log('✅ Found today streak, streak stays the same');
        // НЕ обновляем lessons_completed здесь - это делается через updateTodayStreak()
        return currentUser.current_streak; // Стрик не меняется
      }

      console.log('➕ Creating new streak record for today');

      // Проверяем была ли активность вчера (используем диапазон)
      const yesterdayStreak = await pb.client.collection('daily_streaks').getFirstListItem(
        `user = "${userId}" && date >= "${yesterday}" && date < "${today}"`,
        { requestKey: null }
      ).catch(() => null);

      // Создаем запись на сегодня (с защитой от дубликатов через unique index)
      // lessons_completed будет установлен через updateTodayStreak() после этой функции
      try {
        await pb.client.collection('daily_streaks').create({
          user: userId,
          date: today, // today уже в формате YYYY-MM-DD
          lessons_completed: 0, // Будет обновлено через updateTodayStreak()
          missions_completed: 0,
        }, { requestKey: null });
        
        console.log('✅ Streak record created (lessons_completed will be updated via updateTodayStreak)');
      } catch (createErr) {
        // Если запись уже существует (unique constraint) - это нормально
        const err = createErr as { status?: number; data?: { data?: { date?: { code?: string } } } };
        if (err.status === 400 && err.data?.data?.date?.code === 'validation_not_unique') {
          console.log('ℹ️ Streak record already exists (race condition)');
          // НЕ обновляем lessons_completed здесь - это делается через updateTodayStreak()
          return currentUser.current_streak; // Используем текущий стрик
        }
        console.error('Error creating streak record:', err);
        throw createErr; // Другие ошибки пробрасываем
      }

      // Если была активность вчера - увеличиваем стрик, иначе сбрасываем
      const newStreak = yesterdayStreak ? currentUser.current_streak + 1 : 1;
      console.log(`🔥 New streak: ${newStreak} day(s)`);
      return newStreak;
      
    } catch (err) {
      // Если коллекция daily_streaks не существует, просто увеличиваем стрик
      console.warn('Collection daily_streaks not found, using simple streak counter', err);
      return currentUser.current_streak + 1;
    }
  } catch (error) {
    console.error('Error updating streak:', error);
    return currentUser.current_streak;
  }
}

// Получить урок по ID
export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  try {
    const record = await pb.client.collection('lessons').getOne(lessonId, {
      requestKey: null,
    });
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
      requestKey: null,
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

    const record = await pb.client.collection('user_lesson_attempts').create(data, {
      requestKey: null,
    });
    return record as unknown as UserLessonAttempt;
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      throw new Error('Request cancelled');
    }
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
      `user = "${userId}" && lesson = "${lessonId}" && status = "in_progress"`,
      { requestKey: null }
    );
    return record as unknown as UserLessonAttempt;
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      return null;
    }
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
    const record = await pb.client.collection('user_lesson_attempts').update(attemptId, data, {
      requestKey: null,
    });
    return record as unknown as UserLessonAttempt;
  } catch (error) {
    // Игнорируем ошибки автоотмены
    if (error && typeof error === 'object' && 'isAbort' in error) {
      throw new Error('Request cancelled');
    }
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
    console.log(`📝 Exercise ${exerciseIndex + 1}: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`   Current score: ${currentAttempt.score} → New score: ${isCorrect ? currentAttempt.score + 1 : currentAttempt.score}`);
    
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
  console.log('🏁 completeLessonAttempt called:', { attemptId, lessonId: lesson?.id, userId });
  
  try {
    // Проверяем валидность lesson объекта
    if (!lesson || !lesson.id) {
      console.error('❌ Invalid lesson object provided to completeLessonAttempt');
      throw new Error('Invalid lesson object');
    }

    // Проверяем что попытка еще не завершена
    const currentAttempt = await pb.client.collection('user_lesson_attempts').getOne(attemptId, {
      requestKey: null,
    });

    if (currentAttempt.status === 'completed') {
      console.log('⚠️ Attempt already completed, skipping rewards');
      return currentAttempt as unknown as UserLessonAttempt;
    }

    console.log('✅ Attempt status:', currentAttempt.status, '- proceeding with completion');

    // Обновляем статус попытки
    const data = {
      status: 'completed' as LessonAttemptStatus,
      score: finalScore,
      completed_at: new Date().toISOString(),
    };

    const updatedAttempt = await updateAttemptProgress(attemptId, data);

    // Проверяем, первое ли это прохождение урока
    const previousCompletions = await pb.client.collection('user_lesson_attempts').getFullList({
      filter: `user = "${userId}" && lesson = "${lesson.id}" && status = "completed"`,
      requestKey: null,
    });

    const isFirstCompletion = previousCompletions.length === 1; // Только текущая попытка
    console.log(`🎓 Lesson completion: ${isFirstCompletion ? 'FIRST TIME' : 'REPEAT'} (${previousCompletions.length} total completions)`);

    const currentUser = pb.getCurrentUser();
    if (currentUser) {
      // Обновляем дневной streak (для дневных миссий)
      if (isFirstCompletion) {
        // При первом завершении обновляем счетчики уроков И XP
        try {
          const { updateTodayStreak } = await import('@/lib/api');
          const xpReward = lesson?.xp_reward ?? 0;
          await updateTodayStreak(userId, 1, 0, xpReward);
          console.log(`✅ Today streak updated (lessons_completed +1, xp +${xpReward})`);
        } catch (error) {
          console.error('Error updating today streak:', error);
        }
      } else {
        // При повторном завершении обновляем только счетчик уроков, без XP
        try {
          const { updateTodayStreak } = await import('@/lib/api');
          await updateTodayStreak(userId, 1, 0, 0);
          console.log('✅ Today streak updated (lessons_completed +1, no XP for repeat)');
        } catch (error) {
          console.error('Error updating today streak:', error);
        }
      }

      if (isFirstCompletion) {
        console.log('💰 Awarding XP and updating stats (first completion)');
        const xpReward = lesson?.xp_reward ?? 0;
        console.log(`📊 Current XP: ${currentUser.experience_points}`);
        console.log(`➕ Lesson reward: +${xpReward} XP`);
        console.log(`🎯 New XP will be: ${currentUser.experience_points + xpReward}`);
        
        // Обновляем стрик
        const newStreak = await updateStreak(userId, currentUser);
        
        // Начисляем XP только за первое прохождение
        await pb.updateProfile(userId, {
          experience_points: currentUser.experience_points + xpReward,
          total_lessons_completed: currentUser.total_lessons_completed + 1,
          current_streak: newStreak,
        } as any);

        console.log('✅ Profile updated with lesson XP');

        // Обновляем Zustand store для синхронизации UI
        try {
          const { useAuth } = await import('@/hooks/useAuth');
          await useAuth.getState().refreshUser();
          console.log('✅ Zustand store refreshed');
        } catch (error) {
          console.error('Error refreshing Zustand store:', error);
        }

        // Обновляем прогресс по навыку
        await updateSkillProgress(userId, lesson);
      } else {
        console.log('🔁 Repeat completion - no XP awarded, only updating streak');
        
        // При повторном прохождении обновляем только стрик (активность сегодня)
        const newStreak = await updateStreak(userId, currentUser);
        
        await pb.updateProfile(userId, {
          current_streak: newStreak,
        } as any);

        // Обновляем Zustand store
        try {
          const { useAuth } = await import('@/hooks/useAuth');
          await useAuth.getState().refreshUser();
        } catch (error) {
          console.error('Error refreshing Zustand store:', error);
        }
      }
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
      requestKey: null,
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

/**
 * Получить все завершенные уроки пользователя одним запросом (оптимизировано)
 * Возвращает Set с ID завершенных уроков
 */
export async function getCompletedLessonIds(userId: string): Promise<Set<string>> {
  try {
    const completedAttempts = await pb.client.collection('user_lesson_attempts').getFullList({
      filter: `user = "${userId}" && status = "completed"`,
      fields: 'lesson', // Загружаем только поле lesson для оптимизации
      requestKey: null,
    });
    
    return new Set(completedAttempts.map((attempt: any) => attempt.lesson));
  } catch (error: unknown) {
    const err = error as { isAbort?: boolean; message?: string };
    if (err.isAbort || err.message?.includes('autocancelled')) {
      return new Set();
    }
    console.error('Error fetching completed lessons:', error);
    return new Set();
  }
}
