'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { SkillTree } from '@/components/dashboard/SkillTree';
import { DailyMissions } from '@/components/dashboard/DailyMissions';
import { AchievementsCard } from '@/components/dashboard/AchievementsCard';
import { DashboardSkeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { getUserAchievements, calculateUserLevel } from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { progress, loading: progressLoading } = useUserProgress(user?.id);
  const { missions, currentStreak, loading: missionsLoading, completeMission, reload } = useDailyMissions(user?.id);
  
  // Автоматически обновляем данные при навигации на дашборд
  useEffect(() => {
    if (user?.id && pathname === '/dashboard') {
      console.log('🔄 Dashboard page opened - reloading missions...');
      console.log('📞 Calling reload()...');
      console.log('🔍 reload type:', typeof reload, 'reload:', reload);
      reload();
      console.log('✅ reload() called');
    } else {
      console.log('⚠️ Dashboard effect skipped:', { userId: user?.id, pathname });
    }
  }, [pathname, user?.id, reload]); // Срабатывает при изменении пути или пользователя

  // Также обновляем при возврате фокуса на окно (смена вкладок браузера)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id) {
        console.log('🔄 Dashboard became visible - reloading missions...');
        reload();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id, reload]);
  
  if (!user) {
    return null;
  }

  const level = calculateUserLevel(user.experience_points);

  const handleCompleteMission = async (missionId: string) => {
    try {
      // Определяем тип миссии по ID
      let missionType: 'complete_lesson' | 'real_mission' | 'earn_xp';
      if (missionId === 'complete_lesson') {
        missionType = 'complete_lesson';
      } else if (missionId === 'real_mission') {
        missionType = 'real_mission';
      } else if (missionId === 'earn_xp') {
        missionType = 'earn_xp';
      } else {
        throw new Error('Unknown mission type');
      }
      
      await completeMission(missionType);
      toast.success('Миссия выполнена! +10 XP');
      
      // Перезагружаем данные для обновления UI
      await reload();
    } catch (error) {
      console.error('Error completing mission:', error);
      toast.error('Ошибка при выполнении миссии');
    }
  };

  const handleSkillClick = (skillId: string) => {
    // Переход к урокам навыка
    router.push(`/skills/${skillId}`);
  };

  if (progressLoading || missionsLoading) {
    return <DashboardSkeleton />;
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
          <AchievementsCard />
        </div>
      </div>
    </div>
  );
}
