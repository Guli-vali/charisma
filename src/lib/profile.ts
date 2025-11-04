/**
 * Profile and Settings API Functions
 * Handles user profile, settings, stats, and avatar management
 */

import pb from './pocketbase';
import type { RecordModel } from 'pocketbase';

// ==================== TYPES ====================

export interface UserProfile extends RecordModel {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  learning_goals?: string;
  created: string;
  updated: string;
}

export interface UserSettings extends RecordModel {
  id: string;
  user: string;
  notifications_enabled: boolean;
  lesson_reminders: boolean;
  mission_reminders: boolean;
  sound_effects: boolean;
  animations_enabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'ru' | 'en';
  privacy_profile: 'public' | 'friends' | 'private';
  show_in_leaderboard: boolean;
  show_activity_history: boolean;
  weekly_goal: number;
  reminder_time: string;
  timezone: string;
  created: string;
  updated: string;
}

export interface UserStats extends RecordModel {
  id: string;
  user: string;
  total_lessons: number;
  total_missions: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  favorite_category?: string;
  join_date: string;
  last_active: string;
  achievements_count: number;
  days_active: number;
  average_lesson_score?: number;
  total_practice_time: number;
  updated: string;
}

export interface ActivityDay {
  date: string;
  lessons: number;
  missions: number;
  xp: number;
  intensity: number; // 0-4
}

// ==================== PROFILE FUNCTIONS ====================

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const profile = await pb.collection('users').getOne<UserProfile>(userId);
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<Omit<UserProfile, 'id' | 'created' | 'updated'>>
): Promise<UserProfile> {
  try {
    const profile = await pb.collection('users').update<UserProfile>(userId, data);
    return profile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(userId: string, file: File): Promise<UserProfile> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Image must be less than 2MB');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const profile = await pb.collection('users').update<UserProfile>(userId, formData);
    return profile;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error instanceof Error ? error : new Error('Failed to upload avatar');
  }
}

/**
 * Delete user avatar
 */
export async function deleteAvatar(userId: string): Promise<UserProfile> {
  try {
    const profile = await pb.collection('users').update<UserProfile>(userId, {
      avatar: null,
    });
    return profile;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw new Error('Failed to delete avatar');
  }
}

/**
 * Get avatar URL
 */
export function getAvatarUrl(profile: UserProfile, size: 'thumb' | 'small' | 'medium' | 'large' = 'medium'): string {
  if (!profile.avatar) {
    return '';
  }

  const sizeMap = {
    thumb: '50x50',
    small: '100x100',
    medium: '200x200',
    large: '400x400',
  };

  return pb.files.getUrl(profile, profile.avatar, { thumb: sizeMap[size] });
}

/**
 * Get user initials for avatar placeholder
 */
export function getUserInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ==================== SETTINGS FUNCTIONS ====================

/**
 * Get user settings
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const settings = await pb
      .collection('user_settings')
      .getFirstListItem<UserSettings>(`user="${userId}"`);
    return settings;
  } catch (error: any) {
    if (error?.status === 404) {
      // Create default settings if not found
      return createDefaultSettings(userId);
    }
    console.error('Error fetching user settings:', error);
    throw new Error('Failed to fetch user settings');
  }
}

/**
 * Create default settings for a new user
 */
export async function createDefaultSettings(userId: string): Promise<UserSettings> {
  try {
    const settings = await pb.collection('user_settings').create<UserSettings>({
      user: userId,
      notifications_enabled: true,
      lesson_reminders: true,
      mission_reminders: true,
      sound_effects: true,
      animations_enabled: true,
      theme: 'auto',
      language: 'ru',
      privacy_profile: 'public',
      show_in_leaderboard: true,
      show_activity_history: true,
      weekly_goal: 7,
      reminder_time: '19:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Moscow',
    });
    return settings;
  } catch (error) {
    console.error('Error creating default settings:', error);
    throw new Error('Failed to create default settings');
  }
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  data: Partial<Omit<UserSettings, 'id' | 'user' | 'created' | 'updated'>>
): Promise<UserSettings> {
  try {
    // Get current settings
    const currentSettings = await getUserSettings(userId);
    
    // Update settings
    const settings = await pb
      .collection('user_settings')
      .update<UserSettings>(currentSettings.id, data);
    
    return settings;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw new Error('Failed to update user settings');
  }
}

