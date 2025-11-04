'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, MissionsSkeleton } from '@/components/ui';
import { MissionCompleteModal } from '@/components/missions/MissionCompleteModal';
import { MissionStreak } from '@/components/missions/MissionStreak';
import { MissionHistory } from '@/components/missions/MissionHistory';
import { ChallengeCard } from '@/components/missions/ChallengeCard';
import { AchievementUnlocked } from '@/components/achievements/AchievementUnlocked';
import { useAuth } from '@/hooks/useAuth';
import { useMissions } from '@/hooks/useMissions';
import { useGamification } from '@/hooks/useGamification';
import { CheckCircle, SkipForward } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { WeeklyChallenge } from '@/lib/types';

export default function MissionsPage() {
  const { user } = useAuth();
  const { 
    todayMissions, 
    history, 
    stats, 
    loading, 
    completeMission, 
    skipMission: handleSkip,
  } = useMissions(user?.id, user?.goals);
  
  const { trackAction, showAchievementModal, currentAchievement, dismissAchievement } = useGamification();

  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [selectedMissionTitle, setSelectedMissionTitle] = useState<string>('');
  const [selectedMissionCategory, setSelectedMissionCategory] = useState<string>('');

  // Mock weekly challenge (в будущем загружать из БД)
  const weeklyChallenge: WeeklyChallenge = {
    id: 'challenge_1',
    title: 'Неделя уверенности',
    description: 'Выполни 7 заданий на уверенность за неделю',
    category: 'confidence',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    target: 7,
    xp_reward: 50,
    icon: '💪',
  };

  const handleComplete = (missionId: string, missionTitle: string, missionCategory: string) => {
    setSelectedMissionId(missionId);
    setSelectedMissionTitle(missionTitle);
    setSelectedMissionCategory(missionCategory);
  };

  const handleConfirmComplete = async (
    proofText?: string,
    moodRating?: number,
    wasDifficult?: boolean
  ) => {
    if (!selectedMissionId) return;

    try {
      await completeMission(selectedMissionId, proofText, moodRating, wasDifficult);
      toast.success('Миссия выполнена! 🎉');
      
      // Закрываем модальное окно
      setSelectedMissionId(null);
      
      // Проверяем достижения после закрытия модального окна
      console.log('🎯 Checking achievements after mission completion...');
      await trackAction('mission_completed', {
        category: selectedMissionCategory,
        mood: moodRating,
        difficulty: wasDifficult,
      });
      console.log('✅ Achievement check completed for mission');
    } catch (error) {
      toast.error('Ошибка при отметке миссии');
    }
  };

  const handleSkipMission = async (missionId: string) => {
    try {
      await handleSkip(missionId);
      toast.info('Миссия пропущена');
    } catch (error) {
      toast.error('Ошибка при пропуске миссии');
    }
  };

  if (loading) {
    return <MissionsSkeleton />;
  }

  // Фильтруем только миссии со статусом assigned или completed (не skipped)
  const activeMissions = todayMissions.filter(m => m.status !== 'skipped');
  const completedToday = activeMissions.filter(m => m.status === 'completed').length;
  const totalToday = activeMissions.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Реальные задания 🎯
          </h1>
          <p className="text-gray-600">
            Практикуйте навыки в реальной жизни
          </p>
        </div>

        {/* Top Section: Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Today's Missions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  📅 Задания на сегодня ({completedToday}/{totalToday})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalToday === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">Миссии на сегодня пока не назначены</p>
                    <p className="text-sm">Проверьте, что в PocketBase созданы миссии из документации</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeMissions.map((userMission: any, index) => {
                      const mission = userMission.expand?.mission;
                      if (!mission) return null;

                      const isCompleted = userMission.status === 'completed';
                      const isSkipped = userMission.status === 'skipped';

                      return (
                        <motion.div
                          key={userMission.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-xl border-2 ${
                            isCompleted
                              ? 'bg-emerald-50 border-emerald-500'
                              : isSkipped
                              ? 'bg-gray-50 border-gray-300 opacity-60'
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-3xl flex-shrink-0">{mission.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {mission.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {mission.description}
                                  </p>
                                </div>
                                {isCompleted && (
                                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                                )}
                              </div>

                              {/* Mission metadata */}
                              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                <span className={`px-2 py-1 rounded ${
                                  mission.difficulty === 'easy'
                                    ? 'bg-green-100 text-green-700'
                                    : mission.difficulty === 'medium'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {mission.difficulty === 'easy' ? 'Легко' : mission.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                                </span>
                                <span className="text-amber-600 font-medium">
                                  ⭐ +{mission.xp_reward} XP
                                </span>
                              </div>

                              {/* Actions */}
                              {!isCompleted && !isSkipped && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleComplete(userMission.id, mission.title, mission.category)}
                                  >
                                    Отметить выполненным
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSkipMission(userMission.id)}
                                  >
                                    <SkipForward className="w-4 h-4 mr-1" />
                                    Пропустить
                                  </Button>
                                </div>
                              )}

                              {isCompleted && userMission.proof_text && (
                                <div className="mt-2 p-2 bg-white/50 rounded-lg">
                                  <p className="text-sm italic text-gray-700">
                                    "{userMission.proof_text}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {completedToday === totalToday && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-center text-white"
                      >
                        <div className="text-4xl mb-2">🎉</div>
                        <h3 className="font-bold text-lg mb-1">Все задания выполнены!</h3>
                        <p className="text-white/90 text-sm">
                          Отличная работа! Возвращайтесь завтра за новыми заданиями
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Streak */}
          <div>
            <MissionStreak
              streak={stats.current_streak}
              totalCompleted={stats.total_completed}
            />
          </div>
        </div>

        {/* Weekly Challenge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ChallengeCard
              challenge={weeklyChallenge}
              currentProgress={3}
            />
          </div>

          {/* History */}
          <div className="lg:col-span-2">
            <MissionHistory history={history} />
          </div>
        </div>

        {/* Stats Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Общая статистика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-xl">
                <div className="text-2xl font-bold text-indigo-600">
                  {stats.total_completed}
                </div>
                <div className="text-sm text-gray-600">Выполнено</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.completion_rate}%
                </div>
                <div className="text-sm text-gray-600">Процент успеха</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <div className="text-2xl font-bold text-amber-600">
                  {stats.total_xp_earned}
                </div>
                <div className="text-sm text-gray-600">XP заработано</div>
              </div>
              {stats.favorite_category && (
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-lg font-bold text-purple-600 capitalize">
                    {stats.favorite_category}
                  </div>
                  <div className="text-sm text-gray-600">Любимая категория</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complete Modal */}
      <MissionCompleteModal
        isOpen={selectedMissionId !== null}
        onClose={() => setSelectedMissionId(null)}
        onConfirm={handleConfirmComplete}
        missionTitle={selectedMissionTitle}
        missionCategory={selectedMissionCategory}
      />
      
      {/* Модальное окно достижения */}
      {currentAchievement && currentAchievement.expand?.achievement && (
        <AchievementUnlocked
          achievement={currentAchievement.expand.achievement as any}
          isOpen={showAchievementModal}
          onClose={dismissAchievement}
        />
      )}
    </div>
  );
}
