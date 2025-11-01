'use client';

import { useRouter } from 'next/navigation';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { SkillTree } from '@/components/dashboard/SkillTree';
import { DailyMissions } from '@/components/dashboard/DailyMissions';
import { AchievementsCard } from '@/components/dashboard/AchievementsCard';
import { useAuth } from '@/hooks/useAuth';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { getUserAchievements, calculateUserLevel } from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { progress, loading: progressLoading } = useUserProgress(user?.id);
  const { missions, currentStreak, loading: missionsLoading, completeMission } = useDailyMissions(user?.id);
  
  if (!user) {
    return null;
  }

  const level = calculateUserLevel(user.experience_points);
  const achievements = getUserAchievements();

  const handleCompleteMission = async (missionId: string) => {
    try {
      await completeMission('real_mission');
      toast.success('Миссия выполнена! +10 XP');
    } catch (error) {
      toast.error('Ошибка при выполнении миссии');
    }
  };

  const handleSkillClick = (skillId: string) => {
    // Переход к урокам навыка
    router.push(`/skills/${skillId}`);
  };

  if (progressLoading || missionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Top Section: Welcome & Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WelcomeCard
            userName={user.name}
            xp={user.experience_points}
            level={level}
          />
          <StreakCard
            streak={currentStreak}
            league={user.current_league}
          />
        </div>

        {/* Skill Tree Section */}
        <SkillTree
          progress={progress}
          onSkillClick={handleSkillClick}
        />

        {/* Bottom Section: Missions & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyMissions
            missions={missions}
            onComplete={handleCompleteMission}
          />
          <AchievementsCard
            achievements={achievements}
          />
        </div>
      </div>
    </div>
  );
}