// ==================== STATS FUNCTIONS ====================

/**
 * Get user stats
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const stats = await pb
      .collection('user_stats')
      .getFirstListItem<UserStats>(`user="${userId}"`);
    return stats;
  } catch (error: any) {
    if (error?.status === 404) {
      // Create default stats if not found
      return createDefaultStats(userId);
    }
    console.error('Error fetching user stats:', error);
    throw new Error('Failed to fetch user stats');
  }
}

/**
 * Create default stats for a new user
 */
export async function createDefaultStats(userId: string): Promise<UserStats> {
  try {
    const user = await getUserProfile(userId);
    const stats = await pb.collection('user_stats').create<UserStats>({
      user: userId,
      total_lessons: 0,
      total_missions: 0,
      total_xp: 0,
      current_streak: 0,
      longest_streak: 0,
      join_date: user.created,
      last_active: new Date().toISOString(),
      achievements_count: 0,
      days_active: 0,
      total_practice_time: 0,
    });
    return stats;
  } catch (error) {
    console.error('Error creating default stats:', error);
    throw new Error('Failed to create default stats');
  }
}

/**
 * Update user stats
 */
export async function updateUserStats(
  userId: string,
  data: Partial<Omit<UserStats, 'id' | 'user' | 'created' | 'updated'>>
): Promise<UserStats> {
  try {
    const currentStats = await getUserStats(userId);
    const stats = await pb
      .collection('user_stats')
      .update<UserStats>(currentStats.id, {
        ...data,
        last_active: new Date().toISOString(),
      });
    return stats;
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw new Error('Failed to update user stats');
  }
}

/**
 * Refresh user stats from source data
 * Recalculates all stats from lessons, missions, achievements, etc.
 */
export async function refreshUserStats(userId: string): Promise<UserStats> {
  try {
    // Fetch all source data
    const [lessons, missions, achievements, progressRecords] = await Promise.all([
      pb.collection('lesson_progress').getFullList({
        filter: `user="${userId}" && completed=true`,
      }),
      pb.collection('daily_missions').getFullList({
        filter: `user="${userId}" && completed=true`,
      }),
      pb.collection('user_achievements').getFullList({
        filter: `user="${userId}"`,
      }),
      pb.collection('user_progress').getFullList({
        filter: `user="${userId}"`,
      }),
    ]);

    // Calculate total XP
    const totalXP = progressRecords.reduce((sum, record) => sum + (record.xp || 0), 0);

    // Calculate average lesson score
    const completedLessons = lessons.filter((l) => l.score !== undefined);
    const averageScore =
      completedLessons.length > 0
        ? completedLessons.reduce((sum, l) => sum + l.score, 0) / completedLessons.length
        : undefined;

    // Calculate favorite category
    const categoryCount: Record<string, number> = {};
    lessons.forEach((lesson) => {
      if (lesson.skill_id) {
        categoryCount[lesson.skill_id] = (categoryCount[lesson.skill_id] || 0) + 1;
      }
    });
    const favoriteCategory = Object.keys(categoryCount).length > 0
      ? Object.entries(categoryCount).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
      : undefined;

    // Calculate days active (unique dates with activity)
    const activityDates = new Set<string>();
    lessons.forEach((l) => {
      const date = new Date(l.completed_at || l.updated).toISOString().split('T')[0];
      activityDates.add(date);
    });
    missions.forEach((m) => {
      const date = new Date(m.completed_at || m.updated).toISOString().split('T')[0];
      activityDates.add(date);
    });

    // Get current streak from user_progress
    const userProgress = progressRecords[0];
    const currentStreak = userProgress?.current_streak || 0;
    const longestStreak = userProgress?.longest_streak || 0;

    // Estimate practice time (10 minutes per lesson, 5 per mission)
    const estimatedTime = lessons.length * 10 + missions.length * 5;

    // Get user creation date
    const user = await getUserProfile(userId);

    // Update stats
    const stats = await updateUserStats(userId, {
      total_lessons: lessons.length,
      total_missions: missions.length,
      total_xp: totalXP,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      favorite_category: favoriteCategory,
      join_date: user.created,
      achievements_count: achievements.length,
      days_active: activityDates.size,
      average_lesson_score: averageScore,
      total_practice_time: estimatedTime,
    });

    return stats;
  } catch (error) {
    console.error('Error refreshing user stats:', error);
    throw new Error('Failed to refresh user stats');
  }
}

