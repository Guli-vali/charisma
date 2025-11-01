'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, ProgressBar } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { getLessonsBySkillNode, isLessonCompleted } from '@/lib/lessons';
import { getSkillById } from '@/lib/skillTreeData';
import { ArrowLeft, Play, CheckCircle2, Lock } from 'lucide-react';
import type { Lesson } from '@/lib/types';

interface SkillPageProps {
  params: Promise<{ skillId: string }>;
}

export default function SkillPage({ params }: SkillPageProps) {
  const { skillId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const skill = getSkillById(skillId);

  useEffect(() => {
    if (!user || !skillId) return;

    const loadLessons = async () => {
      try {
        setLoading(true);
        const lessonsData = await getLessonsBySkillNode(skillId);
        setLessons(lessonsData);

        // Проверяем, какие уроки завершены
        const completed = new Set<string>();
        for (const lesson of lessonsData) {
          const isCompleted = await isLessonCompleted(user.id, lesson.id);
          if (isCompleted) {
            completed.add(lesson.id);
          }
        }
        setCompletedLessons(completed);
      } catch (error) {
        console.error('Error loading lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, [skillId, user]);

  if (!skill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Навык не найден</h2>
          <Button onClick={() => router.push('/lessons')}>Вернуться к урокам</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/lessons')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Все навыки
        </Button>

        {/* Skill Header */}
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="text-6xl">{skill.icon}</div>
              <div className="flex-1">
                <CardTitle className="text-white text-3xl mb-2">{skill.name}</CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  {skill.description}
                </CardDescription>
                <div className="mt-3 flex items-center gap-2 text-white/80">
                  <span>⭐ {skill.xp_reward} XP</span>
                  <span>•</span>
                  <span>Уровень {skill.level}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Уроки</h2>
          
          {lessons.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-600">
                <p>Уроки для этого навыка пока не созданы.</p>
                <p className="text-sm mt-2">Скоро здесь появятся интерактивные уроки!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => {
                const isCompleted = completedLessons.has(lesson.id);
                const isFirst = index === 0;
                const prevCompleted = index === 0 || completedLessons.has(lessons[index - 1].id);
                const isAvailable = isFirst || prevCompleted;

                return (
                  <Card
                    key={lesson.id}
                    className={`${!isAvailable ? 'opacity-60' : ''}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {/* Lesson Number */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isAvailable
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : lesson.lesson_number}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {lesson.description}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>⭐ {lesson.xp_reward} XP</span>
                            <span>•</span>
                            <span>{lesson.exercises.length} упражнений</span>
                            {lesson.is_checkpoint && (
                              <>
                                <span>•</span>
                                <span className="text-amber-600 font-medium">🏁 Контрольная точка</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          variant={isCompleted ? 'success' : 'primary'}
                          disabled={!isAvailable}
                          asChild={isAvailable}
                        >
                          {!isAvailable ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Заблокировано
                            </>
                          ) : (
                            <Link href={`/lessons/${lesson.id}`}>
                              {isCompleted ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Пройти заново
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Начать
                                </>
                              )}
                            </Link>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
