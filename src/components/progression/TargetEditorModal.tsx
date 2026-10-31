import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MeasurableTarget,
  TargetCategory,
  TargetType,
  TrackingPeriod,
  TargetMilestone,
  SharedTag
} from '../../types';
import { X, Plus, Trash2, Calendar, Clock, Tag as TagIcon, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';
import { DateUtils } from '../../utils/dateUtils';

interface TargetEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: MeasurableTarget | null;
}

const CATEGORY_OPTIONS: { id: TargetCategory; label: string; icon: string }[] = [
  { id: 'fitness', label: 'Fitness & Body', icon: '💪' },
  { id: 'reading', label: 'Reading & Books', icon: '📖' },
  { id: 'learning', label: 'Learning & Skills', icon: '🧠' },
  { id: 'wellbeing', label: 'Wellbeing & Mind', icon: '🌙' },
  { id: 'digital', label: 'Digital Curfew', icon: '📵' },
  { id: 'impact', label: 'Daily Impact', icon: '🌱' },
  { id: 'work', label: 'Work & Projects', icon: '🚀' },
  { id: 'general', label: 'General Practice', icon: '⭐' }
];

const TYPE_OPTIONS: { id: TargetType; label: string; desc: string; defaultUnit: string }[] = [
  { id: 'quantity', label: 'Quantity', desc: 'Reps, pages, chapters, tasks, sets', defaultUnit: 'reps' },
  { id: 'duration', label: 'Duration', desc: 'Minutes or hours spent in focused state', defaultUnit: 'min' },
  { id: 'frequency', label: 'Frequency', desc: 'Sessions per day, days per week', defaultUnit: 'sessions' },
  { id: 'reduction', label: 'Reduction', desc: 'Ceiling target: screen time, doomscrolling', defaultUnit: 'min' },
  { id: 'milestone', label: 'Milestone', desc: 'Sequential multi-step progression', defaultUnit: 'steps' },
  { id: 'consistency', label: 'Consistency', desc: 'Maintain streak for consecutive days', defaultUnit: 'days' }
];

const PRESET_ICONS = ['💪', '📖', '⚡', '📵', '🚀', '💧', '🧘', '✍️', '🏃', '🥋', '🎯', '🌱'];

