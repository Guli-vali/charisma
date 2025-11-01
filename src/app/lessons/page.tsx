'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, ProgressBar } from '@/components/ui';
import { SKILL_TREE_DATA } from '@/lib/skillTreeData';
import { useAuth } from '@/hooks/useAuth';
import { useUserProgress } from '@/hooks/useUserProgress';
import { BookOpen, Lock, CheckCircle2, Play } from 'lucide-react';

export default function LessonsPage() {
  const { user } = useAuth();
  const { progress } = useUserProgress(user?.id);

  const getSkillStatus = (skillId: string) => {
    const skillProgress = progress.find(p => p.skill_tree_node === skillId);
    return skillProgress?.status || 'locked';
  };

  const getSkillProgressPercentage = (skillId: string) => {
    const skillProgress = progress.find(p => p.skill_tree_node === skillId);
    return skillProgress?.progress_percentage || 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Все уроки</h1>
          <p className="text-gray-600">Выберите навык для изучения</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SKILL_TREE_DATA.map((skill) => {
            const status = getSkillStatus(skill.id);
            const progressPercent = getSkillProgressPercentage(skill.id);
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';

            return (
              <Card
                key={skill.id}
                className={`relative ${isLocked ? 'opacity-60' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl">{skill.icon}</div>
                    <div>
                      {isLocked && <Lock className="w-5 h-5 text-gray-400" />}
                      {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </div>
                  <CardTitle className={isLocked ? 'text-gray-500' : ''}>
                    {skill.name}
                  </CardTitle>
                  <CardDescription>{skill.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  {progressPercent > 0 && !isCompleted && (
                    <div>
                      <ProgressBar
                        value={progressPercent}
                        variant="primary"
                        size="sm"
                        showLabel={true}
                        label="Прогресс"
                      />
                    </div>
                  )}

                  {/* XP Reward */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-amber-500">⭐</span>
                    <span className="text-gray-600">+{skill.xp_reward} XP</span>
                  </div>

                  {/* Level */}
                  <div className="text-xs text-gray-500">
                    Уровень {skill.level} • {skill.prerequisites.length === 0 ? 'Доступно сразу' : `Требует: ${skill.prerequisites.length} навык(а)`}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant={isCompleted ? 'success' : 'primary'}
                    size="sm"
                    className="w-full"
                    disabled={isLocked}
                    asChild={!isLocked}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Заблокировано
                      </>
                    ) : (
                      <Link href={`/skills/${skill.id}`}>
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Пройти заново
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            {progressPercent > 0 ? 'Продолжить' : 'Начать'}
                          </>
                        )}
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
