import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenTimeCategory, ScreenTimeAppUsage } from '../../types';
import {
  Smartphone,
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Sparkles,
  Wind
} from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';
import { DateUtils } from '../../utils/dateUtils';

interface ScreenTimeSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedApp?: ScreenTimeAppUsage | null;
  onOpenBreathPacer?: () => void;
}

const TRIGGER_CUES = [
  'Boredom / Idle Waiting',
  'Post-lunch / Afternoon Fatigue',
  'Procrastinating on Hard Task',
  'Stress / Emotional Overwhelm',
  'Meal Companion / Eating Habit',
  'Bedtime Decompression Habit'
];

export const ScreenTimeSessionModal: React.FC<ScreenTimeSessionModalProps> = ({
  isOpen,
  onClose,
  preselectedApp = null,
  onOpenBreathPacer
}) => {
  const { state, logScreenTimeSession, showToast } = useApp();

  const [selectedAppId, setSelectedAppId] = useState<string>(
    preselectedApp ? preselectedApp.id : state.screenTimeApps[0]?.id || ''
  );
  const [customAppName, setCustomAppName] = useState('');
  const [customCategory, setCustomCategory] = useState<ScreenTimeCategory>('social_media');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [isIntentional, setIsIntentional] = useState<boolean>(true);
  const [triggerCue, setTriggerCue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>(DateUtils.todayStr());

  if (!isOpen) return null;

  const currentApp = state.screenTimeApps.find(a => a.id === selectedAppId);

  const handleInsertTimestamp = () => {
    soundManager.playChime('click');
    const stamp = `[${DateUtils.todayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] `;
    setNotes(prev => (prev ? `${prev}\n${stamp}` : stamp));
  };

  const handleSave = () => {
    if (durationMinutes <= 0) {
      showToast('Please enter a duration greater than 0');
      return;
    }

    const appName = currentApp ? currentApp.name : customAppName.trim() || 'General Screen Time';
    const category = currentApp ? currentApp.category : customCategory;

    logScreenTimeSession({
      appId: currentApp ? currentApp.id : undefined,
      appName,
      category,
      durationMinutes,
      isIntentional,
      notes: notes.trim() || undefined,
      triggerCue: triggerCue || undefined,
      date: sessionDate
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg max-h-[92vh] rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl flex flex-col overflow-hidden light:bg-white light:border-[#E5E3DA]">
        {/* Header */}
        <div className="p-4 border-b border-[#384A41]/60 flex items-center justify-between light:border-[#E5E3DA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] flex items-center justify-center text-lg shadow-sm">
              📵
            </div>
            <div>
              <h3 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
                <span>Log Screen-Time & Digital Check</span>
              </h3>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Track intentional vs mindless usage against your daily ceilings
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playChime('click');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#242D29] border border-[#384A41] flex items-center justify-center text-[#859A90] hover:text-white transition-colors light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* App Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Monitored App / Activity
            </label>
            <select
              value={selectedAppId}
              onChange={e => setSelectedAppId(e.target.value)}
              className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              {state.screenTimeApps.map(app => (
                <option key={app.id} value={app.id}>
                  {app.icon} {app.name} (Budget: {app.dailyCeilingMinutes}m/day)
                </option>
              ))}
              <option value="custom">➕ Other / Custom App</option>
            </select>
          </div>

          {selectedAppId === 'custom' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#242D29] border border-[#384A41] light:bg-[#F7F6F2] light:border-[#E5E3DA]">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#859A90]">App Name</label>
                <input
                  type="text"
                  value={customAppName}
                  onChange={e => setCustomAppName(e.target.value)}
                  placeholder="e.g. TikTok"
                  className="p-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#859A90]">Category</label>
                <select
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value as any)}
                  className="p-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                >
                  <option value="short_video">Short Video / Reels</option>
                  <option value="social_media">Social Media Feed</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="gaming">Gaming</option>
                  <option value="news">News</option>
                  <option value="productive">Productive / Work</option>
                </select>
              </div>
            </div>
          )}

          {/* Intentionality Dual Pill Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Conscious Intentionality
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#121413] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
              <button
                type="button"
                onClick={() => {
                  soundManager.playChime('click');
                  setIsIntentional(true);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  isIntentional
                    ? 'bg-[#3D7D62] text-white shadow-sm'
                    : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#68D391]" />
                <span>Intentional & Bounded</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playChime('timer');
                  setIsIntentional(false);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  !isIntentional
                    ? 'bg-[#854D0E] text-white shadow-sm border border-[#E5A93C]'
                    : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-[#E5A93C]" />
                <span>Mindless / Doom-scroll</span>
              </button>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#242D29] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Duration (Minutes)
              </span>
              <span className="text-base font-black font-mono text-[#E5A93C] light:text-[#D97706]">
                {durationMinutes} min
              </span>
            </div>

            {/* Quick minute pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[5, 10, 15, 20, 30, 45, 60, 90].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    soundManager.playChime('click');
                    setDurationMinutes(mins);
                  }}
                  className={`py-1 px-3 rounded-xl text-xs font-bold transition-all ${
                    durationMinutes === mins
                      ? 'bg-[#3D7D62] text-white shadow-xs'
                      : 'bg-[#1B211E] text-[#859A90] hover:text-white border border-[#384A41] light:bg-white light:border-[#E5E3DA]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Cue Selector (Especially prominent if mindless) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              What Triggered This Session?
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {TRIGGER_CUES.map(cue => (
                <button
                  key={cue}
                  type="button"
                  onClick={() => {
                    soundManager.playChime('click');
                    setTriggerCue(triggerCue === cue ? '' : cue);
                  }}
                  className={`p-2 rounded-xl text-[11px] font-semibold text-left transition-all truncate border ${
                    triggerCue === cue
                      ? 'bg-[#2E2308] border-[#E5A93C] text-[#E5A93C]'
                      : 'bg-[#242D29] border-[#384A41]/60 text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                  }`}
                >
                  {cue}
                </button>
              ))}
            </div>
          </div>

          {/* Notes & Timestamp */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Reflection & Context
              </label>
              <button
                type="button"
                onClick={handleInsertTimestamp}
                className="text-[10px] font-bold text-[#E5A93C] hover:text-[#F3BA55] flex items-center gap-1"
              >
                <span>+ Insert Stamp ⏱️</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What were you feeling right before opening the app? What snapped you out of it?"
              className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          {/* Mindful Friction Prompt if mindless */}
          {!isIntentional && (
            <div className="p-3.5 rounded-2xl bg-[#242D29] border border-[#E5A93C]/40 flex items-start gap-2.5 light:bg-[#FEF3C7] light:border-[#F59E0B]/40">
              <Sparkles className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#F4F7F4] light:text-[#92400E] leading-relaxed">
                <strong>Mindful Reset:</strong> Dopamine seeking from algorithmic feeds is an automatic nervous system reflex to discomfort. Taking 4 deep cyclic breaths dissolves the compulsive loop.
                {onOpenBreathPacer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBreathPacer();
                    }}
                    className="mt-1.5 py-1 px-2.5 rounded-lg bg-[#3D7D62] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Wind className="w-3 h-3" />
                    <span>Try 2-min Box Breathing Now</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#384A41]/60 flex items-center justify-between gap-3 light:border-[#E5E3DA]">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#859A90] hover:text-white transition-colors light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-5 rounded-xl bg-[#3D7D62] text-white text-xs font-black hover:bg-[#2D6A4F] transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Screen-Time Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