// ==================== ACTIVITY CALENDAR ====================

/**
 * Get activity data for calendar
 * Returns activity for the last 365 days
 */
export async function getActivityCalendar(userId: string): Promise<ActivityDay[]> {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString();

    // Fetch lessons and missions from the last year
    const [lessons, missions] = await Promise.all([
      pb.collection('lesson_progress').getFullList({
        filter: `user="${userId}" && completed=true && updated>="${oneYearAgoStr}"`,
        sort: 'updated',
      }),
      pb.collection('daily_missions').getFullList({
        filter: `user="${userId}" && completed=true && updated>="${oneYearAgoStr}"`,
        sort: 'updated',
      }),
    ]);

    // Group by date
    const activityByDate: Record<string, ActivityDay> = {};

    lessons.forEach((lesson) => {
      const date = new Date(lesson.completed_at || lesson.updated).toISOString().split('T')[0];
      if (!activityByDate[date]) {
        activityByDate[date] = { date, lessons: 0, missions: 0, xp: 0, intensity: 0 };
      }
      activityByDate[date].lessons += 1;
      activityByDate[date].xp += lesson.xp_earned || 0;
    });

    missions.forEach((mission) => {
      const date = new Date(mission.completed_at || mission.updated).toISOString().split('T')[0];
      if (!activityByDate[date]) {
        activityByDate[date] = { date, lessons: 0, missions: 0, xp: 0, intensity: 0 };
      }
      activityByDate[date].missions += 1;
      activityByDate[date].xp += mission.xp_reward || 0;
    });

    // Calculate intensity (0-4 based on total activity)
    const activities = Object.values(activityByDate);
    if (activities.length > 0) {
      const maxActivity = Math.max(...activities.map((a) => a.lessons + a.missions));
      activities.forEach((activity) => {
        const total = activity.lessons + activity.missions;
        activity.intensity = Math.min(4, Math.ceil((total / maxActivity) * 4));
      });
    }

    return activities;
  } catch (error) {
    console.error('Error fetching activity calendar:', error);
    throw new Error('Failed to fetch activity calendar');
  }
}

// ==================== ACCOUNT MANAGEMENT ====================

/**
 * Delete user account
 * Requires confirmation string to match email
 */
export async function deleteAccount(userId: string, confirmation: string): Promise<void> {
  try {
    const user = await getUserProfile(userId);
    
    if (confirmation !== user.email) {
      throw new Error('Confirmation email does not match');
    }

    // Delete user (cascade will handle related records)
    await pb.collection('users').delete(userId);
    
    // Log out
    pb.authStore.clear();
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error instanceof Error ? error : new Error('Failed to delete account');
  }
}

/**
 * Update user email
 */
export async function updateEmail(userId: string, newEmail: string, password: string): Promise<UserProfile> {
  try {
    // First verify the password
    const user = await getUserProfile(userId);
    await pb.collection('users').authWithPassword(user.email, password);

    // Update email
    const updatedUser = await pb.collection('users').update<UserProfile>(userId, {
      email: newEmail,
    });

    // Request email verification
    await pb.collection('users').requestVerification(newEmail);

    return updatedUser;
  } catch (error) {
    console.error('Error updating email:', error);
    throw new Error('Failed to update email');
  }
}

/**
 * Update user password
 */
export async function updatePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  try {
    // Verify old password
    const user = await getUserProfile(userId);
    await pb.collection('users').authWithPassword(user.email, oldPassword);

    // Update password
    await pb.collection('users').update(userId, {
      password: newPassword,
      passwordConfirm: newPassword,
    });
  } catch (error) {
    console.error('Error updating password:', error);
    throw new Error('Failed to update password');
  }
}

// ==================== INITIALIZATION ====================

/**
 * Initialize profile data for a new user
 * Creates default settings and stats
 */
export async function initializeUserProfile(userId: string): Promise<void> {
  try {
    await Promise.all([
      createDefaultSettings(userId).catch((e) => console.error('Settings already exist:', e)),
      createDefaultStats(userId).catch((e) => console.error('Stats already exist:', e)),
    ]);
  } catch (error) {
    console.error('Error initializing user profile:', error);
    // Don't throw - this is called after registration
  }
}

