/**
 * Notifications and Reminders System
 * Handles push notifications, daily reminders, and motivational messages
 */

import { getUserSettings, getUserStats } from './profile';

// ==================== TYPES ====================

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: any;
}

export interface ReminderSchedule {
  time: string; // HH:MM format
  timezone: string;
  enabled: boolean;
}

// ==================== BROWSER NOTIFICATIONS ====================

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    throw new Error('Notifications are not supported in this browser');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Show browser notification
 */
export async function showNotification(config: NotificationConfig): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    // Use service worker if available
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(config.title, {
        body: config.body,
        icon: config.icon || '/logo.png',
        badge: config.badge || '/favicon-96x96.png',
        tag: config.tag,
        requireInteraction: config.requireInteraction || false,
        data: config.data,
      });
    } else {
      // Fallback to basic notification
      new Notification(config.title, {
        body: config.body,
        icon: config.icon || '/logo.png',
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// ==================== REMINDER SCHEDULING ====================

/**
 * Calculate time until next reminder
 */
export function getTimeUntilReminder(reminderTime: string, timezone: string): number {
  try {
    const now = new Date();
    const [hours, minutes] = reminderTime.split(':').map(Number);
    
    // Create target time for today
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    
    // If target is in the past, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    
    return target.getTime() - now.getTime();
  } catch (error) {
    console.error('Error calculating reminder time:', error);
    return -1;
  }
}

/**
 * Schedule daily lesson reminder
 */
export function scheduleLessonReminder(userId: string, settings: ReminderSchedule): NodeJS.Timeout | null {
  if (!settings.enabled) {
    return null;
  }

  const delay = getTimeUntilReminder(settings.time, settings.timezone);
  if (delay < 0) {
    return null;
  }

  return setTimeout(async () => {
    await sendLessonReminder(userId);
    // Reschedule for next day
    scheduleLessonReminder(userId, settings);
  }, delay);
}

/**
 * Send lesson reminder notification
 */
export async function sendLessonReminder(userId: string): Promise<void> {
  try {
    const stats = await getUserStats(userId);
    const settings = await getUserSettings(userId);

    if (!settings.lesson_reminders || !settings.notifications_enabled) {
      return;
    }

    const messages = [
      '📚 Время для урока! Не теряй свой стрик',
      '🔥 Поддержи свой стрик! Пройди урок сегодня',
      '⭐ Твои навыки ждут развития. Начни урок!',
      '💪 Каждый день приближает тебя к цели. Вперед!',
      '🎯 Сделай шаг к успеху - пройди урок прямо сейчас',
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    let body = randomMessage;
    if (stats.current_streak > 0) {
      body += `\n🔥 Стрик: ${stats.current_streak} дней`;
    }

    await showNotification({
      title: 'Charisma Pro',
      body,
      tag: 'lesson-reminder',
      requireInteraction: false,
      data: { type: 'lesson_reminder', userId },
    });
  } catch (error) {
    console.error('Error sending lesson reminder:', error);
  }
}

/**
 * Send mission reminder notification
 */
export async function sendMissionReminder(userId: string): Promise<void> {
  try {
    const settings = await getUserSettings(userId);

    if (!settings.mission_reminders || !settings.notifications_enabled) {
      return;
    }

    const messages = [
      '🎯 Выполни миссию и получи дополнительный XP!',
      '🚀 Новые миссии доступны. Проверь их!',
      '💎 Практикуй навыки в реальной жизни сегодня',
      '🌟 Время для реальной практики!',
      '🎪 Выйди из зоны комфорта - выполни миссию',
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await showNotification({
      title: 'Charisma Pro',
      body: randomMessage,
      tag: 'mission-reminder',
      requireInteraction: false,
      data: { type: 'mission_reminder', userId },
    });
  } catch (error) {
    console.error('Error sending mission reminder:', error);
  }
}

// ==================== ACHIEVEMENT NOTIFICATIONS ====================

/**
 * Send achievement unlocked notification
 */
export async function sendAchievementNotification(
  userId: string,
  achievementTitle: string,
  achievementDescription: string,
  xpReward: number
): Promise<void> {
  try {
    const settings = await getUserSettings(userId);

    if (!settings.notifications_enabled) {
      return;
    }

    await showNotification({
      title: `🏆 ${achievementTitle}`,
      body: `${achievementDescription}\n+${xpReward} XP`,
      tag: 'achievement',
      requireInteraction: true,
      data: { type: 'achievement', userId, achievementTitle },
    });
  } catch (error) {
    console.error('Error sending achievement notification:', error);
  }
}

// ==================== STREAK NOTIFICATIONS ====================

/**
 * Send streak milestone notification
 */
export async function sendStreakMilestone(userId: string, streak: number): Promise<void> {
  try {
    const settings = await getUserSettings(userId);

    if (!settings.notifications_enabled) {
      return;
    }

    const milestones = [7, 14, 30, 50, 100, 365];
    if (!milestones.includes(streak)) {
      return;
    }

    let emoji = '🔥';
    let message = '';

    if (streak === 7) {
      message = 'Отличное начало! Продолжай в том же духе';
    } else if (streak === 14) {
      message = 'Две недели подряд! Ты на верном пути';
    } else if (streak === 30) {
      message = 'Целый месяц! Это уже привычка';
    } else if (streak === 50) {
      emoji = '💎';
      message = '50 дней! Невероятная дисциплина';
    } else if (streak === 100) {
      emoji = '👑';
      message = '100 дней! Ты легенда';
    } else if (streak === 365) {
      emoji = '🏆';
      message = 'Целый год! Феноменально';
    }

    await showNotification({
      title: `${emoji} Стрик ${streak} дней!`,
      body: message,
      tag: 'streak-milestone',
      requireInteraction: true,
      data: { type: 'streak_milestone', userId, streak },
    });
  } catch (error) {
    console.error('Error sending streak milestone:', error);
  }
}

/**
 * Send streak warning (about to break)
 */
export async function sendStreakWarning(userId: string, streak: number): Promise<void> {
  try {
    const settings = await getUserSettings(userId);

    if (!settings.notifications_enabled) {
      return;
    }

    const now = new Date();
    const hours = now.getHours();
    
    // Only send warning in the evening (after 18:00)
    if (hours < 18) {
      return;
    }

    await showNotification({
      title: '⚠️ Не потеряй свой стрик!',
      body: `У тебя всего несколько часов, чтобы сохранить ${streak}-дневный стрик. Пройди урок прямо сейчас!`,
      tag: 'streak-warning',
      requireInteraction: true,
      data: { type: 'streak_warning', userId, streak },
    });
  } catch (error) {
    console.error('Error sending streak warning:', error);
  }
}

// ==================== WEEKLY REPORTS ====================

/**
 * Send weekly progress report
 */
export async function sendWeeklyReport(
  userId: string,
  weeklyData: {
    lessonsCompleted: number;
    missionsCompleted: number;
    xpEarned: number;
    daysActive: number;
  }
): Promise<void> {
  try {
    const settings = await getUserSettings(userId);

    if (!settings.notifications_enabled) {
      return;
    }

    const { lessonsCompleted, missionsCompleted, xpEarned, daysActive } = weeklyData;

    let message = '📊 Твои результаты за неделю:\n';
    message += `✅ Уроков: ${lessonsCompleted}\n`;
    message += `🎯 Миссий: ${missionsCompleted}\n`;
    message += `⭐ XP: ${xpEarned}\n`;
    message += `📅 Активных дней: ${daysActive}/7`;

    let emoji = '📈';
    let title = 'Недельный отчет';

    if (daysActive === 7) {
      emoji = '🔥';
      title = 'Идеальная неделя!';
      message += '\n\nПоздравляем! Ты был активен каждый день!';
    } else if (lessonsCompleted >= settings.weekly_goal) {
      emoji = '🎯';
      title = 'Цель достигнута!';
      message += '\n\nТы выполнил свою недельную цель!';
    }

    await showNotification({
      title: `${emoji} ${title}`,
      body: message,
      tag: 'weekly-report',
      requireInteraction: false,
      data: { type: 'weekly_report', userId, weeklyData },
    });
  } catch (error) {
    console.error('Error sending weekly report:', error);
  }
}

// ==================== MOTIVATIONAL MESSAGES ====================

/**
 * Get motivational message based on user progress
 */
export function getMotivationalMessage(stats: {
  current_streak: number;
  total_lessons: number;
  total_missions: number;
}): string {
  const { current_streak, total_lessons, total_missions } = stats;

  // Streak-based messages
  if (current_streak === 0) {
    return '🌱 Начни новый стрик сегодня! Каждое путешествие начинается с первого шага.';
  } else if (current_streak >= 30) {
    return '🔥 Твой стрик впечатляет! Продолжай развивать свои навыки каждый день.';
  }

  // Progress-based messages
  if (total_lessons < 5) {
    return '🚀 Отличное начало! Продолжай проходить уроки и развивай свою харизму.';
  } else if (total_lessons >= 50 && total_missions < 10) {
    return '💡 У тебя отличная теория! Попробуй применить знания в реальных миссиях.';
  } else if (total_missions >= 20) {
    return '⭐ Ты настоящий практик! Продолжай применять навыки в реальной жизни.';
  }

  // General messages
  const messages = [
    '💪 Развитие харизмы - это марафон, а не спринт. Продолжай двигаться вперед!',
    '🌟 Каждый урок делает тебя более уверенным в общении.',
    '🎯 Маленькие шаги каждый день приводят к большим результатам.',
    '🚀 Ты на правильном пути к развитию своих социальных навыков!',
    '✨ Практика делает мастера. Продолжай тренироваться!',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Send motivational notification
 */
export async function sendMotivationalMessage(userId: string): Promise<void> {
  try {
    const [settings, stats] = await Promise.all([
      getUserSettings(userId),
      getUserStats(userId),
    ]);

    if (!settings.notifications_enabled) {
      return;
    }

    const message = getMotivationalMessage({
      current_streak: stats.current_streak,
      total_lessons: stats.total_lessons,
      total_missions: stats.total_missions,
    });

    await showNotification({
      title: 'Charisma Pro',
      body: message,
      tag: 'motivational',
      requireInteraction: false,
      data: { type: 'motivational', userId },
    });
  } catch (error) {
    console.error('Error sending motivational message:', error);
  }
}

// ==================== NOTIFICATION MANAGEMENT ====================

/**
 * Initialize notification system for user
 */
export async function initializeNotifications(userId: string): Promise<boolean> {
  try {
    if (!isNotificationSupported()) {
      console.warn('Notifications not supported');
      return false;
    }

    // Request permission if not already granted
    if (Notification.permission === 'default') {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        return false;
      }
    }

    if (Notification.permission !== 'granted') {
      return false;
    }

    // Get user settings
    const settings = await getUserSettings(userId);

    // Schedule reminders if enabled
    if (settings.lesson_reminders) {
      scheduleLessonReminder(userId, {
        time: settings.reminder_time,
        timezone: settings.timezone,
        enabled: true,
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
}

/**
 * Clear all scheduled notifications
 */
export function clearAllNotifications(): void {
  // Note: In a real implementation, you'd need to keep track of timeout IDs
  // and clear them here. For simplicity, this is a placeholder.
  console.log('Clearing all scheduled notifications');
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Play notification sound (if enabled in settings)
 */
export async function playNotificationSound(userId: string): Promise<void> {
  try {
    const settings = await getUserSettings(userId);
    
    if (!settings.sound_effects) {
      return;
    }

    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

