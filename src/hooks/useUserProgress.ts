import { useState, useEffect, useCallback } from 'react';
import { getUserProgress, getSkillProgress, updateProgress } from '@/lib/api';
import type { UserProgress } from '@/lib/types';

export function useUserProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProgress = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await getUserProgress(userId);
      setProgress(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      if (cancelled) return;
      await loadProgress();
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, loadProgress]);

  const getSkillProgressById = async (skillNodeId: string) => {
    if (!userId) return null;
    return await getSkillProgress(userId, skillNodeId);
  };

  const updateSkillProgress = async (
    skillNode: string,
    progressPercentage: number,
    completedExercises: string[] = []
  ) => {
    if (!userId) return;

    try {
      const updated = await updateProgress(userId, skillNode, progressPercentage, completedExercises);
      
      // Обновляем локальное состояние
      setProgress(prev => {
        const index = prev.findIndex(p => p.skill_tree_node === skillNode);
        if (index >= 0) {
          const newProgress = [...prev];
          newProgress[index] = updated;
          return newProgress;
        }
        return [...prev, updated];
      });

      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    progress,
    loading,
    error,
    reload: loadProgress,
    getSkillProgressById,
    updateSkillProgress,
  };
}
