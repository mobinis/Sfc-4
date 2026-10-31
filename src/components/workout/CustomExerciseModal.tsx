import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExerciseMovementPattern, ExerciseCategory } from '../../types';
import { X, Plus, Trash2, Dumbbell, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';

interface CustomExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomExerciseModal: React.FC<CustomExerciseModalProps> = ({ isOpen, onClose }) => {
  const { addCustomExercise } = useApp();

  const [name, setName] = useState('');
  const [pattern, setPattern] = useState<ExerciseMovementPattern>('push');
  const [category, setCategory] = useState<ExerciseCategory>('calisthenics');
  const [primaryMuscle, setPrimaryMuscle] = useState('');
  const [equipment, setEquipment] = useState('Bodyweight');
  const [icon, setIcon] = useState('💪');
  const [defaultSets, setDefaultSets] = useState(3);
  const [defaultReps, setDefaultReps] = useState(12);
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(60);
  const [formCues, setFormCues] = useState<string[]>(['']);

  if (!isOpen) return null;

  const handleAddCue = () => {
    setFormCues([...formCues, '']);
  };

  const handleUpdateCue = (idx: number, val: string) => {
    const updated = [...formCues];
    updated[idx] = val;
    setFormCues(updated);
  };

  const handleRemoveCue = (idx: number) => {
    setFormCues(formCues.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !primaryMuscle.trim()) return;

    soundManager.playChime('click');
    addCustomExercise({
      name: name.trim(),
      pattern,
      category,
      primaryMuscle: primaryMuscle.trim(),
      equipment: equipment.trim() || 'Bodyweight',
      icon: icon || '💪',
      formCues: formCues.filter(c => c.trim().length > 0),
      defaultSets: Math.max(1, defaultSets),
      defaultReps: Math.max(1, defaultReps),
      defaultRestSeconds: Math.max(15, defaultRestSeconds)
    });
    onClose();
  };

  const patternIcons: Record<ExerciseMovementPattern, string> = {
    push: '💪 Push',
    pull: '🧗 Pull',
    legs: '🦵 Legs',
    core: '🛡️ Core',
    cardio: '🔥 Cardio',
    mobility: '🧘 Mobility'
  };

  const commonIcons = ['💪', '🧗', '🦵', '🛡️', '⚡', '🔥', '🧘', '💎', '🚣', '🏋️', '🤸', '🎯'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl p-5 sm:p-6 text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="text-base font-black tracking-tight">Create Custom Exercise</h3>
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
          {/* Name & Icon */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Exercise Name *
            </label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  className="w-12 h-11 text-center text-xl rounded-xl bg-[#242D29] border border-[#384A41] focus:border-[#3D7D62] outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                  maxLength={2}
                />
              </div>
              <input
                type="text"
                placeholder="e.g. Ring Archer Push-Ups"
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

          {/* Movement Pattern */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Movement Pattern
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(patternIcons) as ExerciseMovementPattern[]).map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPattern(p)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                    pattern === p
                      ? 'bg-[#3D7D62] text-white shadow-xs'
                      : 'bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] border border-[#384A41]/40 light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                  }`}
                >
                  {patternIcons[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Muscle & Equipment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Primary Muscle *
              </label>
              <input
                type="text"
                placeholder="e.g. Chest, Lats, Quads"
                value={primaryMuscle}
                onChange={e => setPrimaryMuscle(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90]/60 focus:border-[#3D7D62] outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Equipment
              </label>
              <input
                type="text"
                placeholder="e.g. Bodyweight, Rings, Dumbbells"
                value={equipment}
                onChange={e => setEquipment(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90]/60 focus:border-[#3D7D62] outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>
          </div>

          {/* Defaults (Sets, Reps, Rest) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Default Sets
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={defaultSets}
                onChange={e => setDefaultSets(parseInt(e.target.value) || 1)}
                className="w-full h-10 px-2 rounded-xl bg-[#242D29] border border-[#384A41] text-center font-mono text-sm font-bold text-[#F4F7F4] focus:border-[#3D7D62] outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Target Reps / Sec
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={defaultReps}
                onChange={e => setDefaultReps(parseInt(e.target.value) || 1)}
                className="w-full h-10 px-2 rounded-xl bg-[#242D29] border border-[#384A41] text-center font-mono text-sm font-bold text-[#F4F7F4] focus:border-[#3D7D62] outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Rest (seconds)
              </label>
              <input
                type="number"
                min={15}
                step={15}
                max={300}
                value={defaultRestSeconds}
                onChange={e => setDefaultRestSeconds(parseInt(e.target.value) || 60)}
                className="w-full h-10 px-2 rounded-xl bg-[#242D29] border border-[#384A41] text-center font-mono text-sm font-bold text-[#F4F7F4] focus:border-[#3D7D62] outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>
          </div>

          {/* Form Cues */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Form Tips & Cues
              </label>
              <button
                type="button"
                onClick={handleAddCue}
                className="text-xs font-bold text-[#3D7D62] hover:text-[#68D391] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Cue</span>
              </button>
            </div>
            <div className="space-y-2">
              {formCues.map((cue, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#859A90] w-4">{idx + 1}.</span>
                  <input
                    type="text"
                    placeholder="e.g. Keep ribcage pinned down without hyperextending"
                    value={cue}
                    onChange={e => handleUpdateCue(idx, e.target.value)}
                    className="flex-1 h-9 px-3 rounded-lg bg-[#242D29] border border-[#384A41]/80 text-xs text-[#F4F7F4] placeholder-[#859A90]/60 focus:border-[#3D7D62] outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
                  />
                  {formCues.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCue(idx)}
                      className="p-1 text-[#859A90] hover:text-[#EF4444]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
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
              className="px-5 py-2.5 rounded-xl bg-[#3D7D62] text-white text-xs font-black hover:bg-[#326750] shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save Exercise</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
