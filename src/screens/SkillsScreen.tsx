import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Check, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { NodeItem } from '../types';

export const SkillsScreen: React.FC = () => {
  const {
    state,
    toggleHabit,
    incrementCountHabit,
    updateSliderHabit,
    addSkillNode,
    deleteSkillNode
  } = useApp();

  const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({
    learn: true,
    build: true,
    body: true,
    mind: true,
    care: true,
    faith: true
  });

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newSkill, setNewSkill] = useState<{
    name: string;
    emoji: string;
    parent: string;
    kind: 'check' | 'count' | 'quit' | 'step';
    nature: 'skill' | 'technique' | 'concept' | 'course' | 'habit';
    importance: 'critical' | 'high' | 'medium' | 'low';
    anchor: string;
    routineTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
    unit: string;
    goal: number;
  }>({
    name: '',
    emoji: '⭐',
    parent: 'learn',
    kind: 'check',
    nature: 'skill',
    importance: 'medium',
    anchor: '',
    routineTime: 'morning',
    unit: '',
    goal: 1
  });

  const rootPillars = state.nodes.filter(n => n.p === '0');

  const toggleExpand = (id: string) => {
    setExpandedPillars(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isCheckedToday = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    return state.ev.some(e => e.n === id && e.d === today);
  };

  const getCountToday = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const ev = state.ev.find(e => e.n === id && e.d === today);
    return ev ? ev.c : 0;
  };

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    addSkillNode({
      p: newSkill.parent,
      e: newSkill.emoji || '⭐',
      n: newSkill.name.trim(),
      k: newSkill.kind,
      g: newSkill.goal,
      u: newSkill.unit,
      nature: newSkill.nature,
      importance: newSkill.importance,
      ifThenAnchor: newSkill.anchor || null,
      routineTime: newSkill.routineTime
    });

    setIsAddOpen(false);
    setNewSkill({
      name: '',
      emoji: '⭐',
      parent: 'learn',
      kind: 'check',
      nature: 'skill',
      importance: 'medium',
      anchor: '',
      routineTime: 'morning',
      unit: '',
      goal: 1
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
            <span>⭐</span> Hierarchical Skill Tree
          </h2>
          <p className="text-xs text-[#859A90] light:text-[#5C655E]">
            Structured curriculum across Mind, Body, Craft & Faith
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#22533E] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Skill</span>
        </button>
      </div>

      {/* Pillars Tree */}
      <div className="flex flex-col gap-3">
        {rootPillars.map(pillar => {
          const children = state.nodes.filter(n => n.p === pillar.id);
          const isExpanded = expandedPillars[pillar.id] ?? true;

          return (
            <div
              key={pillar.id}
              className="rounded-2xl bg-[#1B211E] border border-[#384A41] overflow-hidden shadow-sm light:bg-white light:border-[#E5E3DA]"
            >
              {/* Pillar Header */}
              <button
                onClick={() => toggleExpand(pillar.id)}
                className="w-full p-4 flex items-center justify-between bg-[#242D29]/40 hover:bg-[#242D29] transition-colors light:bg-[#EFECE6]/50 light:hover:bg-[#EFECE6]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pillar.e}</span>
                  <div className="text-left">
                    <h3 className="text-sm font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
                      {pillar.n}
                    </h3>
                    <p className="text-[11px] text-[#859A90]">
                      {children.length} sub-skills & rituals
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#2A5643] text-[#E8F3ED] border border-[#3D7D62]">
                    {pillar.importance.toUpperCase()}
                  </span>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-[#859A90]" /> : <ChevronRight className="w-4 h-4 text-[#859A90]" />}
                </div>
              </button>

              {/* Children Nodes */}
              {isExpanded && (
                <div className="p-3 flex flex-col gap-2 border-t border-[#384A41]/50">
                  {children.length === 0 ? (
                    <p className="text-xs text-center py-3 text-[#859A90]">
                      No sub-skills yet. Click "+ New Skill" to add one!
                    </p>
                  ) : (
                    children.map(sub => {
                      const checked = isCheckedToday(sub.id);
                      const count = getCountToday(sub.id);

                      return (
                        <div
                          key={sub.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                            checked
                              ? 'bg-[#2A5643]/20 border-[#3D7D62] light:bg-[#E8F3ED]'
                              : 'bg-[#242D29] border-[#384A41] light:bg-[#EFECE6] light:border-[#E5E3DA]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{sub.e}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
                                  {sub.n}
                                </h4>
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#121413] text-[#859A90] light:bg-[#D5D2C9]">
                                  {sub.nature}
                                </span>
                              </div>
                              {sub.ifThenAnchor && (
                                <p className="text-[10px] text-[#E5A93C] light:text-[#D97706]">
                                  ⚓ [{sub.ifThenAnchor}]
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {sub.k === 'count' ? (
                              <div className="flex items-center gap-1 bg-[#121413] rounded-lg p-1 text-xs">
                                <button
                                  onClick={() => incrementCountHabit(sub.id, -1)}
                                  className="px-1.5 py-0.5 text-[#859A90] hover:text-white"
                                >
                                  -
                                </button>
                                <span className="font-mono text-white font-bold px-1">
                                  {count}/{sub.g}
                                </span>
                                <button
                                  onClick={() => incrementCountHabit(sub.id, 1)}
                                  className="px-1.5 py-0.5 bg-[#2D6A4F] text-white rounded"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => toggleHabit(sub.id)}
                                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                                  checked
                                    ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white'
                                    : 'bg-[#121413] border-[#384A41] text-[#859A90] hover:border-[#3D7D62]'
                                }`}
                              >
                                {checked && <Check className="w-4 h-4" />}
                              </button>
                            )}

                            <button
                              onClick={() => deleteSkillNode(sub.id)}
                              className="p-1.5 rounded-lg text-[#859A90] hover:text-[#D95D39] transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Skill Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSkill}
            className="w-full max-w-md rounded-2xl bg-[#1B211E] border border-[#384A41] p-6 shadow-2xl flex flex-col gap-4 light:bg-white light:border-[#E5E3DA]"
          >
            <h3 className="text-base font-bold text-[#F4F7F4] light:text-[#1C221E]">
              Add New Skill / Ritual
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Emoji (e.g. 💧, 🧘, 📚)"
                value={newSkill.emoji}
                onChange={e => setNewSkill({ ...newSkill, emoji: e.target.value })}
                className="w-16 p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-center text-lg light:bg-[#EFECE6] light:border-[#E5E3DA]"
              />
              <input
                type="text"
                placeholder="Skill or Habit Name"
                required
                value={newSkill.name}
                onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                className="flex-1 p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[#859A90] uppercase">Parent Pillar</label>
                <select
                  value={newSkill.parent}
                  onChange={e => setNewSkill({ ...newSkill, parent: e.target.value })}
                  className="w-full p-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
                >
                  {rootPillars.map(p => (
                    <option key={p.id} value={p.id}>{p.e} {p.n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#859A90] uppercase">Nature</label>
                <select
                  value={newSkill.nature}
                  onChange={e => setNewSkill({ ...newSkill, nature: e.target.value as any })}
                  className="w-full p-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
                >
                  <option value="habit">Habit</option>
                  <option value="skill">Skill</option>
                  <option value="technique">Technique</option>
                  <option value="concept">Concept</option>
                  <option value="course">Course</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[#859A90] uppercase">Interaction Type</label>
                <select
                  value={newSkill.kind}
                  onChange={e => setNewSkill({ ...newSkill, kind: e.target.value as any })}
                  className="w-full p-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
                >
                  <option value="check">Checkmark</option>
                  <option value="count">Counter</option>
                  <option value="quit">Quit (Negative)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#859A90] uppercase">Routine Window</label>
                <select
                  value={newSkill.routineTime}
                  onChange={e => setNewSkill({ ...newSkill, routineTime: e.target.value as any })}
                  className="w-full p-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="anytime">Anytime</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#859A90] uppercase">Anchor Cue (Implementation Intention)</label>
              <input
                type="text"
                placeholder="e.g. Right after pouring morning tea"
                value={newSkill.anchor}
                onChange={e => setNewSkill({ ...newSkill, anchor: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#242D29] text-xs font-bold text-[#859A90] hover:text-[#F4F7F4]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#22533E]"
              >
                Create Skill
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
