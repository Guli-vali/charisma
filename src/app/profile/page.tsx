'use client';

import React, { useState, useEffect } from 'react';
import { Edit2, Settings, Award, TrendingUp, Download } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ActivityCalendar } from '@/components/profile/ActivityCalendar';
import { SkillsMiniTree } from '@/components/profile/SkillsMiniTree';
import { EditProfile } from '@/components/profile/EditProfile';
import { getUserProfile, getUserStats, type UserProfile, type UserStats } from '@/lib/profile';
import { calculateLevel } from '@/lib/levels';
import { getLeagueInfo } from '@/lib/leagues';
import pb from '@/lib/pocketbase';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      loadProfileData();
    }
  }, [authUser]);

  const loadProfileData = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const [profileData, statsData, progressData] = await Promise.all([
        getUserProfile(authUser.id),
        getUserStats(authUser.id),
        pb.collection('user_progress').getFirstListItem(`user="${authUser.id}"`).catch(() => null),
      ]);

      setProfile(profileData);
      setStats(statsData);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (!authUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile || !stats) {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Не удалось загрузить профиль</p>
          <button
            onClick={loadProfileData}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
                </div>
    );
  }

  const level = calculateLevel(userProgress?.xp || 0);
  const leagueInfo = getLeagueInfo(userProgress?.current_league || 'bronze');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
              <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Профиль</h1>
              <p className="text-gray-600 mt-1">Ваши достижения и прогресс</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/settings"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Настройки</span>
              </Link>
            </div>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <AvatarUpload
                  profile={profile}
                  onUpdate={handleProfileUpdate}
                  size="large"
                  editable={true}
                />
                <button
                  onClick={() => setShowEditModal(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Редактировать профиль
                </button>
              </div>

              {/* User Info */}
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h2>
                <p className="text-gray-600">@{profile.username}</p>
                {profile.bio && (
                  <p className="mt-3 text-sm text-gray-700">{profile.bio}</p>
                )}
              </div>

              {/* Level & XP */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Уровень {level.level}</span>
                  <span className="text-sm text-gray-600">
                    {level.currentLevelXP}/{level.xpForNextLevel} XP
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${level.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* League */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{leagueInfo.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Текущая лига</p>
                    <p className="text-xl font-bold text-gray-900">{leagueInfo.name}</p>
              </div>
            </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-900">{stats.current_streak}</p>
                  <p className="text-xs text-indigo-600 mt-1">🔥 Текущий стрик</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-900">{stats.total_xp.toLocaleString()}</p>
                  <p className="text-xs text-amber-600 mt-1">⭐ Общий XP</p>
                </div>
              </div>

              {/* Recent Achievements */}
              <Link
                href="/achievements"
                className="mt-6 block p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Достижения</p>
                      <p className="text-sm text-gray-600">{stats.achievements_count} разблокировано</p>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </Link>
            </div>

            {/* Learning Goals */}
            {profile.learning_goals && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Цели обучения</h3>
            <div className="space-y-2">
                  {profile.learning_goals.split(',').map((goal) => (
                    <div
                      key={goal}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="text-xl">{getGoalEmoji(goal)}</span>
                      <span className="font-medium text-gray-700">{getGoalLabel(goal)}</span>
                    </div>
                  ))}
                </div>
                </div>
              )}
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Stats */}
            <ProfileStats stats={stats} />

            {/* Skills Mini Tree */}
            <SkillsMiniTree userId={authUser.id} />

            {/* Activity Calendar */}
            <ActivityCalendar userId={authUser.id} />

            {/* Export Data */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Экспорт данных</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Скачайте полную копию ваших данных
                  </p>
                </div>
                <Link
                  href="/settings?tab=account"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Экспорт
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfile
          profile={profile}
          onUpdate={handleProfileUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

function getGoalEmoji(goal: string): string {
  const emojis: Record<string, string> = {
    work: '💼',
    dating: '💕',
    leadership: '👔',
    networking: '🤝',
    confidence: '💪',
  };
  return emojis[goal] || '🎯';
}

function getGoalLabel(goal: string): string {
  const labels: Record<string, string> = {
    work: 'Карьера и работа',
    dating: 'Свидания и отношения',
    leadership: 'Лидерство',
    networking: 'Нетворкинг',
    confidence: 'Уверенность',
  };
  return labels[goal] || goal;
}
