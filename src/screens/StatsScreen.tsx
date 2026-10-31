import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { computeAnalytics, computeWeeklyInsights } from '../utils/analytics';
import { hashPin } from '../utils/pinSecurity';
import { HabitMoodCorrelation } from '../types';
import { BarChart3, Shield, Download, Upload, Lock, RefreshCw, CheckCircle, Database, Sparkles, Activity } from 'lucide-react';
import { VisualAnalyticsView } from '../components/analytics/VisualAnalyticsView';
import { soundManager } from '../utils/soundHaptics';

export const StatsScreen: React.FC = () => {
  const {
    state,
    createBackupSnapshot,
    restoreBackupSnapshot,
    exportStateJson,
    importStateJson,
    updatePinConfig,
    showToast
  } = useApp();

  const [statsSubTab, setStatsSubTab] = useState<'analytics' | 'insights_backups'>('analytics');

  const analytics = computeAnalytics(state);
  const insights = computeWeeklyInsights(state);

  // Backup state
  const [snapshotLabel, setSnapshotLabel] = useState<string>('');
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // PIN settings state
  const [pinInput, setPinInput] = useState<string>('');
  const [pinEnabled, setPinEnabled] = useState<boolean>(state.pinLockEnabled);
  const [lockJournal, setLockJournal] = useState<boolean>(state.lockJournal);
  const [lockUrges, setLockUrges] = useState<boolean>(state.lockUrges);
  const [lockLaunch, setLockLaunch] = useState<boolean>(state.lockAppLaunch);

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotLabel.trim()) return;
    createBackupSnapshot(snapshotLabel.trim());
    setSnapshotLabel('');
  };

  // In-app restore confirmation modal state
  const [restoreModalSnapshot, setRestoreModalSnapshot] = useState<{ id: string; label: string } | null>(null);
  const [confirmInput, setConfirmInput] = useState<string>('');

  const handleOpenRestoreModal = (id: string, label: string) => {
    soundManager.playChime('click');
    setConfirmInput('');
    setRestoreModalSnapshot({ id, label });
  };

  const handleConfirmRestore = () => {
    if (!restoreModalSnapshot) return;
    if (confirmInput.trim().toUpperCase() === 'CONFIRM') {
      const ok = restoreBackupSnapshot(restoreModalSnapshot.id);
      if (ok) {
        setRestoreModalSnapshot(null);
        setConfirmInput('');
      }
    } else {
      showToast('⚠️ Type CONFIRM to restore backup');
    }
  };

  const handleCancelRestore = () => {
    setRestoreModalSnapshot(null);
    setConfirmInput('');
    showToast('Restore cancelled');
  };

  const handleCopyExport = () => {
    const json = exportStateJson();
    navigator.clipboard.writeText(json);
    showToast('State JSON copied to clipboard!');
  };

  const handleSavePinSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    let hash = state.pinHash;
    if (pinInput.trim()) {
      if (pinInput.length !== 4) {
        showToast('PIN must be exactly 4 digits');
        return;
      }
      hash = await hashPin(pinInput);
    }
    updatePinConfig(pinEnabled, hash, lockJournal, lockUrges, lockLaunch);
    setPinInput('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-Tab Navigation Bar */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#1B211E] border border-[#384A41] shadow-xs light:bg-white light:border-[#E5E3DA]">
        <button
          onClick={() => {
            soundManager.playChime('click');
            setStatsSubTab('analytics');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            statsSubTab === 'analytics'
              ? 'bg-[#3D7D62] text-white shadow-sm'
              : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>My Progress (Visual)</span>
        </button>

        <button
          onClick={() => {
            soundManager.playChime('click');
            setStatsSubTab('insights_backups');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            statsSubTab === 'insights_backups'
              ? 'bg-[#3D7D62] text-white shadow-sm'
              : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Weekly Review & Backups</span>
        </button>
      </div>

      {/* Visual Analytics View */}
      {statsSubTab === 'analytics' && <VisualAnalyticsView />}

      {/* Weekly Review, Correlations & Backups View */}
      {statsSubTab === 'insights_backups' && (
        <div className="flex flex-col gap-4">
          {/* Weekly Insights Summary Card */}
          <div className="rounded-2xl bg-[#1B211E] border border-[#384A41] p-4 flex flex-col gap-4 shadow-md light:bg-white light:border-[#E5E3DA]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
                Weekly Review ({insights.startDate} — {insights.endDate})
              </h3>
              <span className="text-xs font-bold text-[#E5A93C]">
                {insights.totalXp} XP Gained
              </span>
            </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-[#242D29] border border-[#384A41] text-center light:bg-[#EFECE6] light:border-[#E5E3DA]">
            <span className="text-xs text-[#859A90] block">Completions</span>
            <span className="text-lg font-black text-[#3D7D62]">
              {insights.totalCompletions}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#242D29] border border-[#384A41] text-center light:bg-[#EFECE6] light:border-[#E5E3DA]">
            <span className="text-xs text-[#859A90] block">Average Mood</span>
            <span className="text-lg font-black text-[#E5A93C]">
              {insights.averageMood} / 4.0
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#242D29] border border-[#384A41] text-center light:bg-[#EFECE6] light:border-[#E5E3DA]">
            <span className="text-xs text-[#859A90] block">Dominant Vibe</span>
            <span className="text-lg font-black text-[#F4F7F4] light:text-[#1C221E]">
              {insights.dominantMoodEmoji}
            </span>
          </div>
        </div>

        {/* Top Habits / Momentum tags */}
        {insights.topSkills.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#384A41]/50">
            <span className="text-xs font-bold text-[#859A90]">Top Habits Compounding This Week:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {insights.topSkills.map(skill => (
                <div
                  key={skill.id}
                  className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] flex items-center justify-between light:bg-[#EFECE6] light:border-[#E5E3DA]"
                >
                  <div className="flex items-center gap-2">
                    <span>{skill.emoji}</span>
                    <span className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">{skill.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2A5643] text-[#E8F3ED] border border-[#3D7D62]">
                    {skill.momentumTag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Habit-Mood Correlation Engine */}
      <div className="rounded-2xl bg-[#1B211E] border border-[#384A41] p-4 flex flex-col gap-3 shadow-md light:bg-white light:border-[#E5E3DA]">
        <h3 className="text-sm font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
          Habit-Mood Correlation Engine
        </h3>
        <p className="text-xs text-[#859A90] light:text-[#5C655E]">
          Empirical comparison of your logged mood on days you completed a habit vs when you skipped it
        </p>

        {analytics.correlations.length === 0 ? (
          <p className="text-xs text-center py-4 text-[#859A90]">
            Log daily reflections in the Journal to generate habit-mood correlations.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {analytics.correlations.map((c: HabitMoodCorrelation, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#242D29] border border-[#384A41] flex items-center justify-between light:bg-[#EFECE6] light:border-[#E5E3DA]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.habitEmoji}</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
                      {c.habitName}
                    </h4>
                    <span className="text-[10px] text-[#859A90]">
                      Avg Mood: {c.avgMoodDone} vs {c.avgMoodNotDone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${c.deltaPercent >= 0 ? 'text-[#3D7D62]' : 'text-[#D95D39]'}`}>
                    {c.deltaPercent >= 0 ? `+${c.deltaPercent}%` : `${c.deltaPercent}%`} Mood Uplift
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pillar Balance & Urge Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Pillar Balance */}
        <div className="rounded-2xl bg-[#1B211E] border border-[#384A41] p-4 flex flex-col gap-3 shadow-md light:bg-white light:border-[#E5E3DA]">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#859A90]">
            Pillar Equilibrium
          </h3>

          <div className="flex items-center justify-between text-xs">
            <span>Dominant Energy:</span>
            <strong className="text-[#E5A93C]">{analytics.pillarBalance.dominantPillar}</strong>
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between text-[11px]">
              <span>🧠 Learn: {analytics.pillarBalance.learnPercent}%</span>
              <span>🛠️ Build: {analytics.pillarBalance.buildPercent}%</span>
              <span>💪 Body: {analytics.pillarBalance.bodyPercent}%</span>
            </div>
            <div className="h-2 rounded-full flex overflow-hidden bg-[#121413]">
              <div style={{ width: `${analytics.pillarBalance.learnPercent}%` }} className="bg-[#3D7D62]" />
              <div style={{ width: `${analytics.pillarBalance.buildPercent}%` }} className="bg-[#E5A93C]" />
              <div style={{ width: `${analytics.pillarBalance.bodyPercent}%` }} className="bg-[#2A5643]" />
            </div>
          </div>
        </div>

        {/* Urge Metrics */}
        <div className="rounded-2xl bg-[#1B211E] border border-[#384A41] p-4 flex flex-col gap-3 shadow-md light:bg-white light:border-[#E5E3DA]">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#859A90]">
            Urge Surfing Metrics
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-[#242D29] light:bg-[#EFECE6]">
              <span className="text-[10px] text-[#859A90] block">Total Waves</span>
              <strong className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">{analytics.urgeAnalytics.totalUrges}</strong>
            </div>
            <div className="p-2 rounded-xl bg-[#242D29] light:bg-[#EFECE6]">
              <span className="text-[10px] text-[#859A90] block">Avg Drop</span>
              <strong className="text-xs font-bold text-[#3D7D62]">-{analytics.urgeAnalytics.avgIntensityDrop} pts</strong>
            </div>
            <div className="p-2 rounded-xl bg-[#242D29] light:bg-[#EFECE6]">
              <span className="text-[10px] text-[#859A90] block">Success</span>
              <strong className="text-xs font-bold text-[#E5A93C]">{analytics.urgeAnalytics.successRate}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Slot Backup & Restore System */}
      <div className="rounded-2xl bg-[#1B211E] border border-[#384A41] p-4 flex flex-col gap-4 shadow-md light:bg-white light:border-[#E5E3DA]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#E5A93C]" />
              <span>10-Slot Local Backup & Restore</span>
            </h3>
            <p className="text-xs text-[#859A90] light:text-[#5C655E]">
              Save state snapshots before major routine experiments
            </p>
          </div>

          <button
            onClick={handleCopyExport}
            className="px-3 py-1.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#F4F7F4] hover:border-[#3D7D62] flex items-center gap-1.5 light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        <form onSubmit={handleCreateSnapshot} className="flex gap-2">
          <input
            type="text"
            placeholder="Snapshot label (e.g. 'Pre-Quarter 2 Setup')..."
            value={snapshotLabel}
            onChange={e => setSnapshotLabel(e.target.value)}
            className="flex-1 p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#22533E] whitespace-nowrap"
          >
            Take Snapshot
          </button>
        </form>

        {/* Snapshots List */}
        <div className="flex flex-col gap-2">
          {state.snapshots.length === 0 ? (
            <p className="text-xs text-center py-3 text-[#859A90]">
              No snapshots taken yet. Create one above!
            </p>
          ) : (
            state.snapshots.map(snap => (
              <div
                key={snap.id}
                className="p-3 rounded-xl bg-[#242D29] border border-[#384A41] flex items-center justify-between light:bg-[#EFECE6] light:border-[#E5E3DA]"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
                    {snap.label}
                  </h4>
                  <span className="text-[10px] text-[#859A90]">
                    Lv.{snap.level} • {snap.skillsCount} skills • {new Date(snap.timestamp).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenRestoreModal(snap.id, snap.label)}
                  className="px-3 py-1.5 rounded-xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] text-xs font-bold hover:bg-[#3D2E0A] transition-colors"
                >
                  Restore
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PIN Privacy Configuration */}
      <form
        onSubmit={handleSavePinSettings}
        className="rounded-2xl bg-[#1B211E] border border-[#384A41] p-4 flex flex-col gap-4 shadow-md light:bg-white light:border-[#E5E3DA]"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#E5A93C]" />
          <h3 className="text-sm font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
            PIN Privacy Security Configuration
          </h3>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#242D29] light:bg-[#EFECE6]">
          <div>
            <span className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E] block">
              Enable PIN Privacy Guard
            </span>
            <span className="text-[10px] text-[#859A90]">
              Protects sensitive journal reflections and urge surfing logs
            </span>
          </div>
          <input
            type="checkbox"
            checked={pinEnabled}
            onChange={e => setPinEnabled(e.target.checked)}
            className="w-5 h-5 accent-[#2D6A4F]"
          />
        </div>

        {pinEnabled && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#859A90] uppercase block mb-1">
                New 4-Digit PIN (Leave blank to keep existing)
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="4 digits (e.g. 1234)"
                value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-mono tracking-widest text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs text-[#F4F7F4] light:text-[#1C221E]">
                <input
                  type="checkbox"
                  checked={lockJournal}
                  onChange={e => setLockJournal(e.target.checked)}
                  className="accent-[#2D6A4F]"
                />
                <span>Lock Confidential Journal</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#F4F7F4] light:text-[#1C221E]">
                <input
                  type="checkbox"
                  checked={lockUrges}
                  onChange={e => setLockUrges(e.target.checked)}
                  className="accent-[#2D6A4F]"
                />
                <span>Lock Urge Surfing History</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#F4F7F4] light:text-[#1C221E]">
                <input
                  type="checkbox"
                  checked={lockLaunch}
                  onChange={e => setLockLaunch(e.target.checked)}
                  className="accent-[#2D6A4F]"
                />
                <span>Lock Full Application on Startup</span>
              </label>
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#22533E] transition-colors self-end"
            >
              Save PIN Settings
            </button>
          </div>
        )}
      </form>
        </div>
      )}

      {/* In-App Backup Restore Confirmation Modal */}
      {restoreModalSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#1B211E] border border-[#E5A93C] text-[#F4F7F4] p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="text-sm font-extrabold text-[#F4F7F4]">Restore Snapshot Guard</h3>
                <p className="text-[11px] text-[#859A90]">This replaces current state with snapshot</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#242D29] border border-[#384A41] text-xs">
              <span className="text-[#859A90] block text-[10px] font-bold uppercase">Target Snapshot</span>
              <span className="font-bold text-[#E5A93C] text-sm">{restoreModalSnapshot.label}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#859A90]">
                Type <span className="text-[#E5A93C] font-mono font-bold">CONFIRM</span> to proceed:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={e => setConfirmInput(e.target.value)}
                placeholder="CONFIRM"
                className="w-full px-3 py-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs font-mono font-bold text-center tracking-wider text-[#F4F7F4] focus:border-[#E5A93C] focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={handleCancelRestore}
                className="flex-1 py-2 px-3 rounded-xl bg-[#242D29] hover:bg-[#384A41] text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={confirmInput.trim().toUpperCase() !== 'CONFIRM'}
                className="flex-1 py-2 px-3 rounded-xl bg-[#E5A93C] hover:bg-[#D4982B] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-black text-[#121413] transition-all shadow-sm"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
