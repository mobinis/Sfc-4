import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  WorkoutRoutineTemplate,
  WorkoutRoutineExercise,
  ExerciseMovementPattern,
  ExerciseItem
} from '../../types';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Dumbbell, Sparkles, Clock, Target } from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';

interface WorkoutTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: WorkoutRoutineTemplate | null;
}

export const WorkoutTemplateModal: React.FC<WorkoutTemplateModalProps> = ({
  isOpen,
  onClose,
  initialTemplate
}) => {
  const { state, addWorkoutTemplate } = useApp();

  const [name, setName] = useState(initialTemplate?.name || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [icon, setIcon] = useState(initialTemplate?.icon || '💪');
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialTemplate?.estimatedMinutes || 25);
  const [selectedPatterns, setSelectedPatterns] = useState<ExerciseMovementPattern[]>(
    initialTemplate?.movementPatterns || ['push']
  );
  const [warmupNotes, setWarmupNotes] = useState(initialTemplate?.warmupNotes || '');
  const [cooldownNotes, setCooldownNotes] = useState(initialTemplate?.cooldownNotes || '');
  const [linkedTargetId, setLinkedTargetId] = useState(initialTemplate?.linkedTargetId || '');

  // Exercises sequence in this template
  const [exercises, setExercises] = useState<WorkoutRoutineExercise[]>(
    initialTemplate?.exercises || [
      { exerciseId: 'ex_pushup', sets: 3, targetReps: 15, restSeconds: 60, notes: '' }
    ]
  );

  // Exercise picker state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerPattern, setPickerPattern] = useState<string>('all');

  if (!isOpen) return null;

  const togglePattern = (p: ExerciseMovementPattern) => {
    if (selectedPatterns.includes(p)) {
      if (selectedPatterns.length > 1) {
        setSelectedPatterns(selectedPatterns.filter(item => item !== p));
      }
    } else {
      setSelectedPatterns([...selectedPatterns, p]);
    }
  };

  const handleAddExerciseFromPicker = (ex: ExerciseItem) => {
    soundManager.playChime('click');
    setExercises([
      ...exercises,
      {
        exerciseId: ex.id,
        sets: ex.defaultSets,
        targetReps: ex.defaultReps,
        restSeconds: ex.defaultRestSeconds,
        notes: ''
      }
    ]);
    setIsPickerOpen(false);
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleMoveExercise = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= exercises.length) return;
    const updated = [...exercises];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setExercises(updated);
  };

  const handleUpdateExercise = (idx: number, updates: Partial<WorkoutRoutineExercise>) => {
    const updated = [...exercises];
    updated[idx] = { ...updated[idx], ...updates };
    setExercises(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || exercises.length === 0) return;

    soundManager.playChime('success');
    addWorkoutTemplate({
      name: name.trim(),
      description: description.trim(),
      icon: icon || '💪',
      movementPatterns: selectedPatterns,
      estimatedMinutes: Math.max(5, estimatedMinutes),
      exercises,
      linkedSkillId: 'body',
      linkedTargetId: linkedTargetId || null,
      warmupNotes: warmupNotes.trim(),
      cooldownNotes: cooldownNotes.trim()
    });
    onClose();
  };

  const allPatterns: { id: ExerciseMovementPattern; label: string; icon: string }[] = [
    { id: 'push', label: 'Push', icon: '💪' },
    { id: 'pull', label: 'Pull', icon: '🧗' },
    { id: 'legs', label: 'Legs', icon: '🦵' },
    { id: 'core', label: 'Core', icon: '🛡️' },
    { id: 'cardio', label: 'Cardio', icon: '🔥' },
    { id: 'mobility', label: 'Mobility', icon: '🧘' }
  ];

  const commonIcons = ['💪', '🧗', '🦵', '🛡️', '⚡', '🔥', '🧘', '🏆', '🎯', '🏃'];

  // Filter exercises for picker
  const filteredLibrary = state.exerciseLibrary.filter(ex => {
    if (pickerPattern !== 'all' && ex.pattern !== pickerPattern) return false;
    if (pickerSearch.trim()) {
      const q = pickerSearch.toLowerCase();
      return ex.name.toLowerCase().includes(q) || ex.primaryMuscle.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl p-5 sm:p-6 text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <h3 className="text-base font-black tracking-tight">
                {initialTemplate ? 'Edit Workout Routine' : 'Create Workout Routine'}
              </h3>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Define exercises, sets, rest intervals, and linked targets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] light:hover:bg-[#F2F1EC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* Routine Name & Icon */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Routine Title *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="w-12 h-11 text-center text-xl rounded-xl bg-[#242D29] border border-[#384A41] focus:border-[#3D7D62] outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                maxLength={2}
              />
              <input
                type="text"
                placeholder="e.g. Upper Body Hypertrophy & Core"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="flex-1 h-11 px-3.5 rounded-xl bg-[#242D29] border border-[#384A41] text-sm text-[#F4F7F4] placeholder-[#859A90]/60 focus:border-[#3D7D62] outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>
            {/* Quick Icon Selector */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
              {commonIcons.map(ic => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'bg-[#3D7D62] text-white scale-110 shadow-xs'
                      : 'bg-[#242D29] hover:bg-[#384A41]/40 light:bg-[#EAE8E0]'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Description & Objective
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Focused on compound pushing volume and shoulder posture alignment."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90]/60 focus:border-[#3D7D62] outline-hidden resize-none light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          {/* Movement Patterns & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Movement Patterns
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allPatterns.map(p => {
                  const isSelected = selectedPatterns.includes(p.id);
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => togglePattern(p.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-[#3D7D62] text-white shadow-xs'
                          : 'bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] border border-[#384A41]/40 light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Estimated Duration (Minutes)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={180}
                  step={5}
                  value={estimatedMinutes}
                  onChange={e => setEstimatedMinutes(parseInt(e.target.value) || 20)}
                  className="w-24 h-10 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-center font-mono font-bold text-sm text-[#F4F7F4] focus:border-[#3D7D62] outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
                />
                <span className="text-xs text-[#859A90]">mins total session</span>
              </div>
            </div>
          </div>

          {/* Linked Measurable Target */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Link to Measurable Target (Auto-Accumulates Progress)
            </label>
            <select
              value={linkedTargetId}
              onChange={e => setLinkedTargetId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:border-[#3D7D62] outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <option value="">None (Stand-alone workout)</option>
              {state.measurableTargets
                .filter(t => t.category === 'fitness' || t.status === 'active')
                .map(t => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.title} ({t.currentProgress}/{t.targetValue} {t.unit})
                  </option>
                ))}
            </select>
          </div>

          {/* Exercise Sequence Builder */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-[#3D7D62]" />
                <label className="text-xs font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                  Exercise Sequence ({exercises.length})
                </label>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#3D7D62]/20 text-[#68D391] hover:bg-[#3D7D62]/30 text-xs font-bold flex items-center gap-1 border border-[#3D7D62]/40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Exercise</span>
              </button>
            </div>

            {/* Exercise List */}
            {exercises.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#242D29]/50 border border-dashed border-[#384A41] text-center text-xs text-[#859A90]">
                No exercises added yet. Tap "+ Add Exercise" to choose from the library.
              </div>
            ) : (
              <div className="space-y-2">
                {exercises.map((item, idx) => {
                  const ex = state.exerciseLibrary.find(e => e.id === item.exerciseId);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/70 flex flex-col gap-2 light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-[#1B211E] text-[10px] font-bold flex items-center justify-center text-[#859A90] light:bg-[#EAE8E0]">
                            {idx + 1}
                          </span>
                          <span className="text-base">{ex?.icon || '💪'}</span>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E] truncate">
                              {ex?.name || item.exerciseId}
                            </h5>
                            <span className="text-[10px] text-[#859A90]">{ex?.primaryMuscle}</span>
                          </div>
                        </div>

                        {/* Reorder and Delete Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveExercise(idx, 'up')}
                            className="p-1 text-[#859A90] hover:text-[#F4F7F4] disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === exercises.length - 1}
                            onClick={() => handleMoveExercise(idx, 'down')}
                            className="p-1 text-[#859A90] hover:text-[#F4F7F4] disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(idx)}
                            className="p-1 text-[#859A90] hover:text-[#EF4444]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Sets, Reps, Rest Config */}
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#384A41]/30">
                        <div>
                          <span className="text-[10px] text-[#859A90]">Sets</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={item.sets}
                            onChange={e =>
                              handleUpdateExercise(idx, { sets: parseInt(e.target.value) || 1 })
                            }
                            className="w-full h-8 px-2 rounded-lg bg-[#1B211E] border border-[#384A41]/60 text-center font-mono text-xs font-bold text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-[#859A90]">Target Reps</span>
                          <input
                            type="number"
                            min={1}
                            max={200}
                            value={item.targetReps}
                            onChange={e =>
                              handleUpdateExercise(idx, { targetReps: parseInt(e.target.value) || 1 })
                            }
                            className="w-full h-8 px-2 rounded-lg bg-[#1B211E] border border-[#384A41]/60 text-center font-mono text-xs font-bold text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-[#859A90]">Rest (sec)</span>
                          <input
                            type="number"
                            min={15}
                            step={15}
                            max={300}
                            value={item.restSeconds}
                            onChange={e =>
                              handleUpdateExercise(idx, { restSeconds: parseInt(e.target.value) || 60 })
                            }
                            className="w-full h-8 px-2 rounded-lg bg-[#1B211E] border border-[#384A41]/60 text-center font-mono text-xs font-bold text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Warmup & Cooldown Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Warm-up Recommendations
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 2m wrist rolls, scapular pull-ups, arm circles"
                value={warmupNotes}
                onChange={e => setWarmupNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90]/60 focus:border-[#3D7D62] outline-hidden resize-none light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Cool-down & Stretches
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Overhead triceps stretch & child's pose"
                value={cooldownNotes}
                onChange={e => setCooldownNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90]/60 focus:border-[#3D7D62] outline-hidden resize-none light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-[#384A41]/60 flex items-center justify-end gap-2 light:border-[#E5E3DA]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#859A90] hover:bg-[#242D29] light:hover:bg-[#F2F1EC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={exercises.length === 0}
              className="px-5 py-2.5 rounded-xl bg-[#3D7D62] text-white text-xs font-black hover:bg-[#326750] disabled:opacity-50 shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save Routine</span>
            </button>
          </div>
        </form>

        {/* Nested Exercise Selector Drawer */}
        {isPickerOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="w-full max-w-md max-h-[85vh] rounded-3xl bg-[#1B211E] border border-[#384A41] p-5 flex flex-col shadow-2xl light:bg-white light:border-[#E5E3DA]">
              <div className="flex items-center justify-between pb-3 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
                <h4 className="text-sm font-bold">Select Exercise</h4>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="p-1 text-[#859A90] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search & Pattern filter */}
              <div className="py-3 space-y-2">
                <input
                  type="text"
                  placeholder="Search exercise..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90]/60 outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
                />
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {['all', 'push', 'pull', 'legs', 'core', 'cardio', 'mobility'].map(p => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPickerPattern(p)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize shrink-0 ${
                        pickerPattern === p
                          ? 'bg-[#3D7D62] text-white'
                          : 'bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#EAE8E0]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise List */}
              <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 max-h-[50vh]">
                {filteredLibrary.map(ex => (
                  <button
                    type="button"
                    key={ex.id}
                    onClick={() => handleAddExerciseFromPicker(ex)}
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
                    <span className="text-xs text-[#3D7D62] font-bold">+ Select</span>
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
