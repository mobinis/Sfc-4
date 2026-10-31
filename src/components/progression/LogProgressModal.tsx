import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MeasurableTarget, ActivityDomain } from '../../types';
import { X, Clock, Plus, Zap, Check, Tag as TagIcon } from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';

interface LogProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: MeasurableTarget | null;
}

const DOMAIN_OPTIONS: { id: ActivityDomain; label: string; icon: string }[] = [
  { id: 'workout', label: 'Workout / Training', icon: '💪' },
  { id: 'reading', label: 'Reading Session', icon: '📖' },
  { id: 'learning', label: 'Deep Focus / Learning', icon: '🧠' },
  { id: 'screentime', label: 'Digital / Screen Time', icon: '📵' },
  { id: 'impact', label: 'Good Deed / Impact', icon: '🌱' },
  { id: 'target', label: 'Target Session', icon: '🎯' },
  { id: 'skill', label: 'General Skill Practice', icon: '⭐' }
];

export const LogProgressModal: React.FC<LogProgressModalProps> = ({
  isOpen,
  onClose,
  target
}) => {
  const { state, logActivityRecord, showToast } = useApp();

  const activeTargets = state.measurableTargets.filter(t => t.status === 'active');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(target?.id || (activeTargets[0]?.id || ''));

  // Get active target object
  const currentTarget = state.measurableTargets.find(t => t.id === selectedTargetId) || target || null;

  // Domain derived from target or chosen standalone
  const getDomainFromCategory = (cat?: string): ActivityDomain => {
    if (cat === 'fitness') return 'workout';
    if (cat === 'reading') return 'reading';
    if (cat === 'learning' || cat === 'work') return 'learning';
    if (cat === 'digital') return 'screentime';
    if (cat === 'impact') return 'impact';
    return 'target';
  };

  const [domain, setDomain] = useState<ActivityDomain>(
    currentTarget ? getDomainFromCategory(currentTarget.category) : 'target'
  );

  const [title, setTitle] = useState(
    currentTarget ? `${currentTarget.title} Session` : 'Focused Activity Session'
  );
  const [valueDelta, setValueDelta] = useState<string>('1');
  const [durationMinutes, setDurationMinutes] = useState<string>('15');
  const [isPlanned, setIsPlanned] = useState<boolean>(true);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(currentTarget?.tagIds || []);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const currentUnit = currentTarget?.unit || (domain === 'reading' ? 'pages' : domain === 'workout' ? 'reps' : 'min');

  const handleTargetChange = (tId: string) => {
    setSelectedTargetId(tId);
    const found = state.measurableTargets.find(t => t.id === tId);
    if (found) {
      setTitle(`${found.title} Session`);
      setDomain(getDomainFromCategory(found.category));
      setSelectedTagIds(found.tagIds);
      if (found.type === 'quantity' && found.category === 'fitness') setValueDelta('15');
      else if (found.type === 'quantity' && found.category === 'reading') setValueDelta('10');
      else if (found.type === 'duration') setValueDelta('30');
      else setValueDelta('1');
    }
  };

  const handleInsertTimestamp = () => {
    const stamp = `[${new Date().toISOString().slice(0, 16).replace('T', ' ')}] `;
    setNotes(prev => (prev ? `${prev}\n${stamp}` : stamp));
    soundManager.playChime('click');
  };

  const handleQuickAdd = (amount: number) => {
    soundManager.playChime('click');
    const currentVal = parseFloat(valueDelta) || 0;
    setValueDelta((currentVal + amount).toString());
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = () => {
    const val = parseFloat(valueDelta) || 0;
    if (val <= 0) {
      showToast('Please enter a positive value to log');
      return;
    }

    const dur = parseInt(durationMinutes, 10);

    logActivityRecord({
      title: title.trim() || 'Activity Session',
      domain,
      value: val,
      unit: currentUnit,
      durationMinutes: isNaN(dur) ? undefined : dur,
      targetId: currentTarget ? currentTarget.id : null,
      skillId: currentTarget?.linkedSkillId || null,
      roadmapGoalId: currentTarget?.linkedRoadmapGoalId || null,
      notes: notes.trim(),
      tagIds: selectedTagIds,
      isPlanned
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg my-6 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl p-5 text-[#F4F7F4] flex flex-col gap-4 max-h-[90vh] overflow-y-auto light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#384A41]/60 pb-3 light:border-[#E5E3DA]">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{currentTarget?.icon || '⏱️'}</span>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Log Activity & Progress
              </h3>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Add to your Unified Daily Activity Log and compound XP
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

        {/* Target Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
            Progression Target
          </label>
          <select
            value={selectedTargetId}
            onChange={e => handleTargetChange(e.target.value)}
            className="w-full h-9 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-semibold focus:border-[#3D7D62] focus:outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <option value="">Standalone / No linked target</option>
            {activeTargets.map(t => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.title} ({t.currentProgress}/{t.targetValue} {t.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Session Title */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
            Session Title
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Afternoon push-up set, Chapter 3 deep read..."
            className="w-full h-9 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-medium focus:border-[#3D7D62] focus:outline-hidden light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          />
        </div>

        {/* Value Delta & Quick Buttons */}
        <div className="p-3.5 rounded-2xl bg-[#242D29] border border-[#384A41]/60 flex flex-col gap-2.5 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold">
              Progress Amount ({currentUnit})
            </span>
            {currentTarget?.isReductionTarget && (
              <span className="text-[10px] font-bold text-[#EC4899]">
                Ceiling: {currentTarget.targetValue} {currentTarget.unit}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              value={valueDelta}
              onChange={e => setValueDelta(e.target.value)}
              className="flex-1 h-10 px-3 rounded-xl bg-[#1B211E] border border-[#384A41] font-mono tabular-nums text-base font-black text-center focus:border-[#3D7D62] focus:outline-hidden light:bg-white light:border-[#E5E3DA]"
            />
            <span className="text-xs font-bold text-[#859A90] min-w-10">
              {currentUnit}
            </span>
          </div>

          {/* Quick Increment Row */}
          <div className="flex items-center gap-1.5 justify-center pt-1">
            {[1, 5, 10, 15, 25].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickAdd(amt)}
                className="px-2.5 py-1 rounded-lg bg-[#1B211E] hover:bg-[#384A41] border border-[#384A41]/60 text-[11px] font-bold font-mono transition-all light:bg-white light:border-[#E5E3DA]"
              >
                +{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Duration & Planned/Spontaneous Toggle */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
              Duration (Minutes)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value)}
                placeholder="15"
                className="w-full h-9 px-3 rounded-xl bg-[#242D29] border border-[#384A41] font-mono tabular-nums text-xs light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              />
              <span className="absolute right-3 text-[10px] text-[#859A90]">min</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
              Session Type
            </label>
            <div className="grid grid-cols-2 gap-1 p-0.5 rounded-xl bg-[#242D29] border border-[#384A41] light:bg-[#F7F6F2] light:border-[#E5E3DA]">
              <button
                type="button"
                onClick={() => setIsPlanned(true)}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  isPlanned ? 'bg-[#3D7D62] text-white' : 'text-[#859A90]'
                }`}
              >
                Planned
              </button>
              <button
                type="button"
                onClick={() => setIsPlanned(false)}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  !isPlanned ? 'bg-[#3D7D62] text-white' : 'text-[#859A90]'
                }`}
              >
                Spontaneous
              </button>
            </div>
          </div>
        </div>

        {/* Tags Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
            Session Tags
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {state.sharedTags.map(tag => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggleTag(tag.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition-all ${
                    isSelected
                      ? 'border-transparent text-white font-bold'
                      : 'border-[#384A41]/50 bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#5C655E]'
                  }`}
                  style={isSelected ? { backgroundColor: tag.color } : {}}
                >
                  <span>{tag.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes with Timestamp Button */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
              Session Reflection & Notes
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
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Form feedback, obstacles encountered, energetic feeling..."
            className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-mono focus:border-[#3D7D62] focus:outline-hidden resize-none light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#384A41]/60 light:border-[#E5E3DA]">
          <div className="flex items-center gap-1.5 text-xs text-[#859A90] light:text-[#5C655E]">
            <Zap className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span>Awards ~{Math.min(50, Math.max(10, Math.round((parseInt(durationMinutes, 10) || 15) * 0.5)))} XP</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] hover:bg-[#242D29] transition-all light:hover:bg-[#F2F1EC]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2.5 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-md shadow-[#3D7D62]/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Log Activity Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
