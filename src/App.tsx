import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav } from './components/BottomNav';
import { ActionSheet } from './components/ActionSheet';
import { TodayScreen } from './screens/TodayScreen';
import { GrowthScreen } from './screens/GrowthScreen';
import { ReflectScreen } from './screens/ReflectScreen';
import { StatsScreen } from './screens/StatsScreen';
import { UrgeSurfingScreen } from './screens/UrgeSurfingScreen';
import { BreathPacerModal } from './components/modals/BreathPacerModal';
import { AdaptiveReminderCenterModal } from './components/reminders/AdaptiveReminderCenterModal';
import { ApkExportModal } from './components/modals/ApkExportModal';
import { VariantSwitcherModal } from './components/modals/VariantSwitcherModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { Lock } from 'lucide-react';
import { soundManager } from './utils/soundHaptics';

const FullAppPinLock: React.FC = () => {
  const { unlockWithPin } = useApp();
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  const handleDigit = async (d: string) => {
    if (pinInput.length >= 4) return;
    const next = pinInput + d;
    setPinInput(next);
    soundManager.playChime('click');

    if (next.length === 4) {
      const ok = await unlockWithPin(next);
      if (!ok) {
        setPinError(true);
        setTimeout(() => {
          setPinInput('');
          setPinError(false);
        }, 800);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1E241B] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-[#252D22] border border-[#87A96B] text-[#87A96B] flex items-center justify-center text-3xl shadow-xl mb-4">
        <Lock className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-black text-[#F4F7F2]">SelfCare Hero</h2>
      <p className="text-xs text-[#859A90] mt-1 mb-6">Enter your 4-digit PIN to access your sanctuary</p>

      {/* 4 dots */}
      <div className={`flex gap-4 mb-8 ${pinError ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map(idx => (
          <div
            key={idx}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              pinInput.length > idx
                ? pinError
                  ? 'bg-[#B91C1C] border-[#B91C1C]'
                  : 'bg-[#87A96B] border-[#87A96B] scale-110 shadow-sm'
                : 'bg-transparent border-[#33402E]'
            }`}
          />
        ))}
      </div>

      {/* 3x4 Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="h-14 rounded-2xl bg-[#252D22] border border-[#33402E] text-lg font-bold text-[#F4F7F2] hover:border-[#87A96B] active:scale-95 transition-all"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleDigit('0')}
          className="h-14 rounded-2xl bg-[#252D22] border border-[#33402E] text-lg font-bold text-[#F4F7F2] hover:border-[#87A96B] active:scale-95 transition-all"
        >
          0
        </button>
        <button
          onClick={() => setPinInput(prev => prev.slice(0, -1))}
          className="h-14 rounded-2xl bg-[#252D22] border border-[#33402E] text-xs font-bold text-[#859A90] active:scale-95 transition-all"
        >
          DEL
        </button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const {
    state,
    activeTab,
    isUnlocked,
    toastMessage,
    setActiveTab,
    isReminderModalOpen,
    setIsReminderModalOpen,
    isVariantModalOpen,
    setIsVariantModalOpen
  } = useApp();
  const [isBreathPacerOpen, setIsBreathPacerOpen] = useState(false);
  const [isApkExportOpen, setIsApkExportOpen] = useState(false);

  if (state.pinLockEnabled && state.lockAppLaunch && !isUnlocked) {
    return <FullAppPinLock />;
  }

  return (
    <div className="min-h-screen bg-[#1E241B] text-[#F4F7F2] pb-24 light:bg-[#F4F7F2] light:text-[#1C221E] transition-colors">
      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
        {/* Header Bar */}
        <HeaderBar onOpenApkExport={() => setIsApkExportOpen(true)} />

        {/* Active Screen (Supporting 4 Primary Hubs with backward compatibility) */}
        <main>
          {activeTab === 'today' && <TodayScreen />}
          {(activeTab === 'growth' || activeTab === 'skills' || activeTab === 'learn' || activeTab === 'books' || activeTab === 'videos') && (
            <GrowthScreen />
          )}
          {(activeTab === 'reflect' || activeTab === 'journal') && <ReflectScreen />}
          {(activeTab === 'insights' || activeTab === 'stats') && <StatsScreen />}
          {activeTab === 'urge' && <UrgeSurfingScreen />}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#252D22] border border-[#87A96B] text-xs font-bold text-[#F4F7F2] shadow-2xl flex items-center gap-2 animate-bounce light:bg-white light:text-[#1C221E]">
          <span>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Connectivity & Offline Indicator */}
      <OfflineIndicator />

      {/* Contextual Action Sheet (+) */}
      <ActionSheet
        onOpenBreathPacer={() => setIsBreathPacerOpen(true)}
        onOpenFocusTimer={() => setActiveTab('growth')}
        onOpenApkExport={() => setIsApkExportOpen(true)}
      />

      {/* Global Breath Pacer Modal */}
      {isBreathPacerOpen && (
        <BreathPacerModal isOpen={true} onClose={() => setIsBreathPacerOpen(false)} />
      )}

      {/* Unified Adaptive Reminder Center Modal */}
      <AdaptiveReminderCenterModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onOpenBreathPacer={() => setIsBreathPacerOpen(true)}
      />

      {/* APK & Google Drive Export Modal */}
      <ApkExportModal
        isOpen={isApkExportOpen}
        onClose={() => setIsApkExportOpen(false)}
      />

      {/* Multi-Variant & Hardware Persistence Modal */}
      <VariantSwitcherModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
      />

      {/* Persistent Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};
export default App;
