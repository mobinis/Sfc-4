import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MeasurableTarget,
  ActivityRecord,
  TargetCategory,
  TargetStatus
} from '../../types';
import {
  Target,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  MoreVertical,
  Pause,
  Play,
  Archive,
  RefreshCw,
  Flame,
  Zap,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Calendar,
  Dumbbell,
  BookOpen,
  Smartphone,
  Heart,
  BarChart3
} from 'lucide-react';
import { TargetEditorModal } from './TargetEditorModal';
import { LogProgressModal } from './LogProgressModal';
import { WorkoutHubView } from '../workout/WorkoutHubView';
import { ReadingHubView } from '../reading/ReadingHubView';
import { DigitalWellbeingHubView } from '../digital/DigitalWellbeingHubView';
import { ImpactHubView } from '../impact/ImpactHubView';
import { VisualAnalyticsView } from '../analytics/VisualAnalyticsView';
import { soundManager } from '../../utils/soundHaptics';
import { DateUtils } from '../../utils/dateUtils';

export const ProgressionLabView: React.FC = () => {
  const {
    state,
    deleteMeasurableTarget,
    toggleTargetStatus,
    toggleTargetMilestone,
    deleteActivityRecord,
    awardXp,
    awardCoins,
    showToast
  } = useApp();

  const [mainView, setMainView] = useState<'targets' | 'workouts' | 'reading' | 'digital' | 'impact' | 'activity_log' | 'analytics'>('targets');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'paused' | 'archived' | 'all'>('active');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<MeasurableTarget | null>(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [loggingTarget, setLoggingTarget] = useState<MeasurableTarget | null>(null);

  // Active target context menu
  const [openMenuTargetId, setOpenMenuTargetId] = useState<string | null>(null);

  const today = DateUtils.todayStr();

  // Summary Metrics
  const activeTargets = state.measurableTargets.filter(t => t.status === 'active');
  const completedTargets = state.measurableTargets.filter(t => t.status === 'completed' || (!t.isReductionTarget && t.currentProgress >= t.targetValue));
  const safeReductions = state.measurableTargets.filter(t => t.isReductionTarget && t.currentProgress <= t.targetValue);
  const todayActivities = state.activityRecords.filter(a => a.date === today);

  // Filtered Targets
  const filteredTargets = state.measurableTargets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchNotes = t.notes.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchNotes) return false;
    }
    return true;
  });

  // Filtered Activity Records
  const filteredActivities = state.activityRecords.filter(a => {
    if (selectedCategory !== 'all') {
      const matchTarget = state.measurableTargets.find(t => t.id === a.targetId);
      if (matchTarget && matchTarget.category !== selectedCategory) return false;
      if (!matchTarget && a.domain !== selectedCategory) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || (a.notes && a.notes.toLowerCase().includes(q));
    }
    return true;
  });

  const handleOpenCreateTarget = () => {
    soundManager.playChime('click');
    setEditingTarget(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditTarget = (t: MeasurableTarget) => {
    soundManager.playChime('click');
    setEditingTarget(t);
    setOpenMenuTargetId(null);
    setIsEditorOpen(true);
  };

  const handleOpenLogForTarget = (t?: MeasurableTarget) => {
    soundManager.playChime('click');
    setLoggingTarget(t || null);
    setIsLogModalOpen(true);
  };

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Domains', icon: '🌐' },
    { id: 'fitness', label: 'Fitness', icon: '💪' },
    { id: 'reading', label: 'Reading', icon: '📖' },
    { id: 'learning', label: 'Learning', icon: '🧠' },
    { id: 'wellbeing', label: 'Wellbeing', icon: '🌙' },
    { id: 'digital', label: 'Digital Detox', icon: '📵' },
    { id: 'work', label: 'Work', icon: '🚀' },
    { id: 'impact', label: 'Impact', icon: '🌱' }
  ];

  return (
    <div className="flex flex-col gap-4 text-[#F4F7F4] light:text-[#1C221E]">
      {/* 1. Header & Metric Summary Bar */}
      <div className="flex flex-col gap-3 p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h2 className="text-base font-black tracking-tight">Progression Lab</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3D7D62]/20 text-[#68D391] border border-[#3D7D62]/40">
                Active Targets
              </span>
            </div>
            <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
              Define measurable targets, baselines, and review unified activity history
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                soundManager.playChime('click');
                setMainView('reading');
              }}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-[#242D29] hover:bg-[#384A41] border border-[#384A41] text-xs font-bold text-[#F4F7F4] flex items-center justify-center gap-1.5 transition-all active:scale-95 light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>Reading</span>
            </button>
            <button
              onClick={() => {
                soundManager.playChime('click');
                setMainView('workouts');
              }}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-[#242D29] hover:bg-[#384A41] border border-[#384A41] text-xs font-bold text-[#F4F7F4] flex items-center justify-center gap-1.5 transition-all active:scale-95 light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <Dumbbell className="w-3.5 h-3.5 text-[#3D7D62]" />
              <span>Workouts</span>
            </button>
            <button
              onClick={() => {
                soundManager.playChime('click');
                setMainView('digital');
              }}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-[#242D29] hover:bg-[#384A41] border border-[#384A41] text-xs font-bold text-[#F4F7F4] flex items-center justify-center gap-1.5 transition-all active:scale-95 light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Digital</span>
            </button>
            <button
              onClick={() => handleOpenLogForTarget()}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-[#242D29] hover:bg-[#384A41] border border-[#384A41] text-xs font-bold text-[#F4F7F4] flex items-center justify-center gap-1.5 transition-all active:scale-95 light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <Clock className="w-3.5 h-3.5 text-[#3D7D62]" />
              <span>Log Activity</span>
            </button>
            <button
              onClick={handleOpenCreateTarget}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-xs font-black text-white shadow-md shadow-[#3D7D62]/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New Target</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#384A41]/50 light:border-[#E5E3DA]">
          <div className="p-2.5 rounded-2xl bg-[#242D29] border border-[#384A41]/50 flex flex-col light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Active Targets
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black font-mono tabular-nums text-[#F4F7F4] light:text-[#1C221E]">
                {activeTargets.length}
              </span>
              <span className="text-[10px] text-[#859A90]">tracked</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#242D29] border border-[#384A41]/50 flex flex-col light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Goals Cleared
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black font-mono tabular-nums text-[#68D391]">
                {completedTargets.length}
              </span>
              <span className="text-[10px] text-[#859A90]">achieved</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#242D29] border border-[#384A41]/50 flex flex-col light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Curfew Shield
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black font-mono tabular-nums text-[#38BDF8]">
                {safeReductions.length}
              </span>
              <span className="text-[10px] text-[#859A90]">under ceiling</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#242D29] border border-[#384A41]/50 flex flex-col light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Today's Logs
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black font-mono tabular-nums text-[#E5A93C]">
                {todayActivities.length}
              </span>
              <span className="text-[10px] text-[#859A90]">entries</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation (Targets Matrix vs Workouts vs Reading vs Digital vs Daily Activity Log) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1 p-1 rounded-2xl bg-[#1B211E] border border-[#384A41] light:bg-white light:border-[#E5E3DA]">
          <button
            onClick={() => {
              soundManager.playChime('click');
              setMainView('targets');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mainView === 'targets'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Targets ({activeTargets.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playChime('click');
              setMainView('workouts');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mainView === 'workouts'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Workouts ({state.workoutTemplates.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playChime('click');
              setMainView('reading');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mainView === 'reading'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span>Reading ({state.bookResources.filter(b => b.status === 'reading').length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playChime('click');
              setMainView('digital');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mainView === 'digital'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Digital ({state.screenTimeApps?.length || 0})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playChime('click');
              setMainView('impact');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mainView === 'impact'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span>Impact ({state.impactDeeds?.length || 0})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playChime('click');
              setMainView('activity_log');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mainView === 'activity_log'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Activity Log ({state.activityRecords.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playChime('click');
              setMainView('analytics');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mainView === 'analytics'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Search Input (shown when on targets or activity log) */}
        {mainView !== 'workouts' && mainView !== 'reading' && mainView !== 'digital' && mainView !== 'impact' && (
          <div className="w-full sm:w-64 relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#859A90] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={mainView === 'targets' ? 'Search targets...' : 'Search activity records...'}
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs focus:border-[#3D7D62] focus:outline-hidden light:bg-white light:border-[#E5E3DA]"
            />
          </div>
        )}
      </div>

      {/* 3. Category Filter Chips (shown on targets and activity_log) */}
      {mainView !== 'workouts' && mainView !== 'reading' && mainView !== 'digital' && mainView !== 'impact' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(c => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  soundManager.playChime('click');
                  setSelectedCategory(c.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 border transition-all ${
                  isSelected
                    ? 'bg-[#3D7D62] border-[#3D7D62] text-white font-bold shadow-xs'
                    : 'bg-[#1B211E] border-[#384A41]/60 text-[#859A90] hover:text-[#F4F7F4] hover:border-[#384A41] light:bg-white light:border-[#E5E3DA] light:text-[#5C655E]'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. MAIN VIEW: TARGETS MATRIX */}
      {mainView === 'targets' && (
        <div className="flex flex-col gap-3">
          {/* Status filter bar */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              {filteredTargets.length} Targets Found
            </span>

            <div className="flex items-center gap-1">
              {(['active', 'paused', 'archived', 'all'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize transition-all ${
                    statusFilter === s
                      ? 'bg-[#242D29] text-[#68D391] border border-[#384A41] light:bg-[#F2F1EC]'
                      : 'text-[#859A90] hover:text-[#F4F7F4]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Targets Grid */}
          {filteredTargets.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#1B211E] border border-[#384A41] text-center flex flex-col items-center gap-2 light:bg-white light:border-[#E5E3DA]">
              <span className="text-3xl">🎯</span>
              <h4 className="text-sm font-bold">No progression targets found</h4>
              <p className="text-xs text-[#859A90] max-w-sm light:text-[#5C655E]">
                Create a measurable target for pushups, reading, deep work, or a reduction ceiling.
              </p>
              <button
                onClick={handleOpenCreateTarget}
                className="mt-2 px-4 py-2 rounded-xl bg-[#3D7D62] text-white text-xs font-black shadow-sm"
              >
                + Create First Target
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTargets.map(t => {
                const percent = t.targetValue > 0 ? Math.min(100, Math.round((t.currentProgress / t.targetValue) * 100)) : 0;
                const isOverCeiling = t.isReductionTarget && t.currentProgress > t.targetValue;
                const isSafeReduction = t.isReductionTarget && t.currentProgress <= t.targetValue;

                // Circular Progress SVG dimensions
                const size = 56;
                const strokeWidth = 4.5;
                const radius = (size - strokeWidth) / 2;
                const circumference = radius * 2 * Math.PI;
                const strokeOffset = circumference - (Math.min(100, percent) / 100) * circumference;

                const ringColor = t.isReductionTarget
                  ? isOverCeiling
                    ? '#EF4444'
                    : '#38BDF8'
                  : percent >= 100
                  ? '#68D391'
                  : '#3D7D62';

                return (
                  <div
                    key={t.id}
                    className={`relative p-4 rounded-3xl bg-[#1B211E] border transition-all flex flex-col justify-between gap-3 light:bg-white ${
                      t.status === 'paused'
                        ? 'opacity-60 border-[#384A41]/40 light:border-[#E5E3DA]'
                        : isOverCeiling
                        ? 'border-[#EF4444]/60 shadow-xs light:border-[#EF4444]/60'
                        : 'border-[#384A41] hover:border-[#3D7D62] light:border-[#E5E3DA]'
                    }`}
                  >
                    {/* Top Row: Icon, Title, Category, More Menu */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {/* Progress Ring / Gauge */}
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                            <circle
                              cx={size / 2}
                              cy={size / 2}
                              r={radius}
                              fill="transparent"
                              stroke="currentColor"
                              strokeWidth={strokeWidth}
                              className="text-[#242D29] light:text-[#E5E3DA]"
                            />
                            <circle
                              cx={size / 2}
                              cy={size / 2}
                              r={radius}
                              fill="transparent"
                              stroke={ringColor}
                              strokeWidth={strokeWidth}
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeOffset}
                              strokeLinecap="round"
                              className="transition-all duration-500"
                            />
                          </svg>
                          <span className="absolute text-lg">{t.icon}</span>
                        </div>

                        {/* Title and metadata */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-[#F4F7F4] light:text-[#1C221E] truncate">
                              {t.title}
                            </h4>
                            {t.status === 'paused' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#F59E0B]/20 text-[#F59E0B] font-bold">
                                Paused
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-[#859A90] light:text-[#5C655E] flex-wrap mt-0.5">
                            <span className="capitalize">{t.category}</span>
                            <span>•</span>
                            <span className="capitalize">{t.trackingPeriod}</span>
                            {t.linkedSkillId && (
                              <>
                                <span>•</span>
                                <span className="text-[#3D7D62] font-semibold">Skill Link</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* More Menu Toggle */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuTargetId(openMenuTargetId === t.id ? null : t.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#242D29] text-[#859A90] light:hover:bg-[#F2F1EC]"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuTargetId === t.id && (
                          <div className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-[#242D29] border border-[#384A41] shadow-xl p-1.5 flex flex-col gap-0.5 text-xs light:bg-white light:border-[#E5E3DA]">
                            <button
                              onClick={() => handleOpenEditTarget(t)}
                              className="px-2.5 py-1.5 rounded-lg text-left hover:bg-[#1B211E] flex items-center gap-2 text-[#F4F7F4] light:text-[#1C221E] light:hover:bg-[#F2F1EC]"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#859A90]" />
                              <span>Edit Target</span>
                            </button>

                            <button
                              onClick={() => {
                                toggleTargetStatus(t.id, t.status === 'paused' ? 'active' : 'paused');
                                setOpenMenuTargetId(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-left hover:bg-[#1B211E] flex items-center gap-2 text-[#F4F7F4] light:text-[#1C221E] light:hover:bg-[#F2F1EC]"
                            >
                              {t.status === 'paused' ? (
                                <>
                                  <Play className="w-3.5 h-3.5 text-[#68D391]" />
                                  <span>Resume Target</span>
                                </>
                              ) : (
                                <>
                                  <Pause className="w-3.5 h-3.5 text-[#F59E0B]" />
                                  <span>Pause Target</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                toggleTargetStatus(t.id, t.status === 'archived' ? 'active' : 'archived');
                                setOpenMenuTargetId(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-left hover:bg-[#1B211E] flex items-center gap-2 text-[#859A90] light:hover:bg-[#F2F1EC]"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              <span>{t.status === 'archived' ? 'Unarchive' : 'Archive'}</span>
                            </button>

                            <button
                              onClick={() => {
                                deleteMeasurableTarget(t.id);
                                setOpenMenuTargetId(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-left hover:bg-[#D95D39]/20 text-[#D95D39] flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Value Metrics */}
                    <div className="flex flex-col gap-1.5 p-2.5 rounded-2xl bg-[#242D29]/70 border border-[#384A41]/40 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono tabular-nums font-black text-sm text-[#F4F7F4] light:text-[#1C221E]">
                            {t.currentProgress}
                          </span>
                          <span className="text-[10px] text-[#859A90]">/</span>
                          <span className="font-mono tabular-nums text-xs text-[#859A90]">
                            {t.targetValue} {t.unit}
                          </span>
                        </div>

                        {t.isReductionTarget ? (
                          isSafeReduction ? (
                            <span className="text-[10px] font-bold text-[#38BDF8] flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Under Ceiling</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-[#EF4444] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Exceeded</span>
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-[#68D391]">
                            {percent}%
                          </span>
                        )}
                      </div>

                      {/* Linear Bar */}
                      <div className="w-full h-1.5 rounded-full bg-[#1B211E] overflow-hidden light:bg-[#E5E3DA]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, percent)}%`,
                            backgroundColor: ringColor
                          }}
                        />
                      </div>
                    </div>

                    {/* Milestones Stepper (if any) */}
                    {t.milestones && t.milestones.length > 0 && (
                      <div className="flex flex-col gap-1 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
                          Milestones ({t.milestones.filter(m => m.isCompleted).length}/{t.milestones.length})
                        </span>
                        <div className="flex flex-col gap-1">
                          {t.milestones.map((m, idx) => (
                            <button
                              key={m.id}
                              onClick={() => toggleTargetMilestone(t.id, m.id)}
                              className="flex items-center gap-2 text-left p-1 rounded-lg hover:bg-[#242D29] text-xs transition-all light:hover:bg-[#F2F1EC]"
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center shrink-0 border transition-all ${
                                  m.isCompleted
                                    ? 'bg-[#3D7D62] border-[#3D7D62] text-white'
                                    : 'border-[#384A41] text-transparent light:border-[#CBD5E1]'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                              </div>
                              <span
                                className={`text-[11px] truncate ${
                                  m.isCompleted ? 'line-through text-[#859A90]' : 'text-[#F4F7F4] light:text-[#1C221E]'
                                }`}
                              >
                                #{idx + 1} {m.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shared Tags */}
                    {t.tagIds.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {t.tagIds.map(tId => {
                          const tag = state.sharedTags.find(st => st.id === tId);
                          if (!tag) return null;
                          return (
                            <span
                              key={tag.id}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                              style={{
                                backgroundColor: `${tag.color}20`,
                                color: tag.color
                              }}
                            >
                              {tag.name}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Bottom Quick-Log Button */}
                    <div className="pt-2 border-t border-[#384A41]/50 flex items-center justify-between gap-2 light:border-[#E5E3DA]">
                      <span className="text-[10px] text-[#859A90] font-mono">
                        Base: {t.baselineValue} {t.unit}
                      </span>

                      <button
                        onClick={() => handleOpenLogForTarget(t)}
                        className="px-3 py-1.5 rounded-xl bg-[#3D7D62]/20 hover:bg-[#3D7D62] text-[#68D391] hover:text-white border border-[#3D7D62]/40 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log Session</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. MAIN VIEW: READING & KNOWLEDGE PROGRESSION HUB */}
      {mainView === 'reading' && <ReadingHubView />}

      {/* 6. MAIN VIEW: WORKOUT & PHYSICAL TRAINING HUB */}
      {mainView === 'workouts' && <WorkoutHubView />}

      {/* 7. MAIN VIEW: DIGITAL WELLBEING & SCREEN TIME HUB */}
      {mainView === 'digital' && <DigitalWellbeingHubView />}

      {/* 8. MAIN VIEW: DAILY IMPACT & MEANINGFUL ACTIONS HUB */}
      {mainView === 'impact' && <ImpactHubView />}

      {/* 7. MAIN VIEW: UNIFIED DAILY ACTIVITY LOG */}
      {mainView === 'activity_log' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              {filteredActivities.length} Activity Records Logged
            </span>
            <button
              onClick={() => handleOpenLogForTarget()}
              className="px-3 py-1 rounded-xl bg-[#3D7D62] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Record Activity</span>
            </button>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#1B211E] border border-[#384A41] text-center flex flex-col items-center gap-2 light:bg-white light:border-[#E5E3DA]">
              <span className="text-3xl">📜</span>
              <h4 className="text-sm font-bold">No activity recorded yet</h4>
              <p className="text-xs text-[#859A90] max-w-sm light:text-[#5C655E]">
                Log your first workout set, reading pages, deep focus session, or screen time check.
              </p>
              <button
                onClick={() => handleOpenLogForTarget()}
                className="mt-2 px-4 py-2 rounded-xl bg-[#3D7D62] text-white text-xs font-black shadow-sm"
              >
                + Log Activity
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredActivities.map(act => {
                const actTime = new Date(act.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const isToday = act.date === today;

                const domainEmojis: Record<string, string> = {
                  workout: '💪',
                  reading: '📖',
                  learning: '🧠',
                  screentime: '📵',
                  impact: '🌱',
                  target: '🎯',
                  skill: '⭐'
                };

                return (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] hover:border-[#3D7D62]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 light:bg-white light:border-[#E5E3DA]"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#242D29] border border-[#384A41] flex items-center justify-center shrink-0 text-base light:bg-[#F7F6F2] light:border-[#E5E3DA]">
                        {domainEmojis[act.domain] || '🎯'}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
                            {act.title}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3D7D62]/20 text-[#68D391] font-bold">
                            +{act.value} {act.unit}
                          </span>
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center gap-2 text-[10px] text-[#859A90] light:text-[#5C655E] flex-wrap mt-0.5">
                          <span className="font-mono">
                            {isToday ? `Today at ${actTime}` : `${act.date} • ${actTime}`}
                          </span>
                          {act.durationMinutes && (
                            <>
                              <span>•</span>
                              <span>{act.durationMinutes} min</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-[#E5A93C] font-semibold">+{act.xpEarned || 15} XP</span>
                        </div>

                        {/* Notes */}
                        {act.notes && (
                          <p className="text-[11px] font-mono text-[#BAC8C0] light:text-[#4A5568] mt-1.5 bg-[#242D29]/60 p-2 rounded-xl border border-[#384A41]/40 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
                            {act.notes}
                          </p>
                        )}

                        {/* Tags */}
                        {act.tagIds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {act.tagIds.map(tId => {
                              const tag = state.sharedTags.find(st => st.id === tId);
                              if (!tag) return null;
                              return (
                                <span
                                  key={tag.id}
                                  className="px-2 py-0.5 rounded-md text-[9px] font-medium"
                                  style={{
                                    backgroundColor: `${tag.color}20`,
                                    color: tag.color
                                  }}
                                >
                                  {tag.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => deleteActivityRecord(act.id)}
                        className="p-1.5 rounded-lg text-[#859A90] hover:text-[#D95D39] hover:bg-[#242D29] transition-all light:hover:bg-[#F2F1EC]"
                        title="Delete log entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. MAIN VIEW: VISUAL ANALYTICS */}
      {mainView === 'analytics' && <VisualAnalyticsView />}

      {/* Target Editor Modal */}
      <TargetEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingTarget(null);
        }}
        target={editingTarget}
      />

      {/* Log Progress Modal */}
      <LogProgressModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setLoggingTarget(null);
        }}
        target={loggingTarget}
      />
    </div>
  );
};
