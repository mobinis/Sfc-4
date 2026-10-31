import React from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Sun, Lock, ShieldCheck, Zap, Bell, Download, Layers } from 'lucide-react';
import { soundManager } from '../utils/soundHaptics';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface HeaderBarProps {
  onOpenApkExport?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onOpenApkExport }) => {
  const {
    state,
    level,
    currentXp,
    neededXp,
    rankTitle,
    toggleTheme,
    toggleLowEnergy,
    lockNow,
    activeReminders,
    setIsReminderModalOpen,
    variantConfig,
    setIsVariantModalOpen
  } = useApp();

  const progressPercent = Math.min(100, Math.round((currentXp / neededXp) * 100));

  return (
    <header className="flex flex-col gap-3 p-4 rounded-3xl bg-[#1E241B] border border-[#33402E] shadow-xl transition-colors light:bg-[#F4F7F2] light:border-[#E5E3DA]">
      {/* Profile & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#252D22] text-[#87A96B] border border-[#87A96B] flex items-center justify-center text-xl font-bold shadow-md light:bg-white light:border-[#4A6B35]">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-[#F4F7F2] light:text-[#1C221E]">
                {variantConfig.appName}
              </h1>
              <button
                onClick={() => {
                  soundManager.playChime('click');
                  setIsVariantModalOpen(true);
                }}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#252D22] text-[#87A96B] border border-[#87A96B]/50 hover:bg-[#87A96B] hover:text-[#1E241B] flex items-center gap-1 transition-all"
                title="Switch Variant / View Hardware Storage"
              >
                <Layers className="w-3 h-3" />
                <span>{variantConfig.variantId.toUpperCase()}</span>
              </button>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#2E2308] text-[#E5A93C] border border-[#E5A93C]/40 light:bg-[#FEF3C7] light:text-[#D97706]">
                Lv.{level}
              </span>
            </div>
            <p className="text-xs font-medium text-[#859A90] light:text-[#5C655E] flex items-center gap-1.5 mt-0.5">
              <span>{rankTitle}</span>
              <span>•</span>
              <span className="text-[#E5A93C] font-semibold">🔥 {state.dailyThreeStreak.cur} Day Streak</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* In-App PWA Install Button */}
          <PWAInstallButton compact={true} />

          {/* Carrot-Coins */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] text-xs font-extrabold light:bg-[#FEF3C7] light:text-[#D97706]">
            <span>🪙</span>
            <span>{state.coins}</span>
          </div>

          {/* APK & Google Drive Export Button */}
          <button
            onClick={() => {
              soundManager.playChime('click');
              onOpenApkExport?.();
            }}
            title="Download APK / Save to Google Drive"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#2A5643] border border-[#3D7D62] text-[#E8F3ED] text-xs font-bold hover:bg-[#3D7D62] active:scale-95 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">APK & Drive</span>
          </button>

          {/* Adaptive Reminder Notification Bell */}
          <button
            onClick={() => {
              soundManager.playChime('click');
              setIsReminderModalOpen(true);
            }}
            title="Adaptive Reminders & Mindful Cues"
            className="relative p-2 rounded-xl bg-[#242D29] border border-[#384A41] text-[#F4F7F4] hover:border-[#3D7D62] transition-colors light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
          >
            <Bell className="w-4 h-4 text-[#859A90] hover:text-[#F4F7F4]" />
            {activeReminders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E5A93C] text-[#121413] text-[9px] font-black flex items-center justify-center animate-pulse">
                {activeReminders.length > 9 ? '9+' : activeReminders.length}
              </span>
            )}
          </button>

          {/* Low Energy Mode button */}
          <button
            onClick={toggleLowEnergy}
            title={state.lowEnergyMode ? 'Low-Energy Mode Active' : 'Switch to Low-Energy Mode'}
            className={`p-2 rounded-xl border text-sm transition-all flex items-center justify-center ${
              state.lowEnergyMode
                ? 'bg-[#2A5643] border-[#3D7D62] text-[#E8F3ED]'
                : 'bg-[#242D29] border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#5C655E]'
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Dark/Light Mode"
            className="p-2 rounded-xl bg-[#242D29] border border-[#384A41] text-[#F4F7F4] hover:border-[#3D7D62] transition-colors light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
          >
            {state.isDarkMode ? <Sun className="w-4 h-4 text-[#E5A93C]" /> : <Moon className="w-4 h-4 text-[#2D6A4F]" />}
          </button>

          {/* PIN Lock button if enabled */}
          {state.pinLockEnabled && (
            <button
              onClick={lockNow}
              title="Lock with PIN"
              className="p-2 rounded-xl bg-[#242D29] border border-[#384A41] text-[#E5A93C] hover:border-[#E5A93C] transition-colors light:bg-[#EFECE6] light:border-[#E5E3DA]"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* XP Strip */}
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#242D29] border border-[#384A41]/60 light:bg-[#EFECE6] light:border-[#E5E3DA]">
        <span className="text-[11px] font-bold text-[#E5A93C] light:text-[#D97706] whitespace-nowrap">
          XP {currentXp} / {neededXp}
        </span>
        <div className="flex-1 h-2 rounded-full bg-[#121413] light:bg-[#D5D2C9] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#3D7D62] to-[#E5A93C] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[10px] font-medium text-[#859A90] light:text-[#5C655E]">
          {progressPercent}%
        </span>
      </div>
    </header>
  );
};
