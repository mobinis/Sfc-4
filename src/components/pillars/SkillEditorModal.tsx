import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Check, ArrowRight, Anchor, Star, Tag, Clock } from 'lucide-react';
import { NodeItem } from '../../types';
import { soundManager } from '../../utils/soundHaptics';

interface SkillEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillToEdit?: NodeItem | null;
  defaultParentId?: string;
}

const PRESET_SKILL_EMOJIS = [
  '🌱', '⭐', '⚡', '🔥', '🎯', '📖', '✍️', '💧',
  '🧘', '🏋️', '🏃', '🎨', '💻', '🎸', '🗣️', '🛡️',
  '🧩', '🌙', '☀️', '🍵', '🧹', '🚶', '🍎', '💤'
];

export const SkillEditorModal: React.FC<SkillEditorModalProps> = ({
  isOpen,
  onClose,
  skillToEdit,
  defaultParentId = 'learn'
}) => {
  const { addSkillNode, updateSkillNode, deleteSkillNode, moveSkillNode, state, showToast } = useApp();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌱');
  const [parentId, setParentId] = useState(defaultParentId);
  const [nature, setNature] = useState<'skill' | 'technique' | 'concept' | 'course' | 'habit'>('skill');
  const [importance, setImportance] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [kind, setKind] = useState<'check' | 'count' | 'step' | 'quit'>('check');
  const [goal, setGoal] = useState<number>(1);
  const [unit, setUnit] = useState<string>('');
  const [routineTime, setRoutineTime] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');
  const [anchor, setAnchor] = useState('');
  const [note, setNote] = useState('');

  // Pillars and available parent candidates
  const rootPillars = state.nodes.filter(n => n.p === '0');
  const potentialParentSkills = state.nodes.filter(n => n.p !== '0' && (!skillToEdit || n.id !== skillToEdit.id));

  useEffect(() => {
    if (skillToEdit) {
      setName(skillToEdit.n);
      setEmoji(skillToEdit.e || '🌱');
      setParentId(skillToEdit.p);
      setNature(skillToEdit.nature || 'skill');
      setImportance(skillToEdit.importance || 'medium');
      setKind(skillToEdit.k || 'check');
      setGoal(skillToEdit.g || 1);
      setUnit(skillToEdit.u || '');
      setRoutineTime(skillToEdit.routineTime || 'morning');
      setAnchor(skillToEdit.ifThenAnchor || '');
      setNote(skillToEdit.note || '');
    } else {
      setName('');
      setEmoji('🌱');
      setParentId(defaultParentId);
      setNature('skill');
      setImportance('medium');
      setKind('check');
      setGoal(1);
      setUnit('');
      setRoutineTime('morning');
      setAnchor('');
      setNote('');
    }
  }, [skillToEdit, defaultParentId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (skillToEdit) {
      const updates: Partial<NodeItem> = {
        n: name.trim(),
        e: emoji,
        p: parentId,
        nature,
        importance,
        k: kind,
        g: goal,
        u: unit.trim() || undefined,
        routineTime,
        ifThenAnchor: anchor.trim() || null,
        note: note.trim() || undefined
      };
      updateSkillNode(skillToEdit.id, updates);
      if (skillToEdit.p !== parentId) {
        moveSkillNode(skillToEdit.id, parentId);
      }
    } else {
      addSkillNode({
        p: parentId,
        e: emoji,
        n: name.trim(),
        k: kind,
        g: goal,
        u: unit.trim() || undefined,
        nature,
        importance,
        routineTime,
        ifThenAnchor: anchor.trim() || null,
        note: note.trim() || undefined
      });
      showToast(`Added '${name.trim()}' (+15 XP)`);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!skillToEdit) return;
    deleteSkillNode(skillToEdit.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl p-5 flex flex-col gap-4 text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {skillToEdit ? 'Edit Skill / Habit' : 'Add Skill or Habit'}
              </h2>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                {skillToEdit ? 'Adjust details, parents, or targets' : 'Create a root skill or nested technique'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playChime('click');
              onClose();
            }}
            className="p-1.5 rounded-xl bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:text-[#5C655E]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Skill Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E]">
              Skill Name <span className="text-[#E5A93C]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Daily Meditation, Deep Reading, Pushups..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          {/* Parent Pillar or Parent Skill Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E]">
              Parent Domain / Skill
            </label>
            <select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <optgroup label="🏛️ Life Pillars (Root Level)">
                {rootPillars.map(pillar => (
                  <option key={pillar.id} value={pillar.id}>
                    {pillar.e} {pillar.n} {pillar.isCustom ? '(Custom)' : ''}
                  </option>
                ))}
              </optgroup>
              {potentialParentSkills.length > 0 && (
                <optgroup label="🌱 Existing Skills (Nest as Sub-skill)">
                  {potentialParentSkills.map(s => (
                    <option key={s.id} value={s.id}>
                      ↳ {s.e} {s.n}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Emoji Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E]">
              Emoji Icon
            </label>
            <div className="grid grid-cols-8 gap-1.5 p-2 rounded-2xl bg-[#242D29] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
              {PRESET_SKILL_EMOJIS.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    soundManager.playChime('click');
                    setEmoji(item);
                  }}
                  className={`h-9 rounded-xl text-base flex items-center justify-center transition-all ${
                    emoji === item
                      ? 'bg-[#3D7D62] scale-110 shadow-xs'
                      : 'hover:bg-[#1B211E] light:hover:bg-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Nature & Importance (2 Columns) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E]">
                Item Nature
              </label>
              <select
                value={nature}
                onChange={e => setNature(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              >
                <option value="skill">Skill</option>
                <option value="technique">Technique</option>
                <option value="concept">Concept</option>
                <option value="course">Course</option>
                <option value="habit">Habit</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E]">
                Importance
              </label>
              <select
                value={importance}
                onChange={e => setImportance(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              >
                <option value="critical">Critical (⭐)</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Tracking Mode: Check vs Count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E]">
                Tracking Mode
              </label>
              <select
                value={kind}
                onChange={e => setKind(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              >
                <option value="check">Checkmark (1 tap)</option>
                <option value="count">Count Stepper (+/-)</option>
                <option value="step">Step Levels</option>
                <option value="quit">Quit / Avoid</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E]">
                Routine Window
              </label>
              <select
                value={routineTime}
                onChange={e => setRoutineTime(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              >
                <option value="morning">🌅 Morning</option>
                <option value="afternoon">☀️ Afternoon</option>
                <option value="evening">🌙 Evening</option>
                <option value="anytime">🔄 Flexible</option>
              </select>
            </div>
          </div>

          {kind === 'count' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#242D29]/70 border border-[#384A41]/60 light:bg-[#F7F6F2]">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#859A90]">Daily Target Count</label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={goal}
                  onChange={e => setGoal(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs font-bold text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#859A90]">Unit Label</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="e.g. glasses, reps, pages"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                />
              </div>
            </div>
          )}

          {/* Habit Anchor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E] flex items-center gap-1">
              <Anchor className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>Implementation Anchor (If-Then Trigger)</span>
            </label>
            <input
              type="text"
              value={anchor}
              onChange={e => setAnchor(e.target.value)}
              placeholder="e.g. Right after pouring morning tea..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E]">
              Personal Notes & Form Cues <span className="text-[10px] text-[#859A90]">(Optional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="Key cues, instructions, or reflections..."
              className="w-full px-3.5 py-2 rounded-2xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E] resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#384A41]/60 light:border-[#E5E3DA]">
            {skillToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl text-xs font-bold text-[#EA867A] hover:bg-[#B91C1C]/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#242D29] text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:text-[#5C655E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{skillToEdit ? 'Update Skill' : 'Create Skill'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
