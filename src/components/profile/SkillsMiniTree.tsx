'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TreePine, ChevronRight, CheckCircle, Circle, Lock } from 'lucide-react';
import pb from '@/lib/pocketbase';
import { SKILL_TREE, type Skill } from '@/lib/skillTreeData';

interface SkillsMiniTreeProps {
  userId: string;
}

interface SkillProgressData {
  skill_id: string;
  lessons_completed: number;
  total_lessons: number;
  is_unlocked: boolean;
}

export function SkillsMiniTree({ userId }: SkillsMiniTreeProps) {
  const [skillProgress, setSkillProgress] = useState<Map<string, SkillProgressData>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkillProgress();
  }, [userId]);

  const loadSkillProgress = async () => {
    try {
      setLoading(true);
      const records = await pb.collection('skill_progress').getFullList({
        filter: `user="${userId}"`,
      });

      const progressMap = new Map<string, SkillProgressData>();
      records.forEach((record: any) => {
        progressMap.set(record.skill_id, {
          skill_id: record.skill_id,
          lessons_completed: record.lessons_completed || 0,
          total_lessons: record.total_lessons || 0,
          is_unlocked: record.is_unlocked || false,
        });
      });

      setSkillProgress(progressMap);
    } catch (error) {
      console.error('Error loading skill progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillProgress = (skillId: string): SkillProgressData | null => {
    return skillProgress.get(skillId) || null;
  };

  const calculateProgress = (skillId: string): number => {
    const progress = getSkillProgress(skillId);
    if (!progress || progress.total_lessons === 0) return 0;
    return Math.round((progress.lessons_completed / progress.total_lessons) * 100);
  };

  const getOverallProgress = (): number => {
    let totalCompleted = 0;
    let totalLessons = 0;

    SKILL_TREE.forEach((skill) => {
      const progress = getSkillProgress(skill.id);
      if (progress) {
        totalCompleted += progress.lessons_completed;
        totalLessons += progress.total_lessons;
      }
    });

    if (totalLessons === 0) return 0;
    return Math.round((totalCompleted / totalLessons) * 100);
  };

  const getNextRecommendedSkill = (): Skill | null => {
    // Find first skill that is unlocked but not completed
    for (const skill of SKILL_TREE) {
      const progress = getSkillProgress(skill.id);
      if (progress?.is_unlocked && progress.lessons_completed < progress.total_lessons) {
        return skill;
      }
    }

    // If all unlocked skills are completed, find the next locked skill
    for (const skill of SKILL_TREE) {
      const progress = getSkillProgress(skill.id);
      if (!progress?.is_unlocked) {
        return skill;
      }
    }

    return null;
  };

  const getSkillStatus = (skillId: string): 'completed' | 'in-progress' | 'locked' => {
    const progress = getSkillProgress(skillId);
    if (!progress || !progress.is_unlocked) return 'locked';
    if (progress.lessons_completed >= progress.total_lessons) return 'completed';
    return 'in-progress';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Circle className="w-5 h-5 text-indigo-600" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const overallProgress = getOverallProgress();
  const nextSkill = getNextRecommendedSkill();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <TreePine className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Прогресс по навыкам</h2>
        </div>
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TreePine className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Прогресс по навыкам</h2>
            <p className="text-sm text-gray-600">Общий прогресс: {overallProgress}%</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1 transition-colors"
        >
          Полное дерево
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Next Recommended Skill */}
      {nextSkill && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{nextSkill.icon}</div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Рекомендуем продолжить</p>
                <p className="text-lg font-bold text-gray-900">{nextSkill.name}</p>
              </div>
            </div>
            <Link
              href={`/skills/${nextSkill.id}`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Начать
            </Link>
          </div>
        </div>
      )}

      {/* Skills List */}
      <div className="space-y-3">
        {SKILL_TREE.map((skill) => {
          const progress = calculateProgress(skill.id);
          const status = getSkillStatus(skill.id);
          const skillData = getSkillProgress(skill.id);

          return (
            <div
              key={skill.id}
              className={`rounded-xl p-4 transition-all duration-200 ${
                status === 'locked'
                  ? 'bg-gray-50 opacity-60'
                  : 'bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">{skill.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                    {getStatusIcon(status)}
                  </div>
                  <p className="text-xs text-gray-600">{skill.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{progress}%</p>
                  {skillData && (
                    <p className="text-xs text-gray-600">
                      {skillData.lessons_completed}/{skillData.total_lessons}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {status !== 'locked' && (
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      status === 'completed'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View Full Tree Link */}
      <div className="mt-6 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <TreePine className="w-5 h-5" />
          Открыть полное дерево навыков
        </Link>
      </div>
    </div>
  );
}

