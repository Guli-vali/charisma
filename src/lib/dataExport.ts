/**
 * Data Export Functionality
 * Allows users to export their complete profile data for backup
 */

import pb from './pocketbase';
import { getUserProfile, getUserSettings, getUserStats } from './profile';

// ==================== TYPES ====================

export interface ExportedData {
  exportDate: string;
  version: string;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    bio?: string;
    learning_goals?: string;
    created: string;
  };
  settings: any;
  stats: any;
  progress: {
    level: number;
    xp: number;
    current_streak: number;
    longest_streak: number;
  };
  lessons: any[];
  missions: any[];
  achievements: any[];
  skillProgress: any[];
  activityHistory: any[];
}

// ==================== EXPORT FUNCTIONS ====================

/**
 * Export all user data to JSON
 */
export async function exportUserData(userId: string): Promise<ExportedData> {
  try {
    // Fetch all user data
    const [
      profile,
      settings,
      stats,
      userProgress,
      lessons,
      missions,
      achievements,
      skillProgress,
    ] = await Promise.all([
      getUserProfile(userId),
      getUserSettings(userId),
      getUserStats(userId),
      pb.collection('user_progress').getFirstListItem(`user="${userId}"`).catch(() => null),
      pb.collection('lesson_progress').getFullList({ filter: `user="${userId}"`, sort: '-updated' }),
      pb.collection('daily_missions').getFullList({ filter: `user="${userId}"`, sort: '-updated' }),
      pb.collection('user_achievements').getFullList({ filter: `user="${userId}"`, sort: '-unlocked_at' }),
      pb.collection('skill_progress').getFullList({ filter: `user="${userId}"` }),
    ]);

    // Get activity history (last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const activityFilter = `user="${userId}" && updated>="${oneYearAgo.toISOString()}"`;
    
    const [lessonsActivity, missionsActivity] = await Promise.all([
      pb.collection('lesson_progress').getFullList({
        filter: activityFilter + ' && completed=true',
        sort: 'updated',
      }),
      pb.collection('daily_missions').getFullList({
        filter: activityFilter + ' && completed=true',
        sort: 'updated',
      }),
    ]);

    // Combine activity
    const activityHistory = [
      ...lessonsActivity.map((l) => ({
        type: 'lesson',
        date: l.completed_at || l.updated,
        xp: l.xp_earned || 0,
        data: l,
      })),
      ...missionsActivity.map((m) => ({
        type: 'mission',
        date: m.completed_at || m.updated,
        xp: m.xp_reward || 0,
        data: m,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Compile export data
    const exportData: ExportedData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        username: profile.username,
        bio: profile.bio,
        learning_goals: profile.learning_goals,
        created: profile.created,
      },
      settings: {
        ...settings,
        id: undefined,
        user: undefined,
      },
      stats: {
        ...stats,
        id: undefined,
        user: undefined,
      },
      progress: {
        level: userProgress?.level || 1,
        xp: userProgress?.xp || 0,
        current_streak: userProgress?.current_streak || 0,
        longest_streak: userProgress?.longest_streak || 0,
      },
      lessons: lessons.map((l) => ({
        lesson_id: l.lesson_id,
        skill_id: l.skill_id,
        completed: l.completed,
        score: l.score,
        attempts: l.attempts,
        xp_earned: l.xp_earned,
        completed_at: l.completed_at,
        created: l.created,
        updated: l.updated,
      })),
      missions: missions.map((m) => ({
        mission_id: m.mission_id,
        title: m.title,
        category: m.category,
        difficulty: m.difficulty,
        completed: m.completed,
        xp_reward: m.xp_reward,
        proof_text: m.proof_text,
        completed_at: m.completed_at,
        created: m.created,
        updated: m.updated,
      })),
      achievements: achievements.map((a) => ({
        achievement_id: a.achievement_id,
        title: a.title,
        description: a.description,
        category: a.category,
        xp_reward: a.xp_reward,
        unlocked_at: a.unlocked_at,
        notified: a.notified,
        created: a.created,
      })),
      skillProgress: skillProgress.map((s) => ({
        skill_id: s.skill_id,
        lessons_completed: s.lessons_completed,
        total_lessons: s.total_lessons,
        is_unlocked: s.is_unlocked,
        updated: s.updated,
      })),
      activityHistory,
    };

    return exportData;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw new Error('Failed to export user data');
  }
}

/**
 * Download exported data as JSON file
 */
export function downloadExportedData(data: ExportedData, filename?: string): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `charisma-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading exported data:', error);
    throw new Error('Failed to download exported data');
  }
}

/**
 * Export user data and trigger download
 */
export async function exportAndDownload(userId: string): Promise<void> {
  try {
    const data = await exportUserData(userId);
    downloadExportedData(data);
  } catch (error) {
    console.error('Error in export and download:', error);
    throw error;
  }
}

/**
 * Get export summary (for preview before download)
 */
export async function getExportSummary(userId: string): Promise<{
  totalLessons: number;
  totalMissions: number;
  totalAchievements: number;
  totalXP: number;
  accountAge: string;
}> {
  try {
    const [stats, profile] = await Promise.all([
      getUserStats(userId),
      getUserProfile(userId),
    ]);

    // Calculate account age
    const created = new Date(profile.created);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let accountAge: string;
    if (diffDays < 30) {
      accountAge = `${diffDays} ${diffDays === 1 ? 'день' : 'дней'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      accountAge = `${months} ${months === 1 ? 'месяц' : 'месяцев'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      accountAge = `${years} ${years === 1 ? 'год' : 'лет'}`;
    }

    return {
      totalLessons: stats.total_lessons,
      totalMissions: stats.total_missions,
      totalAchievements: stats.achievements_count,
      totalXP: stats.total_xp,
      accountAge,
    };
  } catch (error) {
    console.error('Error getting export summary:', error);
    throw new Error('Failed to get export summary');
  }
}

// ==================== IMPORT FUNCTIONS (Future) ====================

/**
 * Validate imported data structure
 */
export function validateImportData(data: any): boolean {
  try {
    if (!data || typeof data !== 'object') return false;
    if (!data.version || !data.user || !data.exportDate) return false;
    if (!data.user.id || !data.user.email) return false;
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse JSON file for import
 */
export async function parseImportFile(file: File): Promise<ExportedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        if (!validateImportData(data)) {
          reject(new Error('Invalid import file format'));
          return;
        }
        
        resolve(data as ExportedData);
      } catch (error) {
        reject(new Error('Failed to parse import file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read import file'));
    };
    
    reader.readAsText(file);
  });
}

