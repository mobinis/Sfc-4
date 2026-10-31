import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenTimeAppUsage, ScreenTimeSessionRecord } from '../../types';
import {
  Smartphone,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Moon,
  Sparkles,
  Trash2,
  Wind,
  Waves,
  ChevronRight,
  TrendingDown,
  Timer
} from 'lucide-react';
import { ScreenTimeSessionModal } from './ScreenTimeSessionModal';
import { AddMonitoredAppModal } from './AddMonitoredAppModal';
import { soundManager } from '../../utils/soundHaptics';
import { DateUtils } from '../../utils/dateUtils';

export const DigitalWellbeingHubView: React.FC = () => {
  const {
    state,
    deleteScreenTimeSession,
    deleteScreenTimeApp,
    setActiveTab,
    showToast
  } = useApp();

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedAppForLog, setSelectedAppForLog] = useState<ScreenTimeAppUsage | null>(null);
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);

  const today = DateUtils.todayStr();

  // Screen time analytics
  const allSessions = state.screenTimeSessions || [];
  const todaySessions = allSessions.filter(s => s.date === today);

  const todayTotalMinutes = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const todayMindlessMinutes = todaySessions.filter(s => !s.isIntentional).reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const todayIntentionalMinutes = todaySessions.filter(s => s.isIntentional).reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  const intentionalRatio = todayTotalMinutes > 0
    ? Math.round((todayIntentionalMinutes / todayTotalMinutes) * 100)
    : 100;

  // Total daily ceiling across monitored high-risk apps
  const totalDailyCeiling = state.screenTimeApps.reduce((acc, a) => acc + (a.dailyCeilingMinutes || 0), 0);

  // Circadian Curfew calculation
  const bedtime = state.circadianConfig?.bedTimeStr || '23:00';
  const curfewHours = state.circadianConfig?.screenCurfewHoursBeforeSleep || 2;
  const [bedH, bedM] = bedtime.split(':').map(Number);
  const curfewH = (bedH - curfewHours + 24) % 24;
  const curfewTimeStr = `${curfewH.toString().padStart(2, '0')}:${bedM.toString().padStart(2, '0')}`;

  const handleOpenLogModal = (app?: ScreenTimeAppUsage) => {
    soundManager.playChime('click');
    setSelectedAppForLog(app || null);
    setIsSessionModalOpen(true);
  };

  const handleDeleteSession = (id: string) => {
    soundManager.playChime('click');
    deleteScreenTimeSession(id);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 light:bg-white light:border-[#E5E3DA]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] flex items-center justify-center text-xl shadow-sm">
            📵
          </div>
          <div>
            <h3 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
              <span>Digital Wellbeing & Screen Curfew</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3D7D62]/30 text-[#68D391] border border-[#3D7D62]/50 font-bold">
                Mind Pillar
              </span>
            </h3>
            <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
              Track intentional usage, eliminate doom-scrolling & guard evening rest
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              soundManager.playChime('click');
              setIsAddAppModalOpen(true);
            }}
            className="py-2 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] flex items-center gap-1.5 transition-all light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add App</span>
          </button>

          <button
            onClick={() => handleOpenLogModal()}
            className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-[#3D7D62] text-white text-xs font-black hover:bg-[#2D6A4F] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Log Screen Time</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Analytics KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41]/60 flex flex-col gap-1 light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
              Screen Time Today
            </span>
            <span className="text-xs">⏱️</span>
          </div>
          <div className="text-xl font-black text-[#F4F7F4] light:text-[#1C221E]">
            {todayTotalMinutes} <span className="text-xs font-normal text-[#859A90]">/ {totalDailyCeiling}m budget</span>
          </div>
          <span className="text-[10px] text-[#68D391] font-semibold">
            {todayTotalMinutes <= totalDailyCeiling ? '✅ Within Safe Ceiling' : '⚠️ Exceeded Ceiling'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41]/60 flex flex-col gap-1 light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
              Doom-scroll Slips
            </span>
            <span className="text-xs">⚡</span>
          </div>
          <div className="text-xl font-black text-[#E5A93C] light:text-[#D97706]">
            {todayMindlessMinutes} <span className="text-xs font-normal text-[#859A90]">min</span>
          </div>
          <span className="text-[10px] text-[#859A90]">
            Aim for &lt; 20m daily
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41]/60 flex flex-col gap-1 light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
              Intentionality
            </span>
            <span className="text-xs">🛡️</span>
          </div>
          <div className="text-xl font-black text-[#68D391]">
            {intentionalRatio}%
          </div>
          <span className="text-[10px] text-[#859A90]">
            Planned vs impulsive
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41]/60 flex flex-col gap-1 light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
              Screen Curfew
            </span>
            <span className="text-xs">🌙</span>
          </div>
          <div className="text-xl font-black text-[#F4F7F4] light:text-[#1C221E]">
            {curfewTimeStr}
          </div>
          <span className="text-[10px] text-[#E5A93C] font-semibold">
            {curfewHours}h before {bedtime} sleep
          </span>
        </div>
      </div>

      {/* Monitored App Budgets Shelf */}
      <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm flex flex-col gap-3 light:bg-white light:border-[#E5E3DA]">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#3D7D62]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-[#BAC8C0] light:text-[#4A5568]">
              Monitored App Ceilings ({state.screenTimeApps.length})
            </h4>
          </div>
          <span className="text-[11px] text-[#859A90]">
            Ceiling resets daily at midnight
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {state.screenTimeApps.map(app => {
            const appSessions = todaySessions.filter(s => s.appId === app.id || s.appName.toLowerCase().includes(app.name.toLowerCase()));
            const appMinutes = appSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
            const ceiling = app.dailyCeilingMinutes || 1;
            const pct = Math.min(100, Math.round((appMinutes / ceiling) * 100));
            const isExceeded = appMinutes > ceiling;

            return (
              <div
                key={app.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                  isExceeded
                    ? 'bg-[#854D0E]/10 border-red-500/50 light:bg-red-50 light:border-red-200'
                    : 'bg-[#242D29] border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl p-1 rounded-xl bg-[#1B211E] border border-[#384A41] light:bg-white light:border-[#E5E3DA]">
                      {app.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E] truncate">
                          {app.name}
                        </span>
                        {app.isDoomscrollRisk && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#E5A93C]/20 text-[#E5A93C] font-bold">
                            High Risk
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#859A90] light:text-[#5C655E]">
                        {appMinutes} / {ceiling} min logged today
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenLogModal(app)}
                    className="py-1 px-3 rounded-xl bg-[#3D7D62] text-white text-[11px] font-black hover:bg-[#2D6A4F] transition-all whitespace-nowrap shadow-xs"
                  >
                    + Log
                  </button>
                </div>

                {/* Linear progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-[#121413] light:bg-[#D5D2C9] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-red-500'
                          : pct >= 80
                          ? 'bg-[#E5A93C]'
                          : 'bg-[#3D7D62]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold whitespace-nowrap ${
                      isExceeded ? 'text-red-400 font-black' : 'text-[#859A90]'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen Curfew & Evening Friction Shield Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#1B211E] to-[#242D29] border border-[#384A41] shadow-xs flex flex-col gap-3 light:from-[#F7F6F2] light:to-white light:border-[#E5E3DA]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#E5A93C]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-[#BAC8C0] light:text-[#4A5568]">
              Circadian Evening Wind-Down
            </h4>
          </div>
          <span className="text-[10px] font-bold text-[#E5A93C]">
            Curfew: {curfewTimeStr}
          </span>
        </div>

        <p className="text-xs text-[#B2C4BC] light:text-[#353E38] leading-relaxed">
          Blue-spectrum light within 2 hours of bedtime suppresses melatonin production and delays restorative deep NREM sleep. When urge to scroll strikes:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setActiveTab('urge')}
            className="p-2.5 rounded-2xl bg-[#1B211E] border border-[#384A41] hover:border-[#3D7D62] flex items-center justify-between text-left transition-all light:bg-white light:border-[#E5E3DA]"
          >
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">Ride Urge Wave (10m)</div>
                <div className="text-[10px] text-[#859A90]">Notice physical urge & surf decay</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#859A90]" />
          </button>

          <button
            onClick={() => handleOpenLogModal()}
            className="p-2.5 rounded-2xl bg-[#1B211E] border border-[#384A41] hover:border-[#3D7D62] flex items-center justify-between text-left transition-all light:bg-white light:border-[#E5E3DA]"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#68D391]" />
              <div>
                <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">Check In Screen Curfew</div>
                <div className="text-[10px] text-[#859A90]">Screens away & phone on charger</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#859A90]" />
          </button>
        </div>
      </div>

      {/* Recent Screen Time Activity Timeline */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#3D7D62]" />
            <h4 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E]">
              Recent Screen-Time Activity
            </h4>
          </div>
          <span className="text-[11px] font-bold text-[#859A90]">
            {allSessions.length} total entries
          </span>
        </div>

        {allSessions.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#1B211E] border border-dashed border-[#384A41] text-center flex flex-col items-center justify-center gap-2 light:bg-white light:border-[#E5E3DA]">
            <Smartphone className="w-8 h-8 text-[#859A90]" />
            <h5 className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
              No Screen-Time Sessions Recorded Yet
            </h5>
            <p className="text-[11px] text-[#859A90] max-w-xs">
              Log intentional checks or impulsive slips to build awareness and reclaim hours of mental bandwidth.
            </p>
            <button
              onClick={() => handleOpenLogModal()}
              className="mt-2 py-2 px-4 rounded-xl bg-[#3D7D62] text-white text-xs font-bold hover:bg-[#2D6A4F] transition-all"
            >
              Log First Check-in
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {allSessions.slice(0, 8).map(session => (
              <div
                key={session.id}
                className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41]/60 flex flex-col gap-1.5 hover:border-[#3D7D62]/60 transition-all light:bg-white light:border-[#E5E3DA]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#242D29] border border-[#384A41] flex items-center justify-center text-sm shrink-0 light:bg-[#F7F6F2]">
                      📱
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                          {session.appName}
                        </span>
                        {session.isIntentional ? (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#3D7D62]/20 text-[#68D391] border border-[#3D7D62]/40 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>Intentional</span>
                          </span>
                        ) : (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/40 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Mindless Slip</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-[#859A90] light:text-[#5C655E] flex items-center gap-2 mt-0.5">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span className="font-bold text-[#E5A93C]">{session.durationMinutes} minutes</span>
                        {session.triggerCue && (
                          <>
                            <span>•</span>
                            <span>Cue: {session.triggerCue}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-1 rounded-lg text-[#859A90] hover:text-[#EF4444] transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {session.notes && (
                  <p className="text-[11px] text-[#B2C4BC] light:text-[#353E38] pl-10 whitespace-pre-line">
                    {session.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ScreenTimeSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        preselectedApp={selectedAppForLog}
      />

      <AddMonitoredAppModal
        isOpen={isAddAppModalOpen}
        onClose={() => setIsAddAppModalOpen(false)}
      />
    </div>
  );
};
