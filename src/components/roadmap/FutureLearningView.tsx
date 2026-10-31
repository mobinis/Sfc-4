import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RoadmapGoal, RoadmapStep, RoadmapTag, RoadmapGoalPriority, RoadmapGoalStatus } from '../../types';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  List,
  CheckCircle2,
  Clock,
  Tag as TagIcon,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  Archive,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';

export const FutureLearningView: React.FC = () => {
  const {
    state,
    addRoadmapGoal,
    updateRoadmapGoal,
    deleteRoadmapGoal,
    addRoadmapStep,
    updateRoadmapStep,
    deleteRoadmapStep,
    toggleRoadmapStepComplete,
    addRoadmapTag,
    deleteRoadmapTag,
    awardXp,
    showToast
  } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Expanded goals & step branch state
  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(new Set(state.roadmapGoals.map(g => g.id)));
  const [expandedStepIds, setExpandedStepIds] = useState<Set<string>>(new Set(state.roadmapSteps.map(s => s.id)));

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<RoadmapGoal | null>(null);

  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<RoadmapStep | null>(null);
  const [stepModalGoalId, setStepModalGoalId] = useState<string>('');
  const [stepModalParentId, setStepModalParentId] = useState<string | null>(null);

  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3D7D62');

  // Notes editor modal
  const [notesModalItem, setNotesModalItem] = useState<{ type: 'goal' | 'step'; item: RoadmapGoal | RoadmapStep } | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Toggle goal expansion
  const toggleGoalExpand = (goalId: string) => {
    soundManager.playChime('click');
    setExpandedGoalIds(prev => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  };

  const toggleStepExpand = (stepId: string) => {
    soundManager.playChime('click');
    setExpandedStepIds(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  // Insert timestamp into notes at cursor
  const handleInsertTimestamp = () => {
    soundManager.playChime('click');
    const now = new Date();
    const timestampStr = `[${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}] `;

    const textarea = notesTextareaRef.current;
    if (!textarea) {
      setNotesDraft(prev => prev + '\n' + timestampStr);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextText = notesDraft.substring(0, start) + timestampStr + notesDraft.substring(end);
    setNotesDraft(nextText);

    // Reposition cursor right after inserted timestamp
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + timestampStr.length, start + timestampStr.length);
    }, 0);
  };

  const handleSaveNotes = () => {
    if (!notesModalItem) return;
    soundManager.playChime('click');
    if (notesModalItem.type === 'goal') {
      updateRoadmapGoal(notesModalItem.item.id, { notes: notesDraft });
    } else {
      updateRoadmapStep(notesModalItem.item.id, { notes: notesDraft });
    }
    setNotesModalItem(null);
  };

  // Helper: compute goal progress
  const getGoalStats = (goalId: string) => {
    const steps = state.roadmapSteps.filter(s => s.goalId === goalId && !s.isArchived);
    if (steps.length === 0) return { total: 0, completed: 0, percent: 0 };
    const completed = steps.filter(s => s.isCompleted).length;
    return {
      total: steps.length,
      completed,
      percent: Math.round((completed / steps.length) * 100)
    };
  };

  // Filtering
  const filteredGoals = state.roadmapGoals.filter(goal => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = goal.title.toLowerCase().includes(q);
      const matchDesc = goal.description.toLowerCase().includes(q);
      const matchSteps = state.roadmapSteps.some(s => s.goalId === goal.id && s.title.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSteps) return false;
    }
    if (selectedTagFilter !== 'all') {
      if (!goal.tagIds.includes(selectedTagFilter)) return false;
    }
    if (selectedStatusFilter !== 'all') {
      if (goal.status !== selectedStatusFilter) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header Bar & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#1B211E] border border-[#384A41] light:bg-white light:border-[#E5E3DA]">
        <div>
          <h2 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
            <span>🧭</span> Personal Learning Roadmap
          </h2>
          <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
            Organize future skills, prerequisite milestones, and structured study plans
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="flex items-center rounded-xl bg-[#242D29] border border-[#384A41] p-0.5 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <button
              onClick={() => {
                soundManager.playChime('click');
                setViewMode('list');
              }}
              className={`py-1 px-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-[#3D7D62] text-white shadow-xs'
                  : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundManager.playChime('click');
                setViewMode('calendar');
              }}
              className={`py-1 px-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-[#3D7D62] text-white shadow-xs'
                  : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Manage Tags Button */}
          <button
            onClick={() => {
              soundManager.playChime('click');
              setIsTagManagerOpen(true);
            }}
            className="py-1.5 px-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] text-xs font-bold flex items-center gap-1.5 light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#5C655E]"
          >
            <TagIcon className="w-3.5 h-3.5" />
            <span>Tags</span>
          </button>

          {/* Add Goal Button */}
          <button
            onClick={() => {
              soundManager.playChime('click');
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            className="py-1.5 px-3 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all light:bg-[#2D6A4F]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#859A90]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search goals, prerequisites, topics..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90] focus:border-[#3D7D62] focus:outline-none light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
          />
        </div>

        <div className="flex gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="py-2 px-2.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
          >
            <option value="all">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTagFilter}
            onChange={e => setSelectedTagFilter(e.target.value)}
            className="py-2 px-2.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
          >
            <option value="all">All Tags</option>
            {state.roadmapTags.map(tag => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredGoals.length === 0 && (
        <div className="p-8 rounded-3xl bg-[#1B211E] border border-[#384A41] text-center light:bg-white light:border-[#E5E3DA]">
          <div className="w-12 h-12 rounded-2xl bg-[#2A5643]/30 text-[#3D7D62] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#F4F7F4] light:text-[#1C221E]">No Learning Goals Found</h3>
          <p className="text-xs text-[#859A90] light:text-[#5C655E] mt-1 mb-4 max-w-sm mx-auto">
            Design your future skills trajectory with nested prerequisite steps, study schedules, and notes.
          </p>
          <button
            onClick={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            className="py-2 px-4 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Learning Goal</span>
          </button>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && filteredGoals.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#3D7D62]" /> Scheduled Study Dates
            </h3>
            <span className="text-[11px] text-[#859A90] light:text-[#5C655E]">Tap item to inspect</span>
          </div>

          <div className="flex flex-col gap-3">
            {filteredGoals.map(goal => {
              const goalSteps = state.roadmapSteps.filter(s => s.goalId === goal.id && s.plannedDate);
              return (
                <div key={goal.id} className="p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/70 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">{goal.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B211E] text-[#E5A93C] font-mono light:bg-white">
                      Start: {goal.plannedStartDate || 'Flexible'} {goal.targetCompletionDate ? `→ ${goal.targetCompletionDate}` : ''}
                    </span>
                  </div>

                  {goalSteps.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {goalSteps.map(step => (
                        <div
                          key={step.id}
                          onClick={() => {
                            setNotesModalItem({ type: 'step', item: step });
                            setNotesDraft(step.notes || '');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#1B211E] border border-[#384A41] cursor-pointer hover:border-[#3D7D62] transition-colors light:bg-white light:border-[#E5E3DA]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${step.isCompleted ? 'bg-[#3D7D62]' : 'bg-[#E5A93C]'}`} />
                            <span className="text-[11px] font-bold text-[#F4F7F4] light:text-[#1C221E] truncate">{step.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#859A90] shrink-0 ml-2">{step.plannedDate}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#859A90] italic light:text-[#5C655E]">No steps with specific calendar dates yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW (Hierarchical Prerequisite Tree) */}
      {viewMode === 'list' && (
        <div className="flex flex-col gap-3">
          {filteredGoals.map(goal => {
            const stats = getGoalStats(goal.id);
            const isExpanded = expandedGoalIds.has(goal.id);

            // Top-level steps for this goal (parentId is null or empty)
            const topSteps = state.roadmapSteps
              .filter(s => s.goalId === goal.id && !s.parentId && !s.isArchived)
              .sort((a, b) => a.order - b.order);

            return (
              <div
                key={goal.id}
                className="rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm overflow-hidden light:bg-white light:border-[#E5E3DA] transition-all"
              >
                {/* Main Goal Card Header */}
                <div className="p-4 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => toggleGoalExpand(goal.id)}
                        className="p-1 rounded-lg text-[#859A90] hover:text-[#F4F7F4] mt-0.5 light:text-[#5C655E]"
                        aria-label="Expand goal"
                      >
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E] truncate">{goal.title}</h3>

                          {/* Status Pill */}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              goal.status === 'completed'
                                ? 'bg-[#2A5643] text-[#E8F3ED]'
                                : goal.status === 'in_progress'
                                ? 'bg-blue-900/40 text-blue-300 border border-blue-700/40'
                                : 'bg-[#242D29] text-[#859A90]'
                            }`}
                          >
                            {goal.status.replace('_', ' ')}
                          </span>

                          {/* Priority Pill */}
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                              goal.priority === 'urgent'
                                ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                                : goal.priority === 'high'
                                ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                                : 'bg-[#242D29] text-[#859A90]'
                            }`}
                          >
                            {goal.priority}
                          </span>
                        </div>

                        {goal.description && (
                          <p className="text-[11px] text-[#859A90] light:text-[#5C655E] mb-2">{goal.description}</p>
                        )}

                        {/* Dates & Schedule */}
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#859A90] light:text-[#5C655E]">
                          {goal.plannedStartDate && (
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-[#3D7D62]" /> Start: {goal.plannedStartDate}
                            </span>
                          )}
                          {goal.targetCompletionDate && (
                            <span className="flex items-center gap-1 font-mono">
                              🎯 Target: {goal.targetCompletionDate}
                            </span>
                          )}
                          {goal.sessionTime && (
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-[#E5A93C]" /> {goal.sessionTime} ({goal.estimatedDurationMinutes || 30}m)
                            </span>
                          )}
                        </div>

                        {/* Tag Pills */}
                        {goal.tagIds.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {goal.tagIds.map(tid => {
                              const tag = state.roadmapTags.find(t => t.id === tid);
                              if (!tag) return null;
                              return (
                                <span
                                  key={tag.id}
                                  className="text-[10px] px-2 py-0.5 rounded-md font-bold text-white flex items-center gap-1"
                                  style={{ backgroundColor: tag.color }}
                                >
                                  #{tag.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Notes Button with Badge */}
                      <button
                        onClick={() => {
                          setNotesModalItem({ type: 'goal', item: goal });
                          setNotesDraft(goal.notes || '');
                        }}
                        title="View / Edit Notes with Timestamp"
                        className="py-1 px-2 rounded-xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] text-xs font-bold flex items-center gap-1 light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Notes</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setIsGoalModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete learning goal "${goal.title}"?`)) {
                            deleteRoadmapGoal(goal.id);
                          }
                        }}
                        className="w-8 h-8 rounded-xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-red-400 flex items-center justify-center light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Goal Progress Bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-[#242D29] light:bg-[#E5E3DA] overflow-hidden">
                      <div
                        className="h-full bg-[#3D7D62] rounded-full transition-all duration-300"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#E5A93C] shrink-0">
                      {stats.completed}/{stats.total} steps ({stats.percent}%)
                    </span>
                  </div>
                </div>

                {/* Nested Prerequisites Tree (Expandable) */}
                {isExpanded && (
                  <div className="p-4 bg-[#171C19]/60 light:bg-[#FAF9F5]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black text-[#859A90] light:text-[#5C655E] uppercase tracking-wider">
                        Prerequisite Milestones & Sub-tasks
                      </h4>
                      <button
                        onClick={() => {
                          setStepModalGoalId(goal.id);
                          setStepModalParentId(null);
                          setEditingStep(null);
                          setIsStepModalOpen(true);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-[#242D29] border border-[#384A41] hover:border-[#3D7D62] text-[11px] font-bold text-[#F4F7F4] flex items-center gap-1 light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                      >
                        <Plus className="w-3 h-3 text-[#3D7D62]" />
                        <span>Add Prerequisite</span>
                      </button>
                    </div>

                    {topSteps.length === 0 ? (
                      <p className="text-xs text-[#859A90] italic py-2 light:text-[#5C655E]">
                        No prerequisites yet. Add smaller steps to build your roadmap!
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {topSteps.map((step, stepIdx) => {
                          // Find sub-items nested under this step
                          const subSteps = state.roadmapSteps
                            .filter(s => s.parentId === step.id && !s.isArchived)
                            .sort((a, b) => a.order - b.order);
                          const isStepBranchOpen = expandedStepIds.has(step.id);

                          return (
                            <div key={step.id} className="flex flex-col gap-1.5">
                              {/* Top Step Card */}
                              <div
                                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                                  step.isCompleted
                                    ? 'bg-[#242D29]/50 border-[#3D7D62]/40 light:bg-[#E8F3ED]/30 light:border-[#3D7D62]/30'
                                    : 'bg-[#242D29] border-[#384A41] hover:border-[#3D7D62] light:bg-white light:border-[#E5E3DA]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  {/* Completion Checkbox */}
                                  <button
                                    onClick={() => toggleRoadmapStepComplete(step.id)}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                      step.isCompleted
                                        ? 'bg-[#3D7D62] text-white shadow-xs'
                                        : 'bg-[#1B211E] border border-[#384A41] hover:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                                    }`}
                                  >
                                    <CheckCircle2
                                      className={`w-4 h-4 ${step.isCompleted ? 'text-white' : 'text-[#859A90]/40'}`}
                                    />
                                  </button>

                                  {/* Sub-branch expander if has children */}
                                  {subSteps.length > 0 && (
                                    <button
                                      onClick={() => toggleStepExpand(step.id)}
                                      className="p-0.5 text-[#859A90] hover:text-[#F4F7F4]"
                                    >
                                      {isStepBranchOpen ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <div
                                      className={`text-xs font-bold truncate ${
                                        step.isCompleted
                                          ? 'line-through text-[#859A90] light:text-[#5C655E]'
                                          : 'text-[#F4F7F4] light:text-[#1C221E]'
                                      }`}
                                    >
                                      {step.title}
                                    </div>
                                    {step.description && (
                                      <div className="text-[10px] text-[#859A90] truncate light:text-[#5C655E]">
                                        {step.description}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {step.plannedDate && (
                                    <span className="text-[10px] font-mono text-[#859A90] mr-1 hidden sm:inline">
                                      {step.plannedDate}
                                    </span>
                                  )}

                                  {/* Notes Button */}
                                  <button
                                    onClick={() => {
                                      setNotesModalItem({ type: 'step', item: step });
                                      setNotesDraft(step.notes || '');
                                    }}
                                    className="p-1 rounded-lg text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]"
                                    title="Notes & Timestamps"
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Add Sub-item under this step */}
                                  <button
                                    onClick={() => {
                                      setStepModalGoalId(goal.id);
                                      setStepModalParentId(step.id);
                                      setEditingStep(null);
                                      setIsStepModalOpen(true);
                                    }}
                                    className="p-1 rounded-lg text-[#859A90] hover:text-[#3D7D62]"
                                    title="Add nested sub-item"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Step */}
                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete prerequisite "${step.title}"?`)) {
                                        deleteRoadmapStep(step.id);
                                      }
                                    }}
                                    className="p-1 rounded-lg text-[#859A90] hover:text-red-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Nested Sub-items (2nd tier) */}
                              {isStepBranchOpen && subSteps.length > 0 && (
                                <div className="pl-6 border-l-2 border-[#384A41]/40 ml-4 flex flex-col gap-1.5 my-1">
                                  {subSteps.map(sub => (
                                    <div
                                      key={sub.id}
                                      className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                                        sub.isCompleted
                                          ? 'bg-[#242D29]/30 border-[#3D7D62]/30 light:bg-[#E8F3ED]/20'
                                          : 'bg-[#1B211E] border-[#384A41]/60 light:bg-white light:border-[#E5E3DA]'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <button
                                          onClick={() => toggleRoadmapStepComplete(sub.id)}
                                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                            sub.isCompleted
                                              ? 'bg-[#3D7D62] text-white'
                                              : 'bg-[#242D29] border border-[#384A41]'
                                          }`}
                                        >
                                          <CheckCircle2
                                            className={`w-3.5 h-3.5 ${sub.isCompleted ? 'text-white' : 'text-[#859A90]/40'}`}
                                          />
                                        </button>
                                        <span
                                          className={`text-[11px] font-bold truncate ${
                                            sub.isCompleted
                                              ? 'line-through text-[#859A90]'
                                              : 'text-[#F4F7F4] light:text-[#1C221E]'
                                          }`}
                                        >
                                          {sub.title}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          onClick={() => {
                                            setNotesModalItem({ type: 'step', item: sub });
                                            setNotesDraft(sub.notes || '');
                                          }}
                                          className="p-1 rounded-lg text-[#859A90] hover:text-[#F4F7F4]"
                                        >
                                          <Clock className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (confirm(`Delete sub-step "${sub.title}"?`)) {
                                              deleteRoadmapStep(sub.id);
                                            }
                                          }}
                                          className="p-1 rounded-lg text-[#859A90] hover:text-red-400"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT LEARNING GOAL */}
      {isGoalModalOpen && (
        <GoalEditorModal
          goal={editingGoal}
          onClose={() => setIsGoalModalOpen(false)}
          onSave={goalData => {
            if (editingGoal) {
              updateRoadmapGoal(editingGoal.id, goalData);
            } else {
              addRoadmapGoal(goalData);
            }
            setIsGoalModalOpen(false);
          }}
          tags={state.roadmapTags}
        />
      )}

      {/* MODAL: ADD / EDIT STEP */}
      {isStepModalOpen && (
        <StepEditorModal
          step={editingStep}
          goalId={stepModalGoalId}
          parentId={stepModalParentId}
          onClose={() => setIsStepModalOpen(false)}
          onSave={stepData => {
            if (editingStep) {
              updateRoadmapStep(editingStep.id, stepData);
            } else {
              addRoadmapStep(stepData);
            }
            setIsStepModalOpen(false);
          }}
          tags={state.roadmapTags}
        />
      )}

      {/* MODAL: NOTES & TIMESTAMP CLOCK EDITOR */}
      {notesModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-[#1B211E] border border-[#384A41] p-5 shadow-2xl light:bg-white light:border-[#E5E3DA] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
              <div>
                <h3 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#3D7D62]" /> Notes & Timestamps
                </h3>
                <p className="text-[11px] text-[#859A90] light:text-[#5C655E] truncate max-w-xs">
                  {notesModalItem.item.title}
                </p>
              </div>
              <button
                onClick={() => setNotesModalItem(null)}
                className="w-8 h-8 rounded-full bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timestamp insertion bar */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#242D29] border border-[#384A41] light:bg-[#F7F6F2] light:border-[#E5E3DA]">
              <span className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Insert timestamp at cursor without overwriting:
              </span>
              <button
                onClick={handleInsertTimestamp}
                className="py-1 px-2.5 rounded-lg bg-[#3D7D62] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#2D6A4F] active:scale-95 transition-all"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>+ Insert Stamp</span>
              </button>
            </div>

            <textarea
              ref={notesTextareaRef}
              value={notesDraft}
              onChange={e => setNotesDraft(e.target.value)}
              rows={8}
              placeholder="Record study takeaways, insights, links, and dated progress notes..."
              className="w-full p-3 rounded-2xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] font-mono focus:border-[#3D7D62] focus:outline-none light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setNotesModalItem(null)}
                className="py-2 px-4 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#859A90] light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="py-2 px-5 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-md transition-all"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAG MANAGER */}
      {isTagManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-[#1B211E] border border-[#384A41] p-5 shadow-2xl light:bg-white light:border-[#E5E3DA] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
              <h3 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-1.5">
                <TagIcon className="w-4 h-4 text-[#E5A93C]" /> Manage Custom Tags
              </h3>
              <button
                onClick={() => setIsTagManagerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Create Tag */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="New tag label (e.g. Design, Rust)..."
                className="flex-1 py-1.5 px-3 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
              <input
                type="color"
                value={newTagColor}
                onChange={e => setNewTagColor(e.target.value)}
                className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
              />
              <button
                onClick={() => {
                  if (newTagName.trim()) {
                    addRoadmapTag(newTagName.trim(), newTagColor);
                    setNewTagName('');
                  }
                }}
                className="py-2 px-3 rounded-xl bg-[#3D7D62] text-white text-xs font-bold hover:bg-[#2D6A4F] shadow-xs"
              >
                Add
              </button>
            </div>

            {/* Existing tags list */}
            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto mt-2">
              {state.roadmapTags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#242D29] border border-[#384A41] light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">{tag.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete tag "${tag.name}"? Learning items will remain safe.`)) {
                        deleteRoadmapTag(tag.id);
                      }
                    }}
                    className="p-1 rounded-lg text-[#859A90] hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Goal Editor Modal
const GoalEditorModal: React.FC<{
  goal: RoadmapGoal | null;
  onClose: () => void;
  onSave: (data: Omit<RoadmapGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  tags: RoadmapTag[];
}> = ({ goal, onClose, onSave, tags }) => {
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [plannedStartDate, setPlannedStartDate] = useState(goal?.plannedStartDate || '');
  const [targetCompletionDate, setTargetCompletionDate] = useState(goal?.targetCompletionDate || '');
  const [sessionTime, setSessionTime] = useState(goal?.sessionTime || '');
  const [duration, setDuration] = useState(goal?.estimatedDurationMinutes || 45);
  const [priority, setPriority] = useState<RoadmapGoalPriority>(goal?.priority || 'medium');
  const [status, setStatus] = useState<RoadmapGoalStatus>(goal?.status || 'planned');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(goal?.tagIds || []);
  const [notes, setNotes] = useState(goal?.notes || '');

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev => (prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      plannedStartDate: plannedStartDate || null,
      targetCompletionDate: targetCompletionDate || null,
      sessionTime: sessionTime || null,
      estimatedDurationMinutes: Number(duration) || 45,
      priority,
      status,
      tagIds: selectedTagIds,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#1B211E] border border-[#384A41] p-5 shadow-2xl light:bg-white light:border-[#E5E3DA] flex flex-col gap-3"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
          <h3 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E]">
            {goal ? 'Edit Learning Goal' : 'New Learning Goal'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Master Distributed Systems Architecture"
            className="w-full p-2.5 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="High-level learning vision, key motives, and milestones..."
            className="w-full p-2.5 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
          />
        </div>

        {/* Scheduling Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Start Date</label>
            <input
              type="date"
              value={plannedStartDate}
              onChange={e => setPlannedStartDate(e.target.value)}
              className="w-full p-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Target Date (Optional)</label>
            <input
              type="date"
              value={targetCompletionDate}
              onChange={e => setTargetCompletionDate(e.target.value)}
              className="w-full p-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>
        </div>

        {/* Session Time & Duration */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Session Time (HH:MM)</label>
            <input
              type="time"
              value={sessionTime}
              onChange={e => setSessionTime(e.target.value)}
              className="w-full p-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Est. Duration (mins)</label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full p-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as RoadmapGoalPriority)}
              className="w-full p-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as RoadmapGoalStatus)}
              className="w-full p-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Tags Selection */}
        <div>
          <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Tags</label>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(t => {
              const active = selectedTagIds.includes(t.id);
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => toggleTag(t.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all border ${
                    active
                      ? 'text-white border-transparent shadow-xs scale-105'
                      : 'bg-[#242D29] border-[#384A41] text-[#859A90] light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                  }`}
                  style={{ backgroundColor: active ? t.color : undefined }}
                >
                  #{t.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#384A41]/60 light:border-[#E5E3DA]">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#859A90] light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2 px-5 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-md transition-all"
          >
            {goal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Sub-component: Step Editor Modal
const StepEditorModal: React.FC<{
  step: RoadmapStep | null;
  goalId: string;
  parentId: string | null;
  onClose: () => void;
  onSave: (data: Omit<RoadmapStep, 'id' | 'createdAt' | 'updatedAt'>) => void;
  tags: RoadmapTag[];
}> = ({ step, goalId, parentId, onClose, onSave, tags }) => {
  const [title, setTitle] = useState(step?.title || '');
  const [description, setDescription] = useState(step?.description || '');
  const [plannedDate, setPlannedDate] = useState(step?.plannedDate || '');
  const [sessionTime, setSessionTime] = useState(step?.sessionTime || '');
  const [duration, setDuration] = useState(step?.durationMinutes || 30);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(step?.tagIds || []);
  const [notes, setNotes] = useState(step?.notes || '');

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev => (prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      goalId,
      parentId: parentId || step?.parentId || null,
      title: title.trim(),
      description: description.trim(),
      plannedDate: plannedDate || null,
      sessionTime: sessionTime || null,
      durationMinutes: Number(duration) || 30,
      tagIds: selectedTagIds,
      notes,
      isCompleted: step?.isCompleted || false,
      order: step?.order || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-3xl bg-[#1B211E] border border-[#384A41] p-5 shadow-2xl light:bg-white light:border-[#E5E3DA] flex flex-col gap-3"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
          <h3 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E]">
            {step ? 'Edit Prerequisite Step' : parentId ? 'New Nested Sub-Step' : 'New Prerequisite Step'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Step Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Master Flexbox & CSS Grid Alignment"
            className="w-full p-2.5 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Specific learning outcome or exercise to accomplish..."
            className="w-full p-2.5 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Planned Date</label>
            <input
              type="date"
              value={plannedDate}
              onChange={e => setPlannedDate(e.target.value)}
              className="w-full p-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#859A90] light:text-[#5C655E] mb-1 block">Duration (mins)</label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full p-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#384A41]/60 light:border-[#E5E3DA]">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#859A90] light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2 px-5 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-md transition-all"
          >
            {step ? 'Update Step' : 'Add Step'}
          </button>
        </div>
      </form>
    </div>
  );
};
