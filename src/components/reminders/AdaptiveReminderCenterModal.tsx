import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  Settings,
  ShieldAlert,
  Moon,
  Coffee,
  Heart,
  Target,
  Sparkles,
  ChevronRight,
  Flame,
  Zap,
  Smartphone
} from 'lucide-react';
import {
  AdaptiveReminderItem,
  AdaptiveReminderCategory,
  AdaptiveUrgency
} from '../../types';
import { soundManager } from '../../utils/soundHaptics';
import {
  requestWebNotificationPermission,
  DEFAULT_ADAPTIVE_REMINDER_SETTINGS
} from '../../utils/adaptiveReminderEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'today' | 'growth' | 'reflect' | 'insights') => void;
  onOpenRoutinePlayer?: (routineId: string) => void;
  onOpenBreathPacer?: () => void;
}

export const AdaptiveReminderCenterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenRoutinePlayer,
  onOpenBreathPacer
}) => {
  const {
    state,
    activeReminders,
    updateAdaptiveReminderSettings,
    snoozeReminder,
    dismissReminderForToday,
    toggleHabit,
    logRelationshipCheckIn,
    showToast
  } = useApp();

  const settings = state.adaptiveReminderSettings || DEFAULT_ADAPTIVE_REMINDER_SETTINGS;
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'routines' | 'targets' | 'relationships' | 'circadian' | 'settings'>('all');
  const [snoozeMenuOpenId, setSnoozeMenuOpenId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter reminders based on tab
  const filteredReminders = activeReminders.filter(rem => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'routines') return rem.category === 'routine' || rem.category === 'skill_anchor';
    if (selectedFilter === 'targets') return rem.category === 'target_milestone' || rem.category === 'roadmap_step';
    if (selectedFilter === 'relationships') return rem.category === 'relationship';
    if (selectedFilter === 'circadian') return rem.category === 'screen_curfew' || rem.category === 'caffeine_cutoff' || rem.category === 'screentime_limit';
    return true;
  });

  const getUrgencyBorder = (urgency: AdaptiveUrgency) => {
    switch (urgency) {
      case 'critical':
        return 'border-red-500/70 bg-red-950/20';
      case 'urgent':
        return 'border-[#E5A93C]/70 bg-[#2E2308]/30';
      case 'due_now':
        return 'border-[#3D7D62]/70 bg-[#1B2721]/30';
      case 'upcoming':
        return 'border-blue-500/50 bg-blue-950/20';
      default:
        return 'border-[#384A41] bg-[#1B211E]/40';
    }
  };

  const getUrgencyBadge = (urgency: AdaptiveUrgency) => {
    switch (urgency) {
      case 'critical':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-red-500/20 text-red-400 border border-red-500/30">Urgent</span>;
      case 'urgent':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/30">High Priority</span>;
      case 'due_now':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-[#3D7D62]/20 text-[#68BA96] border border-[#3D7D62]/30">Due Now</span>;
      case 'upcoming':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">Upcoming</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-[#242D29] text-[#859A90]">Gentle</span>;
    }
  };

  const handleAction = (reminder: AdaptiveReminderItem) => {
    soundManager.playChime('click');

    if (reminder.actionType === 'toggle_habit' && reminder.actionPayload) {
      toggleHabit(reminder.actionPayload);
      dismissReminderForToday(reminder.id);
      return;
    }

    if (reminder.actionType === 'open_routine' && reminder.actionPayload) {
      if (onOpenRoutinePlayer) {
        onOpenRoutinePlayer(reminder.actionPayload);
        onClose();
      } else {
        showToast('Launch routine player from Today screen');
      }
      return;
    }

    if (reminder.actionType === 'log_deed' && reminder.actionPayload) {
      logRelationshipCheckIn(reminder.actionPayload, 'Touchpoint recorded via adaptive alert');
      dismissReminderForToday(reminder.id);
      return;
    }

    if (reminder.actionType === 'wind_down') {
      soundManager.playChime('curfew');
      if (onOpenBreathPacer) {
        onOpenBreathPacer();
        onClose();
      } else {
        showToast('🌙 Wind-down activated. Dim lights and disconnect screens.');
      }
      dismissReminderForToday(reminder.id);
      return;
    }

    if (reminder.actionType === 'open_target') {
      if (onNavigateToTab) {
        onNavigateToTab('growth');
        onClose();
      }
      return;
    }

    // Default dismiss
    dismissReminderForToday(reminder.id);
  };

  const handleToggleWebNotifications = async () => {
    const granted = await requestWebNotificationPermission();
    if (granted) {
      updateAdaptiveReminderSettings({ webNotificationsEnabled: true });
      showToast('🔔 Browser notifications enabled!');
    } else {
      updateAdaptiveReminderSettings({ webNotificationsEnabled: false });
      showToast('⚠️ Notifications permission denied or unsupported');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-[#121413] border border-[#384A41] shadow-2xl text-[#F4F7F4] overflow-hidden light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#384A41]/70 light:border-[#E5E3DA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#3D7D62]/20 border border-[#3D7D62] text-[#3D7D62] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-[#F4F7F4] light:text-[#1C221E]">
                  Adaptive Reminders
                </h2>
                {activeReminders.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#E5A93C] text-[#121413]">
                    {activeReminders.length}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Unified cross-domain intelligence & mindful cues
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundManager.playChime('click');
                updateAdaptiveReminderSettings({ soundEnabled: !settings.soundEnabled });
              }}
              title={settings.soundEnabled ? 'Mute sound chimes' : 'Enable sound chimes'}
              className="p-2 rounded-xl bg-[#1B211E] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] light:bg-white light:border-[#E5E3DA]"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-[#3D7D62]" /> : <VolumeX className="w-4 h-4 text-[#859A90]" />}
            </button>

            <button
              onClick={() => {
                soundManager.playChime('click');
                setSelectedFilter(selectedFilter === 'settings' ? 'all' : 'settings');
              }}
              className={`p-2 rounded-xl border transition-all ${
                selectedFilter === 'settings'
                  ? 'bg-[#3D7D62] border-[#3D7D62] text-white'
                  : 'bg-[#1B211E] border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] light:bg-white light:border-[#E5E3DA]'
              }`}
              title="Reminder Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1B211E] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] light:bg-white light:border-[#E5E3DA]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        {selectedFilter !== 'settings' && (
          <div className="flex items-center gap-1.5 p-2 overflow-x-auto border-b border-[#384A41]/40 scrollbar-none bg-[#161C19] light:bg-[#F2EFE9]">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedFilter === 'all'
                  ? 'bg-[#3D7D62] text-white shadow-xs'
                  : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
              }`}
            >
              All ({activeReminders.length})
            </button>
            <button
              onClick={() => setSelectedFilter('routines')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedFilter === 'routines'
                  ? 'bg-[#3D7D62] text-white shadow-xs'
                  : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
              }`}
            >
              🌅 Routines
            </button>
            <button
              onClick={() => setSelectedFilter('targets')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedFilter === 'targets'
                  ? 'bg-[#3D7D62] text-white shadow-xs'
                  : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
              }`}
            >
              🎯 Targets
            </button>
            <button
              onClick={() => setSelectedFilter('relationships')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedFilter === 'relationships'
                  ? 'bg-[#3D7D62] text-white shadow-xs'
                  : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
              }`}
            >
              🤝 People
            </button>
            <button
              onClick={() => setSelectedFilter('circadian')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedFilter === 'circadian'
                  ? 'bg-[#3D7D62] text-white shadow-xs'
                  : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
              }`}
            >
              🌙 Rest & Curfew
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedFilter === 'settings' ? (
            /* Settings View */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] light:bg-white light:border-[#E5E3DA] space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#859A90]">
                  Master System Controls
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#F4F7F4] light:text-[#1C221E]">Enable Adaptive Alerts</div>
                    <div className="text-[11px] text-[#859A90]">Cross-domain intelligence and routine suggestions</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={e => updateAdaptiveReminderSettings({ enabled: e.target.checked })}
                    className="w-5 h-5 accent-[#3D7D62] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#384A41]/50">
                  <div>
                    <div className="text-sm font-bold text-[#F4F7F4] light:text-[#1C221E]">Web Browser Notifications</div>
                    <div className="text-[11px] text-[#859A90]">Receive background notification reminders</div>
                  </div>
                  <button
                    onClick={handleToggleWebNotifications}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      settings.webNotificationsEnabled
                        ? 'bg-[#3D7D62] text-white'
                        : 'bg-[#242D29] border border-[#384A41] text-[#859A90]'
                    }`}
                  >
                    {settings.webNotificationsEnabled ? 'Active' : 'Enable'}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#384A41]/50">
                  <div>
                    <div className="text-sm font-bold text-[#F4F7F4] light:text-[#1C221E]">Sound Chimes</div>
                    <div className="text-[11px] text-[#859A90]">Play Tibetan bowl tones on new cues</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={e => updateAdaptiveReminderSettings({ soundEnabled: e.target.checked })}
                    className="w-5 h-5 accent-[#3D7D62] cursor-pointer"
                  />
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] light:bg-white light:border-[#E5E3DA] space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#859A90]">
                  Quiet Hours (Do Not Disturb)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#859A90] font-bold block mb-1">Quiet Start</label>
                    <input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={e => updateAdaptiveReminderSettings({ quietHoursStart: e.target.value })}
                      className="w-full p-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#859A90] font-bold block mb-1">Quiet End</label>
                    <input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={e => updateAdaptiveReminderSettings({ quietHoursEnd: e.target.value })}
                      className="w-full p-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
                    />
                  </div>
                </div>
              </div>

              {/* Domain Channels */}
              <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] light:bg-white light:border-[#E5E3DA] space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#859A90]">
                  Enabled Reminder Channels
                </h3>

                {[
                  { key: 'routines', label: 'Routines & Habit Anchors', icon: '🌅' },
                  { key: 'targets', label: 'Targets & Milestone Deadlines', icon: '🎯' },
                  { key: 'relationships', label: 'Relationship Circle Cadences', icon: '🤝' },
                  { key: 'screenCurfew', label: 'Digital Wind-Down Curfew', icon: '🌙' },
                  { key: 'caffeineCutoff', label: 'Caffeine Cutoff Reminder', icon: '☕' },
                  { key: 'learning', label: 'Roadmap Learning Sessions', icon: '📚' }
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-2 rounded-xl bg-[#242D29]/50 cursor-pointer hover:bg-[#242D29] transition-all light:bg-[#F7F6F2]">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">{item.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={(settings.channels as Record<string, boolean>)[item.key] ?? true}
                      onChange={e =>
                        updateAdaptiveReminderSettings({
                          channels: {
                            ...settings.channels,
                            [item.key]: e.target.checked
                          }
                        })
                      }
                      className="w-4 h-4 accent-[#3D7D62] cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : (
            /* Reminders List View */
            <>
              {filteredReminders.length === 0 ? (
                <div className="py-12 px-4 rounded-3xl bg-[#1B211E] border border-[#384A41] text-center light:bg-white light:border-[#E5E3DA]">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#3D7D62]/20 border border-[#3D7D62] text-[#3D7D62] flex items-center justify-center text-2xl mb-3">
                    ✨
                  </div>
                  <h3 className="text-sm font-bold text-[#F4F7F4] light:text-[#1C221E]">
                    Mind is Peaceful & Clear
                  </h3>
                  <p className="text-xs text-[#859A90] mt-1 max-w-xs mx-auto light:text-[#5C655E]">
                    No pending alerts or overdue touchpoints for this view. Keep flourishing in your daily rhythm!
                  </p>
                </div>
              ) : (
                filteredReminders.map(rem => (
                  <div
                    key={rem.id}
                    className={`p-3.5 rounded-2xl border transition-all ${getUrgencyBorder(rem.urgency)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0 mt-0.5">{rem.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                              {rem.title}
                            </span>
                            {getUrgencyBadge(rem.urgency)}
                          </div>
                          <p className="text-xs text-[#859A90] mt-0.5 leading-relaxed light:text-[#5C655E]">
                            {rem.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#242D29] text-[#859A90] font-bold light:bg-[#FAF9F5]">
                              {rem.domainBadge}
                            </span>
                            <span className="text-[10px] text-[#859A90] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{rem.dueTimeLabel}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#384A41]/50">
                      <div className="relative">
                        <button
                          onClick={() => setSnoozeMenuOpenId(snoozeMenuOpenId === rem.id ? null : rem.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#242D29] border border-[#384A41] text-[11px] font-bold text-[#859A90] hover:text-[#F4F7F4] flex items-center gap-1 light:bg-[#FAF9F5] light:border-[#E5E3DA]"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Snooze</span>
                        </button>

                        {/* Snooze Dropdown */}
                        {snoozeMenuOpenId === rem.id && (
                          <div className="absolute bottom-full left-0 mb-1 z-30 w-36 rounded-2xl bg-[#1B211E] border border-[#384A41] shadow-xl p-1 flex flex-col gap-1 light:bg-white light:border-[#E5E3DA]">
                            <button
                              onClick={() => {
                                snoozeReminder(rem.id, 15);
                                setSnoozeMenuOpenId(null);
                              }}
                              className="px-3 py-1.5 text-left text-xs font-bold text-[#F4F7F4] hover:bg-[#242D29] rounded-xl light:text-[#1C221E] light:hover:bg-[#F7F6F2]"
                            >
                              15 minutes
                            </button>
                            <button
                              onClick={() => {
                                snoozeReminder(rem.id, 60);
                                setSnoozeMenuOpenId(null);
                              }}
                              className="px-3 py-1.5 text-left text-xs font-bold text-[#F4F7F4] hover:bg-[#242D29] rounded-xl light:text-[#1C221E] light:hover:bg-[#F7F6F2]"
                            >
                              1 hour
                            </button>
                            <button
                              onClick={() => {
                                snoozeReminder(rem.id, 240);
                                setSnoozeMenuOpenId(null);
                              }}
                              className="px-3 py-1.5 text-left text-xs font-bold text-[#F4F7F4] hover:bg-[#242D29] rounded-xl light:text-[#1C221E] light:hover:bg-[#F7F6F2]"
                            >
                              4 hours
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dismissReminderForToday(rem.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#242D29] border border-[#384A41] text-[11px] font-bold text-[#859A90] hover:text-[#F4F7F4] flex items-center gap-1 light:bg-[#FAF9F5] light:border-[#E5E3DA]"
                          title="Dismiss for today"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dismiss</span>
                        </button>

                        <button
                          onClick={() => handleAction(rem)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-extrabold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                        >
                          <span>{rem.actionLabel || 'Action'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#384A41]/70 bg-[#161C19] flex items-center justify-between text-[11px] text-[#859A90] light:bg-[#F2EFE9] light:border-[#E5E3DA]">
          <span>⚡ 100% Offline & Private on-device evaluation</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-[#242D29] text-[#F4F7F4] font-bold light:bg-white light:border light:border-[#E5E3DA] light:text-[#1C221E]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
