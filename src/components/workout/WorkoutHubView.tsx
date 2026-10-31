import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  WorkoutRoutineTemplate,
  ExerciseMovementPattern,
  ExerciseItem,
  WorkoutSessionRecord
} from '../../types';
import {
  Dumbbell,
  Play,
  Plus,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  Trash2,
  Edit2,
  ChevronRight,
  Sparkles,
  Info,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { WorkoutPlayerModal } from './WorkoutPlayerModal';
import { WorkoutTemplateModal } from './WorkoutTemplateModal';
import { CustomExerciseModal } from './CustomExerciseModal';
import { soundManager } from '../../utils/soundHaptics';

export const WorkoutHubView: React.FC = () => {
  const { state, deleteWorkoutSession, deleteWorkoutTemplate, showToast } = useApp();

  const [workoutTab, setWorkoutTab] = useState<'routines' | 'exercises' | 'history'>('routines');

  // Modals
  const [selectedTemplateForRun, setSelectedTemplateForRun] = useState<WorkoutRoutineTemplate | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutRoutineTemplate | null>(null);

  const [isCustomExModalOpen, setIsCustomExModalOpen] = useState(false);

  // Exercise Library Filters
  const [selectedPattern, setSelectedPattern] = useState<string>('all');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [expandedCuesExerciseId, setExpandedCuesExerciseId] = useState<string | null>(null);

  // Summary Metrics
  const totalWorkouts = state.workoutSessions.length;
  const totalVolumeReps = state.workoutSessions.reduce((sum, w) => sum + w.totalVolumeReps, 0);
  const totalMinutes = state.workoutSessions.reduce((sum, w) => sum + w.durationMinutes, 0);
  const allPersonalBests = state.exerciseLibrary.filter(e => e.personalBest?.maxReps && e.personalBest.maxReps > 0);

  const handleStartWorkout = (tpl?: WorkoutRoutineTemplate) => {
    soundManager.playChime('click');
    setSelectedTemplateForRun(tpl || null);
    setIsPlayerOpen(true);
  };

  const handleOpenEditTemplate = (tpl: WorkoutRoutineTemplate) => {
    setEditingTemplate(tpl);
    setIsTemplateModalOpen(true);
  };

  const patternIcons: Record<ExerciseMovementPattern, string> = {
    push: '💪 Push',
    pull: '🧗 Pull',
    legs: '🦵 Legs',
    core: '🛡️ Core',
    cardio: '🔥 Cardio',
    mobility: '🧘 Mobility'
  };

  // Filtered exercises
  const filteredExercises = state.exerciseLibrary.filter(ex => {
    if (selectedPattern !== 'all' && ex.pattern !== selectedPattern) return false;
    if (exerciseSearch.trim()) {
      const q = exerciseSearch.toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.primaryMuscle.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header Banner & Quick Actions */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-xs flex flex-col gap-3.5 light:bg-white light:border-[#E5E3DA]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D7D62]/20 border border-[#3D7D62]/40 flex items-center justify-center text-xl shrink-0">
              💪
            </div>
            <div>
              <h3 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E] tracking-tight">
                Workout & Physical Training
              </h3>
              <p className="text-xs text-[#859A90] light:text-[#5C655E]">
                Calisthenics, multi-set tracker, rest timer & volume analytics
              </p>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <button
              onClick={() => handleStartWorkout()}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-[#3D7D62] text-white text-xs font-black shadow-xs hover:bg-[#326750] flex items-center justify-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Quick Workout</span>
            </button>

            <button
              onClick={() => {
                setEditingTemplate(null);
                setIsTemplateModalOpen(true);
              }}
              className="px-3 py-2.5 rounded-2xl bg-[#242D29] hover:bg-[#384A41]/40 border border-[#384A41] text-xs font-bold text-[#F4F7F4] flex items-center justify-center gap-1 light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <Plus className="w-3.5 h-3.5 text-[#3D7D62]" />
              <span>Routine</span>
            </button>

            <button
              onClick={() => setIsCustomExModalOpen(true)}
              className="px-3 py-2.5 rounded-2xl bg-[#242D29] hover:bg-[#384A41]/40 border border-[#384A41] text-xs font-bold text-[#F4F7F4] flex items-center justify-center gap-1 light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <Plus className="w-3.5 h-3.5 text-[#3D7D62]" />
              <span>Exercise</span>
            </button>
          </div>
        </div>

        {/* 2. Metric Summary Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#384A41]/40 light:border-[#E5E3DA]">
          <div className="p-2.5 rounded-2xl bg-[#242D29] border border-[#384A41]/50 flex flex-col light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Workouts Done
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black font-mono tabular-nums text-[#F4F7F4] light:text-[#1C221E]">
                {totalWorkouts}
              </span>
              <span className="text-[10px] text-[#859A90]">sessions</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#242D29] border border-[#384A41]/50 flex flex-col light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Total Reps
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black font-mono tabular-nums text-[#68D391]">
                {totalVolumeReps}
              </span>
              <span className="text-[10px] text-[#859A90]">volume</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#242D29] border border-[#384A41]/50 flex flex-col light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Time Under Tension
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black font-mono tabular-nums text-[#38BDF8]">
                {totalMinutes}
              </span>
              <span className="text-[10px] text-[#859A90]">mins</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#242D29] border border-[#384A41]/50 flex flex-col light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Personal Records
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black font-mono tabular-nums text-[#E5A93C]">
                {allPersonalBests.length}
              </span>
              <span className="text-[10px] text-[#859A90]">tracked</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section Navigation (Routines vs Exercise Library vs History) */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#1B211E] border border-[#384A41] light:bg-white light:border-[#E5E3DA]">
        <button
          onClick={() => {
            soundManager.playChime('click');
            setWorkoutTab('routines');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            workoutTab === 'routines'
              ? 'bg-[#3D7D62] text-white shadow-xs'
              : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Routines ({state.workoutTemplates.length})</span>
        </button>

        <button
          onClick={() => {
            soundManager.playChime('click');
            setWorkoutTab('exercises');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            workoutTab === 'exercises'
              ? 'bg-[#3D7D62] text-white shadow-xs'
              : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Exercise Library ({state.exerciseLibrary.length})</span>
        </button>

        <button
          onClick={() => {
            soundManager.playChime('click');
            setWorkoutTab('history');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            workoutTab === 'history'
              ? 'bg-[#3D7D62] text-white shadow-xs'
              : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>History ({state.workoutSessions.length})</span>
        </button>
      </div>

      {/* 4. TAB CONTENT */}

      {/* TAB A: ROUTINES & TEMPLATES */}
      {workoutTab === 'routines' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.workoutTemplates.map(tpl => {
              const linkedTarget = state.measurableTargets.find(t => t.id === tpl.linkedTargetId);
              return (
                <div
                  key={tpl.id}
                  className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] hover:border-[#3D7D62] transition-all flex flex-col justify-between gap-3.5 light:bg-white light:border-[#E5E3DA]"
                >
                  <div className="space-y-2">
                    {/* Header: Icon, Name, Patterns */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{tpl.icon}</span>
                        <div>
                          <h4 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E]">
                            {tpl.name}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-[10px] text-[#859A90] font-mono">
                              ⏱️ {tpl.estimatedMinutes}m
                            </span>
                            <span className="text-[#859A90] text-[10px]">•</span>
                            <span className="text-[10px] text-[#859A90]">
                              {tpl.exercises.length} exercises
                            </span>
                            {linkedTarget && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#3D7D62]/20 text-[#68D391] border border-[#3D7D62]/40">
                                🎯 {linkedTarget.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Custom indicator or delete */}
                      {tpl.isCustom && (
                        <button
                          onClick={() => deleteWorkoutTemplate(tpl.id)}
                          className="p-1.5 text-[#859A90] hover:text-[#EF4444]"
                          title="Delete Custom Routine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-[#859A90] light:text-[#5C655E] line-clamp-2">
                      {tpl.description}
                    </p>

                    {/* Exercise Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {tpl.exercises.map((item, idx) => {
                        const ex = state.exerciseLibrary.find(e => e.id === item.exerciseId);
                        return (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-[10px] bg-[#242D29] text-[#859A90] border border-[#384A41]/40 flex items-center gap-1 light:bg-[#F2F1EC]"
                          >
                            <span>{ex?.icon || '💪'}</span>
                            <span>{ex?.name || item.exerciseId}</span>
                            <span className="text-[#68D391] font-mono font-bold">
                              {item.sets}x{item.targetReps}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Action: Start Workout */}
                  <div className="pt-2 border-t border-[#384A41]/40 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEditTemplate(tpl)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] hover:bg-[#242D29] flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={() => handleStartWorkout(tpl)}
                      className="px-4 py-2 rounded-xl bg-[#3D7D62] text-white text-xs font-black shadow-xs hover:bg-[#326750] flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Workout</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB B: EXERCISE LIBRARY */}
      {workoutTab === 'exercises' && (
        <div className="space-y-3">
          {/* Search & Pattern Chips */}
          <div className="p-3 rounded-2xl bg-[#1B211E] border border-[#384A41] space-y-2.5 light:bg-white light:border-[#E5E3DA]">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#859A90]" />
              <input
                type="text"
                placeholder="Search exercise, muscle, or equipment..."
                value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-[#F4F7F4] placeholder-[#859A90]/60 outline-hidden light:text-[#1C221E]"
              />
            </div>
            {/* Pattern Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <button
                onClick={() => setSelectedPattern('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedPattern === 'all'
                    ? 'bg-[#3D7D62] text-white'
                    : 'bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F2F1EC]'
                }`}
              >
                All Patterns ({state.exerciseLibrary.length})
              </button>
              {(Object.keys(patternIcons) as ExerciseMovementPattern[]).map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPattern(p)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedPattern === p
                      ? 'bg-[#3D7D62] text-white'
                      : 'bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F2F1EC]'
                  }`}
                >
                  {patternIcons[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredExercises.map(ex => {
              const hasCues = ex.formCues && ex.formCues.length > 0;
              const isCuesExpanded = expandedCuesExerciseId === ex.id;
              return (
                <div
                  key={ex.id}
                  className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex flex-col justify-between gap-2 light:bg-white light:border-[#E5E3DA]"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{ex.icon}</span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#F4F7F4] light:text-[#1C221E]">
                            {ex.name}
                          </h4>
                          <div className="text-[10px] text-[#859A90] flex items-center gap-1.5">
                            <span className="font-semibold text-[#68D391] uppercase">{ex.pattern}</span>
                            <span>•</span>
                            <span>{ex.primaryMuscle}</span>
                            <span>•</span>
                            <span>{ex.equipment}</span>
                          </div>
                        </div>
                      </div>

                      {/* Personal Best Badge */}
                      {ex.personalBest?.maxReps ? (
                        <div className="px-2 py-0.5 rounded-lg bg-[#E5A93C]/15 border border-[#E5A93C]/30 text-[#E5A93C] text-[10px] font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          <span>PR: {ex.personalBest.maxReps}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Form Cues collapsible */}
                    {hasCues && (
                      <div className="pt-1">
                        <button
                          onClick={() => setExpandedCuesExerciseId(isCuesExpanded ? null : ex.id)}
                          className="text-[10px] font-bold text-[#3D7D62] hover:text-[#68D391] flex items-center gap-1"
                        >
                          <Info className="w-3 h-3" />
                          <span>{isCuesExpanded ? 'Hide Form Tips' : 'View Form Tips'}</span>
                        </button>
                        {isCuesExpanded && (
                          <div className="mt-1.5 p-2 rounded-xl bg-[#242D29] border border-[#384A41]/40 text-xs text-[#859A90] space-y-1 light:bg-[#F7F6F2]">
                            {ex.formCues.map((cue, i) => (
                              <div key={i} className="flex items-start gap-1">
                                <span className="text-[#3D7D62]">•</span>
                                <span className="text-[#F4F7F4]/90 light:text-[#2C332E]">{cue}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Defaults */}
                  <div className="pt-1.5 border-t border-[#384A41]/30 flex items-center justify-between text-[10px] text-[#859A90]">
                    <span>
                      Standard: {ex.defaultSets} sets × {ex.defaultReps} reps
                    </span>
                    <span>Rest: {ex.defaultRestSeconds}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB C: WORKOUT HISTORY */}
      {workoutTab === 'history' && (
        <div className="space-y-3">
          {state.workoutSessions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#1B211E] border border-[#384A41] text-center flex flex-col items-center gap-2 light:bg-white light:border-[#E5E3DA]">
              <span className="text-3xl">⏱️</span>
              <h4 className="text-sm font-bold">No workout history logged yet</h4>
              <p className="text-xs text-[#859A90] max-w-sm light:text-[#5C655E]">
                Start a live session from any routine above to track sets, reps, and PRs.
              </p>
              <button
                onClick={() => handleStartWorkout()}
                className="mt-2 px-4 py-2 rounded-xl bg-[#3D7D62] text-white text-xs font-black shadow-sm"
              >
                + Launch Workout
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {state.workoutSessions.map(session => (
                <div
                  key={session.id}
                  className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] flex flex-col gap-2.5 light:bg-white light:border-[#E5E3DA]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">💪</span>
                      <div>
                        <h4 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E]">
                          {session.routineName}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-[#859A90]">
                          <span>📅 {session.date}</span>
                          <span>•</span>
                          <span>⏱️ {session.durationMinutes}m duration</span>
                          {session.overallRpe && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[#E5A93C] font-bold">
                                RPE {session.overallRpe}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-[#3D7D62]/20 text-[#68D391] border border-[#3D7D62]/40">
                        +{session.xpEarned} XP
                      </span>
                      <button
                        onClick={() => deleteWorkoutSession(session.id)}
                        className="p-1.5 text-[#859A90] hover:text-[#EF4444]"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Summary volume metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#242D29] border border-[#384A41]/40 text-center light:bg-[#F7F6F2]">
                    <div>
                      <span className="text-[10px] text-[#859A90] uppercase font-bold">Volume</span>
                      <div className="text-xs font-black font-mono text-[#F4F7F4] light:text-[#1C221E] mt-0.5">
                        {session.totalVolumeReps} reps
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#859A90] uppercase font-bold">Exercises</span>
                      <div className="text-xs font-black font-mono text-[#68D391] mt-0.5">
                        {session.exercises.length} movements
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-[#859A90] uppercase font-bold">Rewards</span>
                      <div className="text-xs font-black font-mono text-[#E5A93C] mt-0.5">
                        +{session.coinsEarned} 🪙
                      </div>
                    </div>
                  </div>

                  {/* New Personal Bests badge */}
                  {session.newPersonalBests && session.newPersonalBests.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {session.newPersonalBests.map((pb, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#E5A93C] text-[10px] font-bold flex items-center gap-1"
                        >
                          <Flame className="w-3 h-3" />
                          <span>{pb}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {session.notes && (
                    <p className="text-xs text-[#859A90] light:text-[#5C655E] italic">
                      "{session.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <WorkoutPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        template={selectedTemplateForRun}
      />

      <WorkoutTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        initialTemplate={editingTemplate}
      />

      <CustomExerciseModal
        isOpen={isCustomExModalOpen}
        onClose={() => setIsCustomExModalOpen(false)}
      />
    </div>
  );
};
