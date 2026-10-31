import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DateUtils } from '../utils/dateUtils';
import { Check, Flame, Sparkles, ChevronRight, Play, Plus, Minus, ArrowRight, Edit3, Settings2 } from 'lucide-react';
import { soundManager } from '../utils/soundHaptics';
import { BreathPacerModal } from '../components/modals/BreathPacerModal';
import { RoutinePlayerModal } from '../components/modals/RoutinePlayerModal';
import { TodayProgressCard } from '../components/progression/TodayProgressCard';
import { EditDailyChecklistModal } from '../components/habits/EditDailyChecklistModal';
import { RoutineFlow } from '../types';

export const TodayScreen: React.FC = () => {
  const {
    state,
    level,
    currentXp,
    neededXp,
    rankTitle,
    toggleHabit,
    incrementCountHabit,
    togglePillar,
    toggleLowEnergy,
    awardXp,
    awardCoins,
    setActiveTab,
    showToast,
    activeReminders,
    setIsReminderModalOpen
  } = useApp();

  const [activeRoutine, setActiveRoutine] = useState<RoutineFlow | null>(null);
  const [isBreathOpen, setIsBreathOpen] = useState<boolean>(false);
  const [isEditChecklistOpen, setIsEditChecklistOpen] = useState<boolean>(false);

  const today = DateUtils.todayStr();

  // Active Pillars (Default and Custom)
  const activePillars = useMemo(() => {
    return state.nodes
      .filter(n => n.p === '0' && !n.isArchived)
      .sort((a, b) => {
        if (a.id === 'unassigned') return 1;
        if (b.id === 'unassigned') return -1;
        return (a.order ?? 0) - (b.order ?? 0);
      });
  }, [state.nodes]);

  // Dynamic progress calculation across all active pillars
  const pillarProgressList = useMemo(() => {
    const defaultColors: Record<string, string> = {
      learn: '#3B82F6',
      build: '#E5A93C',
      body: '#3D7D62',
      mind: '#8B5CF6',
      care: '#14B8A6',
      faith: '#F59E0B'
    };

    return activePillars.map(pillar => {
      const isDirectlyDone = state.ev.some(e => e.n === pillar.id && e.d === today);
      const subHabits = state.nodes.filter(n => n.p === pillar.id);
      let pct = 0;
      if (isDirectlyDone) {
        pct = 100;
      } else if (subHabits.length > 0) {
        const completedCount = subHabits.filter(h => state.ev.some(e => e.n === h.id && e.d === today)).length;
        pct = Math.round((completedCount / subHabits.length) * 100);
      }

      return {
        pillar,
        percent: pct,
        color: pillar.color || defaultColors[pillar.id] || '#3D7D62'
      };
    });
  }, [activePillars, state.nodes, state.ev, today]);

  // Filtered short habit list
  const allHabits = state.nodes.filter(n => n.p !== '0');
  const visibleHabits = state.lowEnergyMode
    ? allHabits.filter(h => state.lowEnergyEssentialIds.includes(h.id))
    : allHabits;

  // Select Today's Focus card habit:
  const uncheckedHabits = visibleHabits.filter(h => !state.ev.some(e => e.n === h.id && e.d === today));
  const focusHabit = uncheckedHabits.length > 0 ? uncheckedHabits[0] : visibleHabits[0];
  const isFocusCompleted = focusHabit ? state.ev.some(e => e.n === focusHabit.id && e.d === today) : false;

  const isHabitChecked = (id: string) => state.ev.some(e => e.n === id && e.d === today);
  const getHabitCount = (id: string) => {
    const ev = state.ev.find(e => e.n === id && e.d === today);
    return ev ? ev.c : 0;
  };

  const handleStartPrimaryAction = () => {
    soundManager.playChime('click');
    if (state.routines.length > 0) {
      setActiveRoutine(state.routines[0]);
    } else {
      setIsBreathOpen(true);
    }
  };

  const handleRoutineCompleted = (routineId: string, linkedHabitIds: string[]) => {
    linkedHabitIds.forEach(id => {
      if (!isHabitChecked(id)) {
        toggleHabit(id, 20);
      }
    });
    awardXp(30, 'Full routine flow completed');
    awardCoins(5);
    showToast('✨ Routine Completed (+30 XP, +5 🪙)');
  };

  // SVG Progress Ring Component
  const ProgressRing = ({
    percent,
    color,
    icon,
    label,
    onClick
  }: {
    percent: number;
    color: string;
    icon: string;
    label: string;
    onClick: () => void;
  }) => {
    const size = 68;
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[#1B211E] border border-[#384A41]/60 hover:border-[#3D7D62] transition-all active:scale-95 light:bg-white light:border-[#E5E3DA]"
      >
        <div className="relative flex items-center justify-center w-[68px] h-[68px]">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-[#242D29] light:stroke-[#E5E3DA]"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm">{icon}</span>
            <span className="text-[10px] font-mono font-bold text-[#F4F7F4] light:text-[#1C221E]">
              {percent}%
            </span>
          </div>
        </div>
        <span className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E]">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* 1. Compact Greeting & Level / XP Summary */}
      <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3D7D62] animate-pulse" />
              <h2 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E] tracking-tight">
                Good day, Sentinel
              </h2>
            </div>
            <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
              {rankTitle} • Level {level}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLowEnergy}
              className={`py-1 px-2.5 rounded-xl border text-[11px] font-bold transition-colors ${
                state.lowEnergyMode
                  ? 'bg-[#2A5643] border-[#3D7D62] text-[#E8F3ED]'
                  : 'bg-[#242D29] border-[#384A41] text-[#859A90] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#5C655E]'
              }`}
            >
              {state.lowEnergyMode ? '🌿 Low-Energy' : '⚡ Essentials'}
            </button>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-2 rounded-full bg-[#242D29] light:bg-[#E5E3DA] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3D7D62] to-[#E5A93C] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((currentXp / neededXp) * 100))}%` }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-[#E5A93C]">
            {currentXp}/{neededXp} XP
          </span>
        </div>
      </div>

      {/* 2. Today's Focus Card */}
      {focusHabit && (
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1B211E] to-[#242D29] border border-[#3D7D62]/40 shadow-md light:from-white light:to-[#F7F6F2] light:border-[#3D7D62]/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#2A5643] text-[#E8F3ED] font-black uppercase tracking-wider text-[10px] light:bg-[#E8F3ED] light:text-[#1C3026]">
                🎯 Today's Focus
              </span>
              {focusHabit.importance === 'critical' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 font-bold">
                  Critical Anchor
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#E5A93C]">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{state.dailyThreeStreak.cur}d streak</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-2xl bg-[#242D29] light:bg-[#EFECE6]">
                {focusHabit.e}
              </span>
              <div>
                <h3 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E]">
                  {focusHabit.n}
                </h3>
                <p className="text-[11px] text-[#859A90] light:text-[#5C655E] mt-0.5">
                  {focusHabit.ifThenAnchor || 'Anchor into your highest-energy window today'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playChime('success');
                toggleHabit(focusHabit.id);
              }}
              className={`min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                isFocusCompleted
                  ? 'bg-[#3D7D62] text-white shadow-md'
                  : 'bg-[#242D29] border border-[#384A41] text-[#859A90] hover:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA]'
              }`}
            >
              <Check className={`w-6 h-6 stroke-[3] ${isFocusCompleted ? 'scale-110' : 'opacity-40'}`} />
            </button>
          </div>
        </div>
      )}

      {/* 2b. High-Priority Mindful Cue Banner */}
      {activeReminders.length > 0 && (
        <div
          onClick={() => {
            soundManager.playChime('click');
            setIsReminderModalOpen(true);
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-[#242D29] to-[#1B211E] border border-[#E5A93C]/50 hover:border-[#E5A93C] cursor-pointer transition-all flex items-center justify-between gap-3 shadow-xs light:from-white light:to-[#FAF9F5] light:border-[#E5A93C]/40"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl p-1.5 rounded-xl bg-[#2E2308] border border-[#E5A93C]/30 text-[#E5A93C]">
              {activeReminders[0].icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E] truncate">
                  {activeReminders[0].title}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#E5A93C]/20 text-[#E5A93C] font-extrabold uppercase">
                  {activeReminders[0].dueTimeLabel}
                </span>
              </div>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E] truncate">
                {activeReminders[0].message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {activeReminders.length > 1 && (
              <span className="text-[10px] font-bold text-[#859A90]">+{activeReminders.length - 1}</span>
            )}
            <ChevronRight className="w-4 h-4 text-[#859A90]" />
          </div>
        </div>
      )}

      {/* 3. Dynamic Pillar Progress Rings */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-bold text-[#859A90] light:text-[#5C655E] uppercase tracking-wider">
            Pillar Equilibrium ({activePillars.length} Domains)
          </span>
          <button
            onClick={() => setActiveTab('growth')}
            className="text-[11px] font-bold text-[#3D7D62] hover:underline flex items-center gap-0.5"
          >
            Manage Pillars <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-3 md:grid-cols-6">
          {pillarProgressList.map(item => (
            <div key={item.pillar.id} className="shrink-0 min-w-[95px] sm:min-w-0">
              <ProgressRing
                percent={item.percent}
                color={item.color}
                icon={item.pillar.e}
                label={item.pillar.n}
                onClick={() => {
                  soundManager.playChime('click');
                  togglePillar(item.pillar.id);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progression Lab Active Targets Widget */}
      <TodayProgressCard />

      {/* 4. Short Daily Habit Checklist */}
      <div className="p-3.5 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA]">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#859A90] light:text-[#5C655E] uppercase tracking-wider">
              Daily Habits Checklist
            </span>
            <span className="text-[11px] font-mono text-[#859A90] light:text-[#5C655E]">
              {visibleHabits.filter(h => isHabitChecked(h.id)).length}/{visibleHabits.length} Done
            </span>
          </div>

          <button
            onClick={() => {
              soundManager.playChime('click');
              setIsEditChecklistOpen(true);
            }}
            className="py-1 px-2.5 rounded-xl bg-[#242D29] hover:bg-[#384A41] border border-[#384A41] text-[11px] font-bold text-[#E5A93C] flex items-center gap-1 transition-all active:scale-95 light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Checklist</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {visibleHabits.slice(0, 6).map(habit => {
            const checked = isHabitChecked(habit.id);
            const count = getHabitCount(habit.id);

            return (
              <div
                key={habit.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                  checked
                    ? 'bg-[#242D29]/40 border-[#3D7D62]/50 light:bg-[#E8F3ED]/40 light:border-[#3D7D62]/40'
                    : 'bg-[#242D29] border-[#384A41]/70 hover:border-[#3D7D62]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="text-xl shrink-0">{habit.e}</span>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold truncate transition-colors ${
                        checked ? 'line-through text-[#859A90] light:text-[#5C655E]' : 'text-[#F4F7F4] light:text-[#1C221E]'
                      }`}
                    >
                      {habit.n}
                    </div>
                    {habit.ifThenAnchor && (
                      <div className="text-[10px] text-[#859A90] light:text-[#5C655E] truncate">
                        ⚓ {habit.ifThenAnchor}
                      </div>
                    )}
                  </div>
                </div>

                {habit.k === 'count' ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => incrementCountHabit(habit.id, -1)}
                      className="w-10 h-10 rounded-xl bg-[#1B211E] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center active:scale-90 light:bg-white light:border-[#E5E3DA]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-xs font-mono font-bold text-[#F4F7F4] light:text-[#1C221E]">
                      {count}/{habit.g}
                    </span>
                    <button
                      onClick={() => incrementCountHabit(habit.id, 1)}
                      className="w-10 h-10 rounded-xl bg-[#3D7D62] text-white flex items-center justify-center active:scale-90 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      soundManager.playChime('success');
                      toggleHabit(habit.id);
                    }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                      checked
                        ? 'bg-[#3D7D62] text-white shadow-sm'
                        : 'bg-[#1B211E] border border-[#384A41] text-transparent hover:border-[#3D7D62] light:bg-white light:border-[#E5E3DA]'
                    }`}
                  >
                    <Check className={`w-5 h-5 stroke-[3] ${checked ? 'text-white' : 'opacity-0'}`} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Edit / Manage All Habits Footer Link */}
        <button
          onClick={() => {
            soundManager.playChime('click');
            setIsEditChecklistOpen(true);
          }}
          className="w-full mt-2.5 py-2 px-3 rounded-2xl bg-[#242D29] hover:bg-[#384A41]/60 border border-[#384A41]/60 text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center gap-1.5 transition-all light:bg-[#F7F6F2] light:border-[#E5E3DA]"
        >
          <Settings2 className="w-3.5 h-3.5 text-[#E5A93C]" />
          <span>Customize Habits Checklist ({allHabits.length} total)</span>
        </button>
      </div>

      {/* 5. One Primary Action */}
      <button
        onClick={handleStartPrimaryAction}
        className="w-full py-3.5 px-4 rounded-2xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-sm font-black shadow-lg shadow-[#3D7D62]/20 flex items-center justify-center gap-2 active:scale-98 transition-all light:bg-[#2D6A4F]"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>Launch Mindful Routine Ritual (+30 XP)</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Modals mounted conditionally */}
      {activeRoutine && (
        <RoutinePlayerModal
          isOpen={true}
          routine={activeRoutine}
          onClose={() => setActiveRoutine(null)}
          onComplete={handleRoutineCompleted}
        />
      )}

      {isBreathOpen && (
        <BreathPacerModal isOpen={true} onClose={() => setIsBreathOpen(false)} />
      )}

      {/* Edit Daily Checklist Modal */}
      <EditDailyChecklistModal
        isOpen={isEditChecklistOpen}
        onClose={() => setIsEditChecklistOpen(false)}
      />
    </div>
  );
};
