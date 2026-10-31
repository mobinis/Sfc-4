import {
  AppState,
  AdaptiveReminderItem,
  AdaptiveReminderSettings,
  AdaptiveReminderCategory,
  AdaptiveUrgency
} from '../types';
import { DateUtils } from './dateUtils';
import { soundManager } from './soundHaptics';

export const DEFAULT_ADAPTIVE_REMINDER_SETTINGS: AdaptiveReminderSettings = {
  enabled: true,
  webNotificationsEnabled: false,
  soundEnabled: true,
  quietHoursStart: '22:30',
  quietHoursEnd: '07:00',
  channels: {
    routines: true,
    targets: true,
    relationships: true,
    screenCurfew: true,
    caffeineCutoff: true,
    learning: true
  },
  snoozedUntil: {},
  dismissedToday: {}
};

/**
 * Checks if current time is within quiet hours (e.g. 22:30 - 07:00)
 */
export function isWithinQuietHours(settings: AdaptiveReminderSettings, now: Date = new Date()): boolean {
  if (!settings.quietHoursStart || !settings.quietHoursEnd) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
  const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);
  const startMinutes = startH * 60 + (startM || 0);
  const endMinutes = endH * 60 + (endM || 0);

  if (startMinutes > endMinutes) {
    // Overnight quiet hours, e.g. 22:30 to 07:00
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * Safely computes difference in days between two ISO YYYY-MM-DD date strings
 */
function safeDaysDiff(fromDateStr?: string | null, toDateStr?: string | null): number {
  if (!fromDateStr || !toDateStr) return 0;
  return DateUtils.daysBetween(fromDateStr, toDateStr);
}

/**
 * Parses time string (e.g. "23:00") into total minutes from start of day
 */
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/**
 * Formats minutes difference into human friendly label
 */
function formatMinutesOffset(diffMinutes: number): string {
  if (diffMinutes === 0) return 'Right now';
  if (diffMinutes > 0 && diffMinutes < 60) return `In ${diffMinutes}m`;
  if (diffMinutes >= 60) return `In ${Math.round(diffMinutes / 60)}h`;
  const abs = Math.abs(diffMinutes);
  if (abs < 60) return `${abs}m ago`;
  return `${Math.round(abs / 60)}h ago`;
}

/**
 * Main pure evaluator: generates active, prioritized cross-domain reminders
 */
export function generateAdaptiveReminders(
  state: AppState,
  now: Date = new Date()
): AdaptiveReminderItem[] {
  const settings = state.adaptiveReminderSettings || DEFAULT_ADAPTIVE_REMINDER_SETTINGS;
  if (!settings.enabled) return [];

  const reminders: AdaptiveReminderItem[] = [];
  const today = DateUtils.todayStr();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTs = now.getTime();

  // Helper to check if item is completed today
  const isHabitDoneToday = (habitId: string) => {
    return state.ev.some(e => e.n === habitId && e.d === today);
  };

  // Helper to check snooze / dismiss status
  const isSnoozedOrDismissed = (id: string): boolean => {
    const snoozedUntil = settings.snoozedUntil?.[id];
    if (snoozedUntil && snoozedUntil > nowTs) return true;
    const dismissedDate = settings.dismissedToday?.[id];
    if (dismissedDate === today) return true;
    return false;
  };

  // 1. CIRCADIAN WIND-DOWN CURFEW & CAFFEINE CUTOFF
  if (state.circadianConfig?.enabled) {
    const { bedTimeStr, screenCurfewHoursBeforeSleep, caffeineCutoffHoursBeforeSleep } = state.circadianConfig;
    const bedMinutes = timeToMinutes(bedTimeStr || '23:00');

    // A. Screen Curfew
    if (settings.channels.screenCurfew) {
      const curfewStartMinutes = (bedMinutes - (screenCurfewHoursBeforeSleep || 2) * 60 + 1440) % 1440;
      const id = 'circadian_screen_curfew';

      if (!isSnoozedOrDismissed(id)) {
        // If within 30 min before curfew OR during curfew window up to bedtime
        const isCurfewActive =
          (curfewStartMinutes < bedMinutes && currentMinutes >= curfewStartMinutes && currentMinutes <= bedMinutes) ||
          (curfewStartMinutes > bedMinutes && (currentMinutes >= curfewStartMinutes || currentMinutes <= bedMinutes));

        if (isCurfewActive) {
          const minutesToBed = (bedMinutes - currentMinutes + 1440) % 1440;
          reminders.push({
            id,
            title: 'Digital Wind-Down Curfew Active',
            message: `Bedtime is scheduled in ~${minutesToBed} mins. Dim blue light, put devices away, and prepare nervous system for deep rest.`,
            category: 'screen_curfew',
            urgency: minutesToBed <= 30 ? 'critical' : 'urgent',
            icon: '🌙',
            domainBadge: 'Circadian Rest',
            dueTimeLabel: `${screenCurfewHoursBeforeSleep}h before sleep`,
            timestamp: nowTs,
            actionType: 'wind_down',
            actionLabel: 'Bedtime Pacer'
          });
        }
      }
    }

    // B. Caffeine Cutoff
    if (settings.channels.caffeineCutoff) {
      const caffeineCutoffMinutes = (bedMinutes - (caffeineCutoffHoursBeforeSleep || 10) * 60 + 1440) % 1440;
      const id = 'circadian_caffeine_cutoff';

      if (!isSnoozedOrDismissed(id)) {
        // Trigger alert around caffeine cutoff window (e.g. from 30 min before cutoff until evening)
        const isPastCutoff =
          (caffeineCutoffMinutes < bedMinutes && currentMinutes >= caffeineCutoffMinutes && currentMinutes < bedMinutes);

        if (isPastCutoff) {
          reminders.push({
            id,
            title: 'Caffeine Cutoff Active',
            message: `Adenosine sleep pressure is building. Switch to water or herbal tea to safeguard slow-wave restorative sleep.`,
            category: 'caffeine_cutoff',
            urgency: 'gentle',
            icon: '☕',
            domainBadge: 'Circadian Rhythm',
            dueTimeLabel: 'Cutoff passed',
            timestamp: nowTs,
            actionType: 'custom',
            actionLabel: 'Noted'
          });
        }
      }
    }
  }

  // 2. RELATIONSHIP CIRCLE CHECK-IN CADENCES
  if (settings.channels.relationships && state.relationshipContacts) {
    state.relationshipContacts.forEach(contact => {
      const id = `contact_cadence_${contact.id}`;
      if (isSnoozedOrDismissed(id)) return;

      const daysElapsed = contact.lastCheckInDate
        ? safeDaysDiff(contact.lastCheckInDate, today)
        : contact.targetCadenceDays; // If no previous check-in, prompt for initial touchpoint
      if (daysElapsed >= contact.targetCadenceDays) {
        const daysOverdue = daysElapsed - contact.targetCadenceDays;
        const isSevere = daysOverdue >= 5;

        reminders.push({
          id,
          title: `Connect with ${contact.name}`,
          message: `It has been ${daysElapsed} days since your last check-in (target: every ${contact.targetCadenceDays}d). Send a quick ${contact.preferredChannel} or thoughtful note.`,
          category: 'relationship',
          urgency: isSevere ? 'urgent' : 'due_now',
          icon: contact.avatarEmoji || '🤝',
          domainBadge: 'Relationship Circle',
          dueTimeLabel: daysOverdue === 0 ? 'Due today' : `${daysOverdue}d overdue`,
          timestamp: nowTs,
          actionType: 'log_deed',
          actionPayload: contact.id,
          actionLabel: `Check In (${contact.preferredChannel})`
        });
      }
    });
  }

  // 3. MEASURABLE TARGETS & UPCOMING MILESTONES
  if (settings.channels.targets && state.measurableTargets) {
    state.measurableTargets.forEach(target => {
      if (target.status !== 'active') return;

      // A. Target daily reminder time
      if (target.reminderEnabled && target.reminderTime) {
        const id = `target_rem_${target.id}`;
        if (!isSnoozedOrDismissed(id)) {
          const remMinutes = timeToMinutes(target.reminderTime);
          const diff = remMinutes - currentMinutes;

          // Check if within +/- 45 mins
          if (Math.abs(diff) <= 45) {
            reminders.push({
              id,
              title: `Target: ${target.title}`,
              message: `Daily check-in for "${target.title}" (${target.currentProgress}/${target.targetValue} ${target.unit}).`,
              category: 'target_milestone',
              urgency: 'due_now',
              icon: target.icon || '🎯',
              domainBadge: 'Progression Target',
              dueTimeLabel: formatMinutesOffset(diff),
              timestamp: nowTs,
              actionType: 'open_target',
              actionPayload: target.id,
              actionLabel: 'Log Progress'
            });
          }
        }
      }

      // B. Milestone deadlines
      if (target.milestones && target.milestones.length > 0) {
        target.milestones.forEach(m => {
          if (m.isCompleted || !m.targetDate) return;
          const mId = `target_ms_${target.id}_${m.id}`;
          if (isSnoozedOrDismissed(mId)) return;

          const daysLeft = safeDaysDiff(today, m.targetDate);
          if (daysLeft <= 1) {
            const isOverdue = daysLeft < 0;
            reminders.push({
              id: mId,
              title: `Milestone: ${m.title}`,
              message: `Target milestone for "${target.title}" is ${isOverdue ? 'overdue' : daysLeft === 0 ? 'due today' : 'due tomorrow'}.`,
              category: 'target_milestone',
              urgency: isOverdue ? 'critical' : 'urgent',
              icon: '🏁',
              domainBadge: 'Target Milestone',
              dueTimeLabel: isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : 'Tomorrow',
              timestamp: nowTs,
              actionType: 'open_target',
              actionPayload: target.id,
              actionLabel: 'View Milestone'
            });
          }
        });
      }
    });
  }

  // 4. ROUTINES & SKILL HABIT ANCHORS
  if (settings.channels.routines) {
    // A. Morning & Evening Routine triggers
    if (state.routines && state.routines.length > 0) {
      state.routines.forEach(routine => {
        const id = `routine_flow_${routine.id}`;
        if (isSnoozedOrDismissed(id)) return;

        // Morning Routine reminder (7 AM - 10 AM)
        if (routine.targetTime === 'morning' && currentMinutes >= 420 && currentMinutes <= 630) {
          // Check if key morning habits were done
          const incompleteMorningHabits = state.nodes.filter(
            n => n.p !== '0' && n.routineTime === 'morning' && !isHabitDoneToday(n.id)
          );
          if (incompleteMorningHabits.length > 0) {
            reminders.push({
              id,
              title: `Morning Routine: ${routine.name}`,
              message: `${incompleteMorningHabits.length} morning keystone habits pending. Start your day with intentional flow.`,
              category: 'routine',
              urgency: 'due_now',
              icon: routine.icon || '🌅',
              domainBadge: 'Morning Ritual',
              dueTimeLabel: 'Morning Window',
              timestamp: nowTs,
              actionType: 'open_routine',
              actionPayload: routine.id,
              actionLabel: 'Launch Routine'
            });
          }
        }

        // Evening Routine reminder (8 PM - 10:30 PM)
        if (routine.targetTime === 'evening' && currentMinutes >= 1200 && currentMinutes <= 1350) {
          reminders.push({
            id,
            title: `Evening Wind-Down: ${routine.name}`,
            message: `Transition gently into rest. Unclutter mind and prepare for peaceful recovery.`,
            category: 'routine',
            urgency: 'due_now',
            icon: routine.icon || '🌙',
            domainBadge: 'Evening Ritual',
            dueTimeLabel: 'Evening Window',
            timestamp: nowTs,
            actionType: 'open_routine',
            actionPayload: routine.id,
            actionLabel: 'Start Wind-Down'
          });
        }
      });
    }

    // B. Classic Alert Items (state.rm)
    if (state.rm && state.rm.length > 0) {
      state.rm.forEach(alert => {
        if (!alert.active) return;
        const id = `alert_rm_${alert.id}`;
        if (isSnoozedOrDismissed(id)) return;

        const alertMinutes = timeToMinutes(alert.tm);
        const diff = alertMinutes - currentMinutes;

        // Trigger if within 30 min window or overdue within 60 mins today
        if (diff <= 30 && diff >= -60) {
          const isLinkedHabitDone = alert.skillId ? isHabitDoneToday(alert.skillId) : false;
          if (!isLinkedHabitDone) {
            reminders.push({
              id,
              title: alert.n,
              message: alert.medNote || alert.skillName ? `Habit cue: ${alert.skillName || alert.n}` : `Scheduled reminder for ${alert.tm}`,
              category: 'routine',
              urgency: diff < 0 ? 'urgent' : 'due_now',
              icon: alert.icon || '⏰',
              domainBadge: 'Scheduled Alarm',
              dueTimeLabel: formatMinutesOffset(diff),
              timestamp: nowTs,
              actionType: alert.skillId ? 'toggle_habit' : 'custom',
              actionPayload: alert.skillId || null,
              actionLabel: alert.skillId ? 'Check In Habit' : 'Dismiss'
            });
          }
        }
      });
    }
  }

  // 5. DIGITAL WELLBEING APP USAGE LIMITS
  if (settings.channels.screenCurfew && state.screenTimeApps) {
    state.screenTimeApps.forEach(app => {
      if (!app.dailyCeilingMinutes || app.dailyCeilingMinutes <= 0) return;
      const id = `screentime_limit_${app.id}`;
      if (isSnoozedOrDismissed(id)) return;

      const minutesUsedToday = (state.screenTimeSessions || [])
        .filter(s => s.date === today && (s.appId === app.id || s.appName === app.name))
        .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

      if (minutesUsedToday >= app.dailyCeilingMinutes) {
        reminders.push({
          id,
          title: `Limit Reached: ${app.name}`,
          message: `You have logged ${minutesUsedToday}m of your ${app.dailyCeilingMinutes}m ceiling today. Step away to protect mental bandwidth.`,
          category: 'screentime_limit',
          urgency: 'critical',
          icon: app.icon || '📵',
          domainBadge: 'Digital Wellbeing',
          dueTimeLabel: 'Ceiling reached',
          timestamp: nowTs,
          actionType: 'wind_down',
          actionLabel: 'Somatic Reset'
        });
      }
    });
  }

  // 6. ROADMAP GOALS & LEARNING SESSIONS
  if (settings.channels.learning && state.roadmapSteps) {
    state.roadmapSteps.forEach(step => {
      if (step.isCompleted || !step.reminderEnabled) return;
      const id = `roadmap_step_${step.id}`;
      if (isSnoozedOrDismissed(id)) return;

      if (step.plannedDate === today) {
        reminders.push({
          id,
          title: `Learning Session: ${step.title}`,
          message: step.description || `Scheduled milestone for your learning roadmap.`,
          category: 'roadmap_step',
          urgency: 'due_now',
          icon: '📚',
          domainBadge: 'Learning Roadmap',
          dueTimeLabel: step.sessionTime || 'Today',
          timestamp: nowTs,
          actionType: 'open_routine',
          actionPayload: step.id,
          actionLabel: 'Begin Session'
        });
      }
    });
  }

  // Urgency weights
  const urgencyWeight: Record<AdaptiveUrgency, number> = {
    critical: 0,
    urgent: 1,
    due_now: 2,
    upcoming: 3,
    gentle: 4
  };

  return reminders.sort((a, b) => urgencyWeight[a.urgency] - urgencyWeight[b.urgency]);
}

/**
 * Native Web Notification API permission request
 */
export async function requestWebNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    if (Notification.permission === 'granted') {
      return true;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

/**
 * Dispatches an offline web notification
 */
export function sendAdaptiveWebNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options
    });
  } catch {
    // ignore
  }
}
