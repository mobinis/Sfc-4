import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  WorkoutRoutineTemplate,
  WorkoutExerciseLog,
  WorkoutSet,
  ExerciseItem
} from '../../types';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Info,
  Flame,
  Award,
  Dumbbell,
  Volume2,
  VolumeX,
  FastForward
} from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';

interface WorkoutPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: WorkoutRoutineTemplate | null;
}

export const WorkoutPlayerModal: React.FC<WorkoutPlayerModalProps> = ({
  isOpen,
  onClose,
  template
}) => {
  const { state, saveWorkoutSession, showToast } = useApp();

  // Active workout timer
  const [workoutSeconds, setWorkoutSeconds] = useState(0);
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(false);

  // Exercise log array for this live session
  const [exerciseLogs, setExerciseLogs] = useState<WorkoutExerciseLog[]>([]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  // Rest Timer state
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [restTimerTarget, setRestTimerTarget] = useState<number>(60);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [autoRestEnabled, setAutoRestEnabled] = useState(true);

  // UI state
  const [showFormCues, setShowFormCues] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [overallNotes, setOverallNotes] = useState('');
  const [overallRpe, setOverallRpe] = useState<number>(7.5);
  const [isFinishing, setIsFinishing] = useState(false);

  // Sound cue muted toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize session from template
  useEffect(() => {
    if (!isOpen) return;

    setWorkoutSeconds(0);
    setIsWorkoutPaused(false);
    setActiveExerciseIndex(0);
    setRestSecondsRemaining(null);
    setIsRestTimerActive(false);
    setIsFinishing(false);

    if (template && template.exercises.length > 0) {
      const logs: WorkoutExerciseLog[] = template.exercises.map(te => {
        const exItem = state.exerciseLibrary.find(e => e.id === te.exerciseId);
        const sets: WorkoutSet[] = Array.from({ length: te.sets }).map((_, i) => ({
          setNumber: i + 1,
          reps: te.targetReps,
          weightKg: te.targetWeightKg || 0,
          isCompleted: false,
          rpe: 7
        }));

        return {
          exerciseId: te.exerciseId,
          exerciseName: exItem?.name || 'Exercise',
          pattern: exItem?.pattern || 'push',
          icon: exItem?.icon || '💪',
          sets,
          notes: te.notes || ''
        };
      });
      setExerciseLogs(logs);
    } else {
      // Default blank workout with Push-ups
      const defaultEx = state.exerciseLibrary[0] || {
        id: 'ex_pushup',
        name: 'Standard Push-Up',
        pattern: 'push',
        icon: '💪',
        defaultSets: 3,
        defaultReps: 15,
        defaultRestSeconds: 60
      };
      setExerciseLogs([
        {
          exerciseId: defaultEx.id,
          exerciseName: defaultEx.name,
          pattern: defaultEx.pattern,
          icon: defaultEx.icon,
          sets: [
            { setNumber: 1, reps: defaultEx.defaultReps, weightKg: 0, isCompleted: false, rpe: 7 },
            { setNumber: 2, reps: defaultEx.defaultReps, weightKg: 0, isCompleted: false, rpe: 7.5 },
            { setNumber: 3, reps: defaultEx.defaultReps, weightKg: 0, isCompleted: false, rpe: 8 }
          ],
          notes: ''
        }
      ]);
    }
  }, [isOpen, template]);

  // Workout duration ticker
  useEffect(() => {
    if (!isOpen || isWorkoutPaused || isFinishing) return;
    const interval = setInterval(() => {
      setWorkoutSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isWorkoutPaused, isFinishing]);

  // Rest countdown ticker
  useEffect(() => {
    if (!isRestTimerActive || restSecondsRemaining === null) return;
    if (restSecondsRemaining <= 0) {
      if (soundEnabled) {
        soundManager.playChime('timer');
      }
      setIsRestTimerActive(false);
      setRestSecondsRemaining(0);
      showToast('⏰ Rest period complete! Get ready for next set.');
      return;
    }

    const interval = setInterval(() => {
      setRestSecondsRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRestTimerActive, restSecondsRemaining, soundEnabled]);

  if (!isOpen) return null;

  const activeLog = exerciseLogs[activeExerciseIndex];
  const activeExMeta = state.exerciseLibrary.find(e => e.id === activeLog?.exerciseId);

  // Timer formatted strings
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartRest = (seconds: number) => {
    setRestTimerTarget(seconds);
    setRestSecondsRemaining(seconds);
    setIsRestTimerActive(true);
  };

  const handleAdjustRest = (delta: number) => {
    setRestSecondsRemaining(prev => {
      if (prev === null) return Math.max(15, delta);
      return Math.max(0, prev + delta);
    });
  };

  const handleToggleSetComplete = (setIdx: number) => {
    if (!activeLog) return;
    soundManager.playChime('click');

    const updatedLogs = [...exerciseLogs];
    const currentSet = updatedLogs[activeExerciseIndex].sets[setIdx];
    const willBeComplete = !currentSet.isCompleted;

    updatedLogs[activeExerciseIndex].sets[setIdx] = {
      ...currentSet,
      isCompleted: willBeComplete,
      completedAt: willBeComplete ? Date.now() : undefined
    };

    setExerciseLogs(updatedLogs);

    // Auto-start rest timer if marked complete
    if (willBeComplete && autoRestEnabled) {
      const restDuration = activeExMeta?.defaultRestSeconds || 60;
      handleStartRest(restDuration);
    }
  };

  const handleUpdateSetReps = (setIdx: number, delta: number) => {
    if (!activeLog) return;
    const updatedLogs = [...exerciseLogs];
    const cur = updatedLogs[activeExerciseIndex].sets[setIdx];
    updatedLogs[activeExerciseIndex].sets[setIdx] = {
      ...cur,
      reps: Math.max(0, cur.reps + delta)
    };
    setExerciseLogs(updatedLogs);
  };

  const handleUpdateSetWeight = (setIdx: number, delta: number) => {
    if (!activeLog) return;
    const updatedLogs = [...exerciseLogs];
    const cur = updatedLogs[activeExerciseIndex].sets[setIdx];
    updatedLogs[activeExerciseIndex].sets[setIdx] = {
      ...cur,
      weightKg: Math.max(0, Math.round((cur.weightKg + delta) * 10) / 10)
    };
    setExerciseLogs(updatedLogs);
  };

  const handleUpdateSetRpe = (setIdx: number, rpe: number) => {
    if (!activeLog) return;
    const updatedLogs = [...exerciseLogs];
    updatedLogs[activeExerciseIndex].sets[setIdx] = {
      ...updatedLogs[activeExerciseIndex].sets[setIdx],
      rpe
    };
    setExerciseLogs(updatedLogs);
  };

  const handleAddSet = () => {
    if (!activeLog) return;
    const updatedLogs = [...exerciseLogs];
    const lastSet = activeLog.sets[activeLog.sets.length - 1];
    const newSetNumber = activeLog.sets.length + 1;
    updatedLogs[activeExerciseIndex].sets.push({
      setNumber: newSetNumber,
      reps: lastSet ? lastSet.reps : 10,
      weightKg: lastSet ? lastSet.weightKg : 0,
      isCompleted: false,
      rpe: lastSet ? lastSet.rpe : 7
    });
    setExerciseLogs(updatedLogs);
  };

  const handleRemoveSet = (setIdx: number) => {
    if (!activeLog || activeLog.sets.length <= 1) return;
    const updatedLogs = [...exerciseLogs];
    updatedLogs[activeExerciseIndex].sets = updatedLogs[activeExerciseIndex].sets
      .filter((_, i) => i !== setIdx)
      .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    setExerciseLogs(updatedLogs);
  };

  const handleAddExerciseToWorkout = (ex: ExerciseItem) => {
    soundManager.playChime('click');
    const newLog: WorkoutExerciseLog = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      pattern: ex.pattern,
      icon: ex.icon,
      sets: Array.from({ length: ex.defaultSets }).map((_, i) => ({
        setNumber: i + 1,
        reps: ex.defaultReps,
        weightKg: 0,
        isCompleted: false,
        rpe: 7
      })),
      notes: ''
    };
    setExerciseLogs([...exerciseLogs, newLog]);
    setActiveExerciseIndex(exerciseLogs.length);
    setIsAddExerciseOpen(false);
  };

  const handleSkipExercise = () => {
    if (activeExerciseIndex < exerciseLogs.length - 1) {
      setActiveExerciseIndex(activeExerciseIndex + 1);
    }
  };

  // Completion calculation
  const totalCompletedSets = exerciseLogs.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.isCompleted).length,
    0
  );
  const totalSets = exerciseLogs.reduce((sum, ex) => sum + ex.sets.length, 0);

  const totalVolumeReps = exerciseLogs.reduce(
    (sum, ex) =>
      sum + ex.sets.filter(s => s.isCompleted).reduce((sSum, s) => sSum + s.reps, 0),
    0
  );

  const totalVolumeKg = exerciseLogs.reduce(
    (sum, ex) =>
      sum + ex.sets.filter(s => s.isCompleted).reduce((sSum, s) => sSum + s.reps * (s.weightKg || 0), 0),
    0
  );

  const handleFinishWorkout = () => {
    const elapsedMinutes = Math.max(1, Math.round(workoutSeconds / 60));
    saveWorkoutSession({
      routineName: template?.name || 'Physical Training Session',
      routineId: template?.id || null,
      durationMinutes: elapsedMinutes,
      exercises: exerciseLogs,
      overallRpe,
      notes: overallNotes.trim()
    });
    onClose();
  };

  const rpeLabels: Record<number, { text: string; color: string }> = {
    5: { text: 'Warmup / Easy', color: 'text-blue-400' },
    6: { text: 'Moderate / 4 RIR', color: 'text-emerald-400' },
    7: { text: 'Working / 3 RIR', color: 'text-emerald-400' },
    8: { text: 'Hard / 2 RIR', color: 'text-yellow-400' },
    8.5: { text: 'Very Hard / 1.5 RIR', color: 'text-amber-400' },
    9: { text: 'Heavy / 1 RIR', color: 'text-orange-400' },
    9.5: { text: 'Limit / 0.5 RIR', color: 'text-rose-400' },
    10: { text: 'Max Effort / 0 RIR', color: 'text-red-500 font-black' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl p-4 sm:p-6 text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E] max-h-[95vh] flex flex-col">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">{template?.icon || activeLog?.icon || '💪'}</span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black truncate tracking-tight">
                {template?.name || 'Workout Session'}
              </h3>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[#859A90] font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#3D7D62]" />
                  {formatTime(workoutSeconds)}
                </span>
                <span>•</span>
                <span>
                  Sets: {totalCompletedSets}/{totalSets}
                </span>
                <span>•</span>
                <span>Vol: {totalVolumeReps} reps</span>
              </div>
            </div>
          </div>

          {/* Quick Player Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setIsWorkoutPaused(!isWorkoutPaused)}
              className="p-1.5 rounded-xl bg-[#242D29] hover:bg-[#384A41]/40 text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F2F1EC]"
              title={isWorkoutPaused ? 'Resume Session' : 'Pause Session'}
            >
              {isWorkoutPaused ? <Play className="w-4 h-4 text-[#68D391]" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl bg-[#242D29] hover:bg-[#384A41]/40 text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F2F1EC]"
              title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#3D7D62]" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsFinishing(true)}
              className="px-3 py-1.5 rounded-xl bg-[#3D7D62] text-white text-xs font-black shadow-xs hover:bg-[#326750] flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Finish</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] light:hover:bg-[#F2F1EC]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* REST TIMER BANNER (Active Countdown) */}
        {restSecondsRemaining !== null && (
          <div className="mt-3 p-3 rounded-2xl bg-[#242D29] border border-[#3D7D62]/60 flex items-center justify-between gap-3 shadow-md light:bg-[#F7F6F2] light:border-[#3D7D62]/40">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <span className="text-xl">⏱️</span>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#68D391] tracking-wider">
                  Rest Interval
                </div>
                <div className="text-lg font-black font-mono tabular-nums text-[#F4F7F4] light:text-[#1C221E]">
                  {formatTime(restSecondsRemaining)}
                </div>
              </div>
            </div>

            {/* Quick Rest Adjustments */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => handleAdjustRest(-15)}
                className="px-2 py-1 rounded-lg bg-[#1B211E] text-[11px] font-bold text-[#859A90] hover:text-[#F4F7F4] border border-[#384A41]/40 light:bg-white light:border-[#E5E3DA]"
              >
                -15s
              </button>
              <button
                onClick={() => handleAdjustRest(30)}
                className="px-2 py-1 rounded-lg bg-[#1B211E] text-[11px] font-bold text-[#859A90] hover:text-[#F4F7F4] border border-[#384A41]/40 light:bg-white light:border-[#E5E3DA]"
              >
                +30s
              </button>
              <button
                onClick={() => {
                  setIsRestTimerActive(!isRestTimerActive);
                }}
                className="p-1.5 rounded-lg bg-[#1B211E] text-[#859A90] hover:text-[#F4F7F4] border border-[#384A41]/40 light:bg-white light:border-[#E5E3DA]"
              >
                {isRestTimerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setIsRestTimerActive(false);
                  setRestSecondsRemaining(null);
                }}
                className="px-2 py-1 rounded-lg bg-[#3D7D62]/20 text-[#68D391] text-[11px] font-bold hover:bg-[#3D7D62]/30"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Exercise Sequence Stepper */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
          {exerciseLogs.map((log, idx) => {
            const isCompleted = log.sets.every(s => s.isCompleted);
            const isActive = idx === activeExerciseIndex;
            return (
              <button
                key={idx}
                onClick={() => {
                  soundManager.playChime('click');
                  setActiveExerciseIndex(idx);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#3D7D62] text-white shadow-xs'
                    : isCompleted
                    ? 'bg-[#242D29] text-[#68D391] border border-[#384A41] light:bg-[#F2F1EC]'
                    : 'bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] border border-[#384A41]/30 light:bg-[#F7F6F2]'
                }`}
              >
                <span>{log.icon}</span>
                <span className="max-w-[120px] truncate">{log.exerciseName}</span>
                {isCompleted && <CheckCircle2 className="w-3 h-3 text-[#68D391]" />}
              </button>
            );
          })}

          <button
            onClick={() => setIsAddExerciseOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] text-xs font-bold border border-dashed border-[#384A41] flex items-center gap-1 shrink-0 light:bg-[#F2F1EC]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* ACTIVE EXERCISE MAIN CARD */}
        {activeLog ? (
          <div className="overflow-y-auto flex-1 space-y-3 pr-1">
            {/* Exercise Header */}
            <div className="p-3.5 rounded-2xl bg-[#242D29] border border-[#384A41] flex flex-col gap-2.5 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{activeLog.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E]">
                        {activeLog.exerciseName}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#1B211E] text-[#859A90] uppercase light:bg-white light:border-[#E5E3DA]">
                        {activeLog.pattern}
                      </span>
                    </div>
                    <div className="text-xs text-[#859A90] flex items-center gap-2 mt-0.5">
                      <span>{activeExMeta?.primaryMuscle}</span>
                      <span>•</span>
                      <span>{activeExMeta?.equipment}</span>
                      {activeExMeta?.personalBest?.maxReps && (
                        <>
                          <span>•</span>
                          <span className="text-[#E5A93C] font-bold flex items-center gap-0.5">
                            <Flame className="w-3 h-3" /> PR: {activeExMeta.personalBest.maxReps} reps
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form tips toggle */}
                {activeExMeta?.formCues && activeExMeta.formCues.length > 0 && (
                  <button
                    onClick={() => setShowFormCues(!showFormCues)}
                    className="px-2 py-1 rounded-lg bg-[#1B211E] hover:bg-[#384A41]/40 text-[#859A90] hover:text-[#68D391] text-[11px] font-bold flex items-center gap-1 border border-[#384A41]/40 light:bg-white light:border-[#E5E3DA]"
                  >
                    <Info className="w-3 h-3 text-[#3D7D62]" />
                    <span>Cues</span>
                    {showFormCues ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* Form Cues Expandable Tray */}
              {showFormCues && activeExMeta?.formCues && (
                <div className="p-2.5 rounded-xl bg-[#1B211E] border border-[#384A41]/40 space-y-1 light:bg-white light:border-[#E5E3DA]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#3D7D62]">
                    Biomechanics & Execution Tips
                  </div>
                  <ul className="text-xs text-[#859A90] space-y-1 list-disc list-inside">
                    {activeExMeta.formCues.map((cue, i) => (
                      <li key={i} className="text-[#F4F7F4]/90 light:text-[#2C332E]">
                        {cue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* SETS LOGGING TABLE */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1 px-3 text-[10px] font-bold uppercase text-[#859A90] tracking-wider">
                <span className="col-span-2 text-center">Set</span>
                <span className="col-span-4 text-center">Reps</span>
                <span className="col-span-3 text-center">Weight (kg)</span>
                <span className="col-span-3 text-center">Log Set</span>
              </div>

              {activeLog.sets.map((set, sIdx) => {
                return (
                  <div
                    key={sIdx}
                    className={`p-2.5 rounded-2xl border transition-all flex flex-col gap-2 ${
                      set.isCompleted
                        ? 'bg-[#242D29] border-[#3D7D62] light:bg-[#F2F6F3] light:border-[#3D7D62]'
                        : 'bg-[#1B211E] border-[#384A41] light:bg-white light:border-[#E5E3DA]'
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-1 items-center">
                      {/* Set Number */}
                      <div className="col-span-2 text-center font-mono font-black text-sm">
                        <span
                          className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                            set.isCompleted
                              ? 'bg-[#3D7D62] text-white'
                              : 'bg-[#242D29] text-[#859A90] light:bg-[#EAE8E0]'
                          }`}
                        >
                          {set.setNumber}
                        </span>
                      </div>

                      {/* Reps with - and + */}
                      <div className="col-span-4 flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateSetReps(sIdx, -1)}
                          className="w-7 h-8 rounded-lg bg-[#242D29] hover:bg-[#384A41]/50 text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center light:bg-[#EAE8E0]"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={set.reps}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            const updatedLogs = [...exerciseLogs];
                            updatedLogs[activeExerciseIndex].sets[sIdx].reps = val;
                            setExerciseLogs(updatedLogs);
                          }}
                          className="w-12 h-8 rounded-lg bg-[#242D29] text-center font-mono font-bold text-sm text-[#F4F7F4] outline-hidden border border-[#384A41]/40 light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateSetReps(sIdx, 1)}
                          className="w-7 h-8 rounded-lg bg-[#242D29] hover:bg-[#384A41]/50 text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center light:bg-[#EAE8E0]"
                        >
                          +
                        </button>
                      </div>

                      {/* Weight with - and + */}
                      <div className="col-span-3 flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateSetWeight(sIdx, -2.5)}
                          className="w-6 h-8 rounded-lg bg-[#242D29] hover:bg-[#384A41]/50 text-[11px] font-bold text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center light:bg-[#EAE8E0]"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          step={0.5}
                          min={0}
                          value={set.weightKg}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            const updatedLogs = [...exerciseLogs];
                            updatedLogs[activeExerciseIndex].sets[sIdx].weightKg = val;
                            setExerciseLogs(updatedLogs);
                          }}
                          className="w-12 h-8 rounded-lg bg-[#242D29] text-center font-mono font-bold text-xs text-[#F4F7F4] outline-hidden border border-[#384A41]/40 light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateSetWeight(sIdx, 2.5)}
                          className="w-6 h-8 rounded-lg bg-[#242D29] hover:bg-[#384A41]/50 text-[11px] font-bold text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center light:bg-[#EAE8E0]"
                        >
                          +
                        </button>
                      </div>

                      {/* Completion Checkmark */}
                      <div className="col-span-3 flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleSetComplete(sIdx)}
                          className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                            set.isCompleted
                              ? 'bg-[#3D7D62] text-white shadow-xs'
                              : 'bg-[#242D29] hover:bg-[#384A41]/40 text-[#859A90] hover:text-[#68D391] border border-[#384A41]/50 light:bg-[#EAE8E0]'
                          }`}
                        >
                          {set.isCompleted ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Done</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-4 h-4" />
                              <span>Log</span>
                            </>
                          )}
                        </button>
                        {activeLog.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSet(sIdx)}
                            className="p-1 text-[#859A90] hover:text-[#EF4444]"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Set RPE Picker (Rating of Perceived Exertion) */}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#384A41]/30">
                      <span className="text-[#859A90]">RPE Intensity:</span>
                      <div className="flex items-center gap-1">
                        {[6, 7, 8, 9, 10].map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => handleUpdateSetRpe(sIdx, r)}
                            className={`w-6 h-5 rounded text-[10px] font-bold font-mono transition-all ${
                              set.rpe === r
                                ? 'bg-[#3D7D62] text-white'
                                : 'bg-[#1B211E] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#EAE8E0]'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                        <span className={`text-[10px] ml-1 font-bold ${rpeLabels[set.rpe || 7]?.color || ''}`}>
                          {rpeLabels[set.rpe || 7]?.text}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Set Actions & Navigation */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleAddSet}
                className="px-3 py-2 rounded-xl bg-[#242D29] hover:bg-[#384A41]/40 border border-[#384A41] text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] flex items-center gap-1.5 light:bg-[#F2F1EC]"
              >
                <Plus className="w-3.5 h-3.5 text-[#3D7D62]" />
                <span>Add Set</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeExerciseIndex === 0}
                  onClick={() => setActiveExerciseIndex(activeExerciseIndex - 1)}
                  className="px-3 py-2 rounded-xl bg-[#242D29] hover:bg-[#384A41]/40 border border-[#384A41] text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] disabled:opacity-30 flex items-center gap-1 light:bg-[#F2F1EC]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  disabled={activeExerciseIndex === exerciseLogs.length - 1}
                  onClick={() => setActiveExerciseIndex(activeExerciseIndex + 1)}
                  className="px-4 py-2 rounded-xl bg-[#3D7D62] hover:bg-[#326750] text-xs font-black text-white disabled:opacity-30 flex items-center gap-1 shadow-xs"
                >
                  <span>Next Exercise</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* FINISH WORKOUT CONFIRMATION MODAL */}
        {isFinishing && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="w-full max-w-md rounded-3xl bg-[#1B211E] border border-[#384A41] p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]">
              <div className="text-center space-y-1">
                <span className="text-4xl">🏆</span>
                <h4 className="text-base font-black">Complete Workout Session</h4>
                <p className="text-xs text-[#859A90] light:text-[#5C655E]">
                  Review your training metrics and log to Unified Activity Log.
                </p>
              </div>

              {/* Stats Recap */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/60 text-center light:bg-[#F7F6F2] light:border-[#E5E3DA]">
                <div>
                  <div className="text-[10px] text-[#859A90] uppercase font-bold">Duration</div>
                  <div className="text-sm font-black font-mono mt-0.5">
                    {Math.max(1, Math.round(workoutSeconds / 60))}m
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#859A90] uppercase font-bold">Total Reps</div>
                  <div className="text-sm font-black font-mono text-[#68D391] mt-0.5">
                    {totalVolumeReps}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#859A90] uppercase font-bold">Sets Done</div>
                  <div className="text-sm font-black font-mono text-[#E5A93C] mt-0.5">
                    {totalCompletedSets}/{totalSets}
                  </div>
                </div>
              </div>

              {/* Overall RPE Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#859A90]">Session RPE (Exertion 1-10):</span>
                  <span className="font-mono font-black text-[#68D391]">{overallRpe} / 10</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[6, 7, 8, 9, 10].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setOverallRpe(r)}
                      className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                        overallRpe === r
                          ? 'bg-[#3D7D62] text-white'
                          : 'bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#EAE8E0]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workout Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#859A90]">Workout Notes & Mindset</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Great chest pump, unbroken push-up set, feeling energized."
                  value={overallNotes}
                  onChange={e => setOverallNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90]/60 outline-hidden focus:border-[#3D7D62] resize-none light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#384A41]/50">
                <button
                  type="button"
                  onClick={() => setIsFinishing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#859A90] hover:bg-[#242D29]"
                >
                  Keep Training
                </button>
                <button
                  type="button"
                  onClick={handleFinishWorkout}
                  className="px-5 py-2.5 rounded-xl bg-[#3D7D62] hover:bg-[#326750] text-white text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Log Session</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD EXERCISE SELECTOR DRAWER */}
        {isAddExerciseOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="w-full max-w-md max-h-[85vh] rounded-3xl bg-[#1B211E] border border-[#384A41] p-5 flex flex-col shadow-2xl light:bg-white light:border-[#E5E3DA]">
              <div className="flex items-center justify-between pb-3 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
                <h4 className="text-sm font-bold">Add Exercise to Active Workout</h4>
                <button
                  type="button"
                  onClick={() => setIsAddExerciseOpen(false)}
                  className="p-1 text-[#859A90] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="py-3">
                <input
                  type="text"
                  placeholder="Search exercise..."
                  value={addSearch}
                  onChange={e => setAddSearch(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90]/60 outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
                />
              </div>

              {/* Exercise List */}
              <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 max-h-[50vh]">
                {state.exerciseLibrary
                  .filter(ex =>
                    addSearch.trim()
                      ? ex.name.toLowerCase().includes(addSearch.toLowerCase()) ||
                        ex.primaryMuscle.toLowerCase().includes(addSearch.toLowerCase())
                      : true
                  )
                  .map(ex => (
                    <button
                      type="button"
                      key={ex.id}
                      onClick={() => handleAddExerciseToWorkout(ex)}
                      className="w-full p-2.5 rounded-xl bg-[#242D29] hover:bg-[#384A41]/40 border border-[#384A41]/40 flex items-center justify-between text-left transition-all light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{ex.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
                            {ex.name}
                          </div>
                          <span className="text-[10px] text-[#859A90]">
                            {ex.primaryMuscle} • {ex.equipment}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-[#3D7D62] font-bold">+ Add</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
