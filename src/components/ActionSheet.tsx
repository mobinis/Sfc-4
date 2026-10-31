import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Heart, Waves, Wind, Timer, X, Download } from 'lucide-react';
import { soundManager } from '../utils/soundHaptics';

interface ActionSheetProps {
  onOpenBreathPacer: () => void;
  onOpenFocusTimer: () => void;
  onOpenApkExport?: () => void;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({ onOpenBreathPacer, onOpenFocusTimer, onOpenApkExport }) => {
  const { isActionSheetOpen, setIsActionSheetOpen, setActiveTab } = useApp();

  if (!isActionSheetOpen) return null;

  const handleAction = (action: () => void) => {
    soundManager.playChime('click');
    setIsActionSheetOpen(false);
    action();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={() => setIsActionSheetOpen(false)} />

      {/* Bottom Sheet */}
      <div className="relative z-10 w-full max-w-lg bg-[#1B211E] border-t border-[#384A41] rounded-t-3xl p-5 shadow-2xl light:bg-white light:border-[#E5E3DA] animate-slide-up">
        <div className="flex items-center justify-between pb-3 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93C] animate-pulse" />
            <h3 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E] uppercase tracking-wider">
              Quick Action Sheet
            </h3>
          </div>
          <button
            onClick={() => setIsActionSheetOpen(false)}
            className="w-8 h-8 rounded-full bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#5C655E]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5 mt-4">
          {/* Action 1: Quick Habit Check-in */}
          <button
            onClick={() => handleAction(() => setActiveTab('today'))}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#242D29] border border-[#384A41] hover:border-[#3D7D62] text-left transition-all active:scale-98 light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/20 text-[#3D7D62] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">Check In Today's Habits</div>
              <div className="text-[11px] text-[#859A90] light:text-[#5C655E]">Review and check off daily anchors</div>
            </div>
          </button>

          {/* Action 2: Log Mood & Reflection */}
          <button
            onClick={() => handleAction(() => setActiveTab('reflect'))}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#242D29] border border-[#384A41] hover:border-[#3D7D62] text-left transition-all active:scale-98 light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/20 text-[#E5A93C] flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">Log Mood & Reflection</div>
              <div className="text-[11px] text-[#859A90] light:text-[#5C655E]">1-tap mood check-in & journal (+15 XP)</div>
            </div>
          </button>

          {/* Action 3: Urge Surfing Wave */}
          <button
            onClick={() => handleAction(() => setActiveTab('urge'))}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#242D29] border border-[#384A41] hover:border-[#3D7D62] text-left transition-all active:scale-98 light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">10m Urge Surfing Wave</div>
              <div className="text-[11px] text-[#859A90] light:text-[#5C655E]">Neurochemical urge decay timer & somatic reset</div>
            </div>
          </button>

          {/* Action 4: Somatic Box Breathing */}
          <button
            onClick={() => handleAction(() => onOpenBreathPacer())}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#242D29] border border-[#384A41] hover:border-[#3D7D62] text-left transition-all active:scale-98 light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">Somatic Box Breathing</div>
              <div className="text-[11px] text-[#859A90] light:text-[#5C655E]">Visual 4-4-4-4 autonomic vagal calming</div>
            </div>
          </button>

          {/* Action 5: Deep Focus Sprint */}
          <button
            onClick={() => handleAction(() => onOpenFocusTimer())}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#242D29] border border-[#384A41] hover:border-[#3D7D62] text-left transition-all active:scale-98 light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">25m Deep Focus Sprint</div>
              <div className="text-[11px] text-[#859A90] light:text-[#5C655E]">Single-task deep work with ambient soundscape</div>
            </div>
          </button>

          {/* Action 6: Export APK & Google Drive Backup */}
          {onOpenApkExport && (
            <button
              onClick={() => handleAction(() => onOpenApkExport())}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#2A5643]/30 border border-[#3D7D62] hover:bg-[#2A5643]/50 text-left transition-all active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] text-[#E8F3ED] flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">Export Android APK & Drive</div>
                <div className="text-[11px] text-[#859A90] light:text-[#5C655E]">Download 96 MB APK or save directly to Google Drive</div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
