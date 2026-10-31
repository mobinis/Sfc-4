import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NodeItem } from '../../types';
import {
  Check,
  Plus,
  Trash2,
  Edit2,
  X,
  Star,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Anchor,
  HelpCircle,
  Save
} from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';

interface EditDailyChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_PRESETS = [
  '💧', '🧘', '🏃', '🥦', '🦷', '🧼', '📖', '💻', '✍️', '🤲', '📿', '🌙',
  '📵', '🧠', '☕', '🍎', '🏋️', '🎯', '🌱', '☀️', '🚶', '🔋', '🛡️', '✨'
];

const PILLAR_OPTIONS = [
  { id: 'body', label: 'Body & Vitality', icon: '💪' },
  { id: 'learn', label: 'Learn & Wisdom', icon: '🧠' },
  { id: 'build', label: 'Build & Deep Work', icon: '🛠️' },
  { id: 'mind', label: 'Mind & Mindfulness', icon: '🧘' },
  { id: 'care', label: 'Self-Care & Hygiene', icon: '🧼' },
  { id: 'faith', label: 'Faith & Soul', icon: '🤲' }
];

export const EditDailyChecklistModal: React.FC<EditDailyChecklistModalProps> = ({ isOpen, onClose }) => {
  const {
    state,
    addSkillNode,
    updateSkillNode,
    deleteSkillNode,
    toggleLowEnergyEssential,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'anytime'>('all');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmoji, setFormEmoji] = useState('✨');
  const [formParent, setFormParent] = useState('body');
  const [formKind, setFormKind] = useState<'check' | 'count'>('check');
  const [formGoal, setFormGoal] = useState<number>(1);
  const [formUnit, setFormUnit] = useState('times');
  const [formRoutineTime, setFormRoutineTime] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');
  const [formImportance, setFormImportance] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [formAnchor, setFormAnchor] = useState('');

  if (!isOpen) return null;

  // Filter all leaf habits
  const allHabits = state.nodes.filter(n => n.p !== '0');
  const filteredHabits = allHabits.filter(h => {
    if (activeTab === 'all') return true;
    return (h.routineTime || 'anytime') === activeTab;
  });

  const handleStartEdit = (habit: NodeItem) => {
    soundManager.playChime('click');
    setEditingHabitId(habit.id);
    setIsCreatingNew(false);
    setFormName(habit.n);
    setFormEmoji(habit.e || '✨');
    setFormParent(habit.p || 'body');
    setFormKind(habit.k === 'count' ? 'count' : 'check');
    setFormGoal(habit.g || 1);
    setFormUnit(habit.u || 'times');
    setFormRoutineTime(habit.routineTime || 'morning');
    setFormImportance(habit.importance || 'medium');
    setFormAnchor(habit.ifThenAnchor || '');
  };

  const handleStartCreate = () => {
    soundManager.playChime('click');
    setEditingHabitId(null);
    setIsCreatingNew(true);
    setFormName('');
    setFormEmoji('✨');
    setFormParent('body');
    setFormKind('check');
    setFormGoal(1);
    setFormUnit('times');
    setFormRoutineTime('morning');
    setFormImportance('medium');
    setFormAnchor('');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter a habit name');
      return;
    }

    if (isCreatingNew) {
      addSkillNode({
        p: formParent,
        e: formEmoji || '✨',
        n: formName.trim(),
        k: formKind,
        g: formKind === 'count' ? Math.max(1, formGoal) : 1,
        u: formKind === 'count' ? formUnit.trim() || 'times' : undefined,
        routineTime: formRoutineTime,
        importance: formImportance,
        ifThenAnchor: formAnchor.trim() || undefined,
        nature: 'habit'
      });
      showToast(`Added habit "${formName.trim()}"`);
    } else if (editingHabitId) {
      updateSkillNode(editingHabitId, {
        n: formName.trim(),
        e: formEmoji || '✨',
        p: formParent,
        k: formKind,
        g: formKind === 'count' ? Math.max(1, formGoal) : 1,
        u: formKind === 'count' ? formUnit.trim() || 'times' : undefined,
        routineTime: formRoutineTime,
        importance: formImportance,
        ifThenAnchor: formAnchor.trim() || undefined
      });
      showToast('Habit updated');
    }

    setEditingHabitId(null);
    setIsCreatingNew(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from your daily habits?`)) {
      soundManager.playChime('click');
      deleteSkillNode(id);
      if (editingHabitId === id) {
        setEditingHabitId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-xl max-h-[92vh] rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl flex flex-col overflow-hidden light:bg-white light:border-[#E5E3DA]">
        {/* Header */}
        <div className="p-4 border-b border-[#384A41]/60 flex items-center justify-between light:border-[#E5E3DA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#242D29] border border-[#384A41] flex items-center justify-center text-lg light:bg-[#F7F6F2]">
              ⚙️
            </div>
            <div>
              <h3 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
                <span>Customize Daily Checklist</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3D7D62]/30 text-[#68D391]">
                  {allHabits.length} habits
                </span>
              </h3>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Add, edit targets, reorder routines, and designate low-energy essentials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#242D29] border border-[#384A41] flex items-center justify-center text-[#859A90] hover:text-white light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tabs / Filter & Add New Habit button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-[#121413] border-b border-[#384A41]/40 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-0.5">
            {(['all', 'morning', 'afternoon', 'evening', 'anytime'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  soundManager.playChime('click');
                  setActiveTab(tab);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-[#3D7D62] text-white shadow-xs'
                    : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {!isCreatingNew && !editingHabitId && (
            <button
              onClick={handleStartCreate}
              className="w-full sm:w-auto py-1.5 px-3.5 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add New Habit</span>
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {/* Create or Edit Habit Form Drawer */}
          {(isCreatingNew || editingHabitId) && (
            <form onSubmit={handleSaveForm} className="p-4 rounded-2xl bg-[#242D29] border border-[#3D7D62] flex flex-col gap-3.5 shadow-lg animate-in fade-in light:bg-[#EFECE6] light:border-[#3D7D62]">
              <div className="flex items-center justify-between pb-2 border-b border-[#384A41]/50">
                <span className="text-xs font-black text-[#68D391] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isCreatingNew ? 'Create New Daily Habit' : 'Edit Habit Properties'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingHabitId(null);
                  }}
                  className="text-xs text-[#859A90] hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {/* Emoji Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider">
                  Habit Icon
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {EMOJI_PRESETS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        soundManager.playChime('click');
                        setFormEmoji(em);
                      }}
                      className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all ${
                        formEmoji === em
                          ? 'bg-[#3D7D62] scale-110 shadow-xs border border-[#68D391]'
                          : 'bg-[#1B211E] border border-[#384A41] hover:bg-[#2D3631] light:bg-white light:border-[#E5E3DA]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Pillar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider">
                    Habit Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Drink 2L Fresh Water"
                    className="p-2.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider">
                    Parent Pillar
                  </label>
                  <select
                    value={formParent}
                    onChange={e => setFormParent(e.target.value)}
                    className="p-2.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                  >
                    {PILLAR_OPTIONS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kind (Check vs Count) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider">
                    Tracking Mode
                  </label>
                  <select
                    value={formKind}
                    onChange={e => setFormKind(e.target.value as any)}
                    className="p-2.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                  >
                    <option value="check">Single 1-Tap Checkbox</option>
                    <option value="count">Count Stepper (e.g. 5x)</option>
                  </select>
                </div>

                {formKind === 'count' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider">
                        Daily Target Count
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formGoal}
                        onChange={e => setFormGoal(Math.max(1, parseInt(e.target.value) || 1))}
                        className="p-2.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs font-bold text-[#F4F7F4] text-center focus:outline-none focus:border-[#3D7D62] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider">
                        Unit Label
                      </label>
                      <input
                        type="text"
                        value={formUnit}
                        onChange={e => setFormUnit(e.target.value)}
                        placeholder="e.g. times, glasses, reps"
                        className="p-2.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Routine Time & Importance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider">
                    Routine Window
                  </label>
                  <select
                    value={formRoutineTime}
                    onChange={e => setFormRoutineTime(e.target.value as any)}
                    className="p-2.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                  >
                    <option value="morning">🌅 Morning</option>
                    <option value="afternoon">☀️ Afternoon</option>
                    <option value="evening">🌙 Evening</option>
                    <option value="anytime">⏰ Anytime</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider">
                    Importance Tier
                  </label>
                  <select
                    value={formImportance}
                    onChange={e => setFormImportance(e.target.value as any)}
                    className="p-2.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                  >
                    <option value="critical">🚨 Critical Keystone (Anchor)</option>
                    <option value="high">⭐ High Priority</option>
                    <option value="medium">🔹 Medium</option>
                    <option value="low">▫️ Low / Optional</option>
                  </select>
                </div>
              </div>

              {/* If-Then Anchor Trigger Cue */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider flex items-center gap-1">
                  <Anchor className="w-3 h-3 text-[#E5A93C]" />
                  <span>If-Then Anchor Cue (Behavioral Habit Stacking)</span>
                </label>
                <input
                  type="text"
                  value={formAnchor}
                  onChange={e => setFormAnchor(e.target.value)}
                  placeholder="e.g. After pouring my morning coffee, I will..."
                  className="p-2.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingHabitId(null);
                  }}
                  className="py-2 px-3.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs font-bold text-[#859A90] hover:text-white light:bg-white light:border-[#E5E3DA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isCreatingNew ? 'Save New Habit' : 'Apply Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Habit Items List */}
          <div className="flex flex-col gap-2">
            {filteredHabits.map(habit => {
              const isEssential = state.lowEnergyEssentialIds.includes(habit.id);
              const parentPillar = PILLAR_OPTIONS.find(p => p.id === habit.p);

              return (
                <div
                  key={habit.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    editingHabitId === habit.id
                      ? 'border-[#3D7D62] bg-[#242D29]/70'
                      : 'bg-[#242D29] border-[#384A41]/70 hover:border-[#384A41] light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0 p-1 rounded-xl bg-[#1B211E] border border-[#384A41] light:bg-white light:border-[#E5E3DA]">
                      {habit.e || '✨'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E] truncate">
                          {habit.n}
                        </span>
                        {habit.importance === 'critical' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 font-bold">
                            Critical
                          </span>
                        )}
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#1B211E] border border-[#384A41] text-[#859A90] font-semibold capitalize light:bg-white light:border-[#E5E3DA]">
                          {habit.routineTime || 'anytime'}
                        </span>
                        {parentPillar && (
                          <span className="text-[9px] text-[#859A90]">
                            {parentPillar.icon} {parentPillar.label.split(' ')[0]}
                          </span>
                        )}
                      </div>

                      {habit.ifThenAnchor ? (
                        <div className="text-[10px] text-[#E5A93C] mt-0.5 truncate">
                          ⚓ {habit.ifThenAnchor}
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#859A90] mt-0.5">
                          {habit.k === 'count' ? `Target: ${habit.g} ${habit.u || 'times'}/day` : 'Daily 1-tap check'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Low Energy Essential Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleLowEnergyEssential(habit.id)}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                        isEssential
                          ? 'bg-[#2E2308] border-[#E5A93C] text-[#E5A93C] shadow-xs'
                          : 'bg-[#1B211E] border-[#384A41] text-[#859A90] hover:text-[#E5A93C] light:bg-white light:border-[#E5E3DA]'
                      }`}
                      title={isEssential ? 'Essential Habit (Starred)' : 'Mark as Low Energy Essential'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isEssential ? 'fill-[#E5A93C]' : ''}`} />
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(habit)}
                      className="w-8 h-8 rounded-xl bg-[#1B211E] border border-[#384A41] text-[#859A90] hover:text-white flex items-center justify-center transition-all light:bg-white light:border-[#E5E3DA]"
                      title="Edit Habit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(habit.id, habit.n)}
                      className="w-8 h-8 rounded-xl bg-[#1B211E] border border-[#384A41] text-[#859A90] hover:text-[#EF4444] flex items-center justify-center transition-all light:bg-white light:border-[#E5E3DA]"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#384A41]/60 flex items-center justify-between light:border-[#E5E3DA]">
          <span className="text-[11px] text-[#859A90] flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-[#E5A93C] fill-[#E5A93C]" />
            <span>Starred habits remain visible in Low Energy mode</span>
          </span>

          <button
            onClick={() => {
              soundManager.playChime('click');
              onClose();
            }}
            className="py-2 px-5 rounded-xl bg-[#3D7D62] text-white text-xs font-black hover:bg-[#2D6A4F] shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