export const TargetEditorModal: React.FC<TargetEditorModalProps> = ({
  isOpen,
  onClose,
  target
}) => {
  const { state, addMeasurableTarget, updateMeasurableTarget, addSharedTag, showToast } = useApp();

  const [title, setTitle] = useState(target?.title || '');
  const [description, setDescription] = useState(target?.description || '');
  const [category, setCategory] = useState<TargetCategory>(target?.category || 'fitness');
  const [icon, setIcon] = useState(target?.icon || '💪');
  const [type, setType] = useState<TargetType>(target?.type || 'quantity');
  const [unit, setUnit] = useState(target?.unit || 'reps');
  const [baselineValue, setBaselineValue] = useState(target?.baselineValue?.toString() || '0');
  const [targetValue, setTargetValue] = useState(target?.targetValue?.toString() || '30');
  const [isReduction, setIsReduction] = useState(target?.isReductionTarget ?? (target?.type === 'reduction'));
  const [trackingPeriod, setTrackingPeriod] = useState<TrackingPeriod>(target?.trackingPeriod || 'daily');
  const [startDate, setStartDate] = useState(target?.startDate || DateUtils.todayStr());
  const [targetDate, setTargetDate] = useState(target?.targetDate || '');
  const [linkedSkillId, setLinkedSkillId] = useState<string>(target?.linkedSkillId || '');
  const [linkedRoadmapGoalId, setLinkedRoadmapGoalId] = useState<string>(target?.linkedRoadmapGoalId || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(target?.tagIds || []);
  const [notes, setNotes] = useState(target?.notes || '');
  const [reminderEnabled, setReminderEnabled] = useState(target?.reminderEnabled || false);
  const [reminderTime, setReminderTime] = useState(target?.reminderTime || '18:00');

  // Milestones list
  const [milestones, setMilestones] = useState<TargetMilestone[]>(target?.milestones || []);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  // Inline new tag creator
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3D7D62');

  if (!isOpen) return null;

  const handleTypeChange = (newType: TargetType) => {
    setType(newType);
    const found = TYPE_OPTIONS.find(t => t.id === newType);
    if (found && !target) {
      setUnit(found.defaultUnit);
    }
    if (newType === 'reduction') {
      setIsReduction(true);
    }
  };

  const handleInsertTimestamp = () => {
    const stamp = `[${new Date().toISOString().slice(0, 16).replace('T', ' ')}] `;
    setNotes(prev => (prev ? `${prev}\n${stamp}` : stamp));
    soundManager.playChime('click');
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    const newM: TargetMilestone = {
      id: 'm_' + Date.now(),
      title: newMilestoneTitle.trim(),
      isCompleted: false
    };
    setMilestones(prev => [...prev, newM]);
    setNewMilestoneTitle('');
    soundManager.playChime('click');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    addSharedTag({
      name: newTagName.trim(),
      color: newTagColor,
      scope: 'universal'
    });
    setNewTagName('');
    setIsCreatingTag(false);
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      showToast('Please provide a target title');
      return;
    }

    const baseVal = parseFloat(baselineValue) || 0;
    const tgtVal = parseFloat(targetValue) || (type === 'milestone' ? Math.max(1, milestones.length) : 1);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      icon,
      type,
      status: target?.status || 'active',
      unit: unit.trim() || 'units',
      baselineValue: baseVal,
      targetValue: tgtVal,
      isReductionTarget: isReduction || type === 'reduction',
      trackingPeriod,
      startDate,
      targetDate: targetDate ? targetDate : null,
      recurrence: (trackingPeriod === 'daily' ? 'daily' : trackingPeriod === 'weekly' ? 'weekly' : 'none') as 'daily' | 'weekly' | 'none',
      linkedSkillId: linkedSkillId || null,
      linkedRoadmapGoalId: linkedRoadmapGoalId || null,
      tagIds: selectedTagIds,
      milestones: milestones,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      notes: notes.trim(),
    };

    if (target) {
      updateMeasurableTarget(target.id, payload);
    } else {
      addMeasurableTarget(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl p-5 text-[#F4F7F4] flex flex-col gap-4.5 max-h-[90vh] overflow-y-auto light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#384A41]/60 pb-3 light:border-[#E5E3DA]">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="text-base font-black tracking-tight">
                {target ? 'Edit Measurable Target' : 'Create Progression Target'}
              </h3>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Define measurable metrics, baselines, and tracking periods
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#242D29] text-[#859A90] light:hover:bg-[#F2F1EC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-4 text-xs">
          {/* Icon picker & Title */}
          <div className="flex items-start gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
                Icon
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  className="w-12 h-10 rounded-xl bg-[#242D29] border border-[#384A41] text-center text-lg focus:border-[#3D7D62] focus:outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
                Target Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Push-Up Volume, Carnegie Reading, Deep Work..."
                className="w-full h-10 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-semibold focus:border-[#3D7D62] focus:outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              />
            </div>
          </div>

          {/* Preset icon row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {PRESET_ICONS.map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border transition-all ${
                  icon === i
                    ? 'border-[#3D7D62] bg-[#3D7D62]/20'
                    : 'border-[#384A41]/40 bg-[#242D29] hover:border-[#384A41] light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                }`}
              >
                {i}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
              Description & Purpose
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What makes this target meaningful? e.g. Build calisthenics shoulder stability"
              className="w-full h-9 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs focus:border-[#3D7D62] focus:outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA]"
            />
          </div>

          {/* Category & Target Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TargetCategory)}
                className="w-full h-9 px-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-medium focus:border-[#3D7D62] focus:outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Type */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
                Target Type
              </label>
              <select
                value={type}
                onChange={e => handleTypeChange(e.target.value as TargetType)}
                className="w-full h-9 px-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-medium focus:border-[#3D7D62] focus:outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                {TYPE_OPTIONS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.label} ({t.desc})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Measurements: Baseline, Target Value, Unit */}
          <div className="p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/60 flex flex-col gap-2.5 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#F4F7F4] light:text-[#1C221E]">
                Measurement Parameters
              </span>
              {type === 'reduction' || isReduction ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EC4899]/20 text-[#F472B6] font-bold">
                  Ceiling Target (Keep Under)
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3D7D62]/20 text-[#68D391] font-bold">
                  Accumulation Target
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#859A90] light:text-[#5C655E]">Baseline</label>
                <input
                  type="number"
                  value={baselineValue}
                  onChange={e => setBaselineValue(e.target.value)}
                  className="h-8 px-2 rounded-lg bg-[#1B211E] border border-[#384A41] font-mono tabular-nums text-xs light:bg-white light:border-[#E5E3DA]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#859A90] light:text-[#5C655E]">Target Goal *</label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={e => setTargetValue(e.target.value)}
                  className="h-8 px-2 rounded-lg bg-[#1B211E] border border-[#384A41] font-mono tabular-nums text-xs font-bold light:bg-white light:border-[#E5E3DA]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#859A90] light:text-[#5C655E]">Unit</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="reps, min, pages"
                  className="h-8 px-2 rounded-lg bg-[#1B211E] border border-[#384A41] text-xs light:bg-white light:border-[#E5E3DA]"
                />
              </div>
            </div>

            {/* Reduction Ceiling Checkbox */}
            <label className="flex items-center gap-2 pt-1 text-[11px] text-[#859A90] cursor-pointer light:text-[#5C655E]">
              <input
                type="checkbox"
                checked={isReduction}
                onChange={e => setIsReduction(e.target.checked)}
                className="w-3.5 h-3.5 rounded-sm accent-[#3D7D62]"
              />
              <span>Treat as reduction ceiling (Staying below target value is victory)</span>
            </label>
          </div>

          {/* Tracking Period & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
                Tracking Period
              </label>
              <select
                value={trackingPeriod}
                onChange={e => setTrackingPeriod(e.target.value as TrackingPeriod)}
                className="h-9 px-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                <option value="daily">Daily Reset</option>
                <option value="weekly">Weekly Target</option>
                <option value="monthly">Monthly Sprint</option>
                <option value="custom">Continuous / Custom</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="h-9 px-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-mono light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
                Target Date (Optional)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="h-9 px-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-mono light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              />
            </div>
          </div>

          {/* Skill Link & Roadmap Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
                Link to Skill Node
              </label>
              <select
                value={linkedSkillId}
                onChange={e => setLinkedSkillId(e.target.value)}
                className="h-9 px-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                <option value="">None (Independent target)</option>
                {state.nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.e} {n.n} {n.p === '0' ? '(Root Pillar)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
                Link to Roadmap Goal
              </label>
              <select
                value={linkedRoadmapGoalId}
                onChange={e => setLinkedRoadmapGoalId(e.target.value)}
                className="h-9 px-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                <option value="">None</option>
                {state.roadmapGoals.map(g => (
                  <option key={g.id} value={g.id}>
                    🧭 {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shared Tags Selection */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
                Tags ({selectedTagIds.length} selected)
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingTag(!isCreatingTag)}
                className="text-[11px] text-[#3D7D62] hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>New Tag</span>
              </button>
            </div>

            {/* Inline tag creator */}
            {isCreatingTag && (
              <div className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] flex items-center gap-2 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
                <input
                  type="text"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="Tag label..."
                  className="flex-1 h-8 px-2 rounded-lg bg-[#1B211E] border border-[#384A41] text-xs light:bg-white light:border-[#E5E3DA]"
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={e => setNewTagColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className="px-3 h-8 rounded-lg bg-[#3D7D62] text-white font-bold text-xs"
                >
                  Add
                </button>
              </div>
            )}

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {state.sharedTags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-transparent text-white font-bold shadow-xs'
                        : 'border-[#384A41]/50 bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#5C655E]'
                    }`}
                    style={isSelected ? { backgroundColor: tag.color } : {}}
                  >
                    <span>{tag.name}</span>
                    <span className="text-[9px] opacity-70">({tag.scope})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sequential Milestones Section */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#F4F7F4] light:text-[#1C221E]">
                Ordered Milestones & Sub-targets ({milestones.length})
              </span>
              <span className="text-[10px] text-[#859A90] light:text-[#5C655E]">
                {type === 'milestone' ? 'Required for progression' : 'Optional stepping stones'}
              </span>
            </div>

            {milestones.length > 0 && (
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                {milestones.map((m, idx) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#1B211E] border border-[#384A41]/60 text-xs light:bg-white light:border-[#E5E3DA]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#859A90]">#{idx + 1}</span>
                      <span className={m.isCompleted ? 'line-through text-[#859A90]' : 'font-medium'}>
                        {m.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(m.id)}
                      className="p-1 text-[#859A90] hover:text-[#D95D39]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={newMilestoneTitle}
                onChange={e => setNewMilestoneTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone())}
                placeholder="New milestone, e.g. 50 pushups in 1 set..."
                className="flex-1 h-8 px-2 rounded-lg bg-[#1B211E] border border-[#384A41] text-xs light:bg-white light:border-[#E5E3DA]"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 h-8 rounded-lg bg-[#384A41] hover:bg-[#3D7D62] text-white text-xs font-bold transition-all"
              >
                + Step
              </button>
            </div>
          </div>

          {/* Reminders Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#242D29] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={e => setReminderEnabled(e.target.checked)}
                className="w-3.5 h-3.5 rounded-sm accent-[#3D7D62]"
              />
              <span>Daily Practice Reminder</span>
            </label>
            {reminderEnabled && (
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                className="h-7 px-2 rounded-lg bg-[#1B211E] border border-[#384A41] text-xs font-mono light:bg-white light:border-[#E5E3DA]"
              />
            )}
          </div>

          {/* Notes with timestamp inserter */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
                Personal Strategy & Form Notes
              </label>
              <button
                type="button"
                onClick={handleInsertTimestamp}
                className="text-[10px] text-[#3D7D62] hover:underline font-bold flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                <span>+ Insert Stamp</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Technique cues, mindset anchors, friction mitigation..."
              className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-mono focus:border-[#3D7D62] focus:outline-hidden resize-none light:bg-[#F7F6F2] light:border-[#E5E3DA]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#384A41]/60 light:border-[#E5E3DA]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] hover:bg-[#242D29] transition-all light:hover:bg-[#F2F1EC]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-md shadow-[#3D7D62]/20 transition-all active:scale-95"
          >
            {target ? 'Save Target Changes' : 'Create Target'}
          </button>
        </div>
      </div>
    </div>
  );
};
