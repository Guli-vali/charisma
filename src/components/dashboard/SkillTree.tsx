'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Lock, CheckCircle2 } from 'lucide-react';
import { SKILL_TREE_DATA, getTotalLevels } from '@/lib/skillTreeData';
import type { UserProgress, SkillTreeNode } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SkillTreeProps {
  progress: UserProgress[];
  onSkillClick?: (skillId: string) => void;
}

export function SkillTree({ progress, onSkillClick }: SkillTreeProps) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const totalLevels = getTotalLevels();

  const getSkillStatus = (skillId: string) => {
    const skillProgress = progress.find(p => p.skill_tree_node === skillId);
    return skillProgress?.status || 'locked';
  };

  const getSkillProgressPercentage = (skillId: string) => {
    const skillProgress = progress.find(p => p.skill_tree_node === skillId);
    return skillProgress?.progress_percentage || 0;
  };

  const isSkillAvailable = (skill: SkillTreeNode) => {
    // Если нет prerequisites, скилл доступен
    if (skill.prerequisites.length === 0) return true;
    
    // Проверяем, что все prerequisite скиллы завершены
    return skill.prerequisites.every(prereqId => {
      const prereqStatus = getSkillStatus(prereqId);
      return prereqStatus === 'completed';
    });
  };

  const handleSkillClick = (skill: SkillTreeNode) => {
    const status = getSkillStatus(skill.id);
    const available = isSkillAvailable(skill);
    
    if (status === 'locked' && !available) return;
    
    setSelectedSkill(skill.id);
    onSkillClick?.(skill.id);
  };

  // Группируем скиллы по уровням
  const skillsByLevel: Record<number, SkillTreeNode[]> = {};
  SKILL_TREE_DATA.forEach(skill => {
    if (!skillsByLevel[skill.level]) {
      skillsByLevel[skill.level] = [];
    }
    skillsByLevel[skill.level].push(skill);
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Дерево навыков</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-12 py-4">
          {Array.from({ length: totalLevels }, (_, i) => i + 1).map(level => (
            <div key={level} className="relative">
              {/* Level Label */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                Ур. {level}
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {skillsByLevel[level]?.map((skill, index) => {
                  const status = getSkillStatus(skill.id);
                  const progressPercent = getSkillProgressPercentage(skill.id);
                  const available = isSkillAvailable(skill);
                  const isLocked = status === 'locked' && !available;
                  const isCompleted = status === 'completed';
                  const isActive = status === 'available' || (status === 'locked' && available);

                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Connecting Line to Previous */}
                      {index > 0 && (
                        <div className="absolute right-full top-1/2 w-8 h-0.5 bg-gray-300 hidden md:block" />
                      )}

                      <button
                        onClick={() => handleSkillClick(skill)}
                        disabled={isLocked}
                        className={cn(
                          'relative w-full p-6 rounded-2xl transition-all duration-300 text-left',
                          'focus:outline-none focus:ring-2 focus:ring-offset-2',
                          isLocked && 'opacity-50 cursor-not-allowed bg-gray-100',
                          isCompleted && 'bg-emerald-50 border-2 border-emerald-500',
                          isActive && !isCompleted && 'bg-indigo-50 border-2 border-indigo-500 hover:scale-105',
                          selectedSkill === skill.id && 'ring-2 ring-purple-500'
                        )}
                      >
                        {/* Status Icon */}
                        <div className="absolute top-2 right-2">
                          {isLocked && <Lock className="w-5 h-5 text-gray-400" />}
                          {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        </div>

                        {/* Skill Icon */}
                        <div className="text-4xl mb-3">{skill.icon}</div>

                        {/* Skill Info */}
                        <h3 className={cn(
                          'font-semibold text-lg mb-1',
                          isLocked && 'text-gray-500',
                          isCompleted && 'text-emerald-700',
                          isActive && !isCompleted && 'text-indigo-700'
                        )}>
                          {skill.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{skill.description}</p>

                        {/* Progress Bar */}
                        {progressPercent > 0 && !isCompleted && (
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-indigo-500 rounded-full"
                            />
                          </div>
                        )}

                        {/* XP Reward */}
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <span>⭐</span>
                          <span>+{skill.xp_reward} XP</span>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Vertical List */}
        <div className="md:hidden space-y-4 mt-8">
          <p className="text-sm text-gray-500 text-center">
            На мобильных устройствах навыки отображаются списком
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
