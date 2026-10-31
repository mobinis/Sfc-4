import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Check,
  FolderPlus,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  MoreVertical,
  Anchor,
  Compass,
  ArrowRight
} from 'lucide-react';
import { NodeItem } from '../../types';
import { soundManager } from '../../utils/soundHaptics';
import { DateUtils } from '../../utils/dateUtils';

interface AllPillarsOverviewProps {
  onOpenCreatePillar: () => void;
  onOpenEditPillar: (pillar: NodeItem) => void;
  onOpenAddRootSkill: (pillarId: string) => void;
  onOpenEditSkill: (skill: NodeItem) => void;
}

export const AllPillarsOverview: React.FC<AllPillarsOverviewProps> = ({
  onOpenCreatePillar,
  onOpenEditPillar,
  onOpenAddRootSkill,
  onOpenEditSkill
}) => {
  const { state, toggleHabit, incrementCountHabit, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCompact, setIsCompact] = useState(false);

  const today = DateUtils.todayStr();

  // Root pillars (including default, custom, and unassigned archive)
  const rootPillars = useMemo(() => {
    return state.nodes
      .filter(n => n.p === '0')
      .sort((a, b) => {
        // Unassigned archive always at the very bottom
        if (a.id === 'unassigned') return 1;
        if (b.id === 'unassigned') return -1;
        return (a.order ?? 0) - (b.order ?? 0);
      });
  }, [state.nodes]);

  // Expand state per pillar (defaults all to expanded)
  const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    state.nodes.filter(n => n.p === '0').forEach(p => {
      initial[p.id] = true;
    });
    return initial;
  });

  // Expand state for root skills with sub-skills
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});

  const togglePillarExpand = (pillarId: string) => {
    soundManager.playChime('click');
    setExpandedPillars(prev => ({
      ...prev,
      [pillarId]: !prev[pillarId]
    }));
  };

  const toggleSkillExpand = (skillId: string) => {
    soundManager.playChime('click');
    setExpandedSkills(prev => ({
      ...prev,
      [skillId]: !prev[skillId]
    }));
  };

  const toggleAllPillars = (expand: boolean) => {
    soundManager.playChime('click');
    const next: Record<string, boolean> = {};
    rootPillars.forEach(p => {
      next[p.id] = expand;
    });
    setExpandedPillars(next);
  };

  const isCheckedToday = (id: string) => state.ev.some(e => e.n === id && e.d === today);
  const getCountToday = (id: string) => {
    const ev = state.ev.find(e => e.n === id && e.d === today);
    return ev ? ev.c : 0;
  };

  // Helper: Get all recursive descendants of a node
  const getAllDescendants = (parentId: string): NodeItem[] => {
    const directChildren = state.nodes.filter(n => n.p === parentId);
    let all = [...directChildren];
    directChildren.forEach(child => {
      all = [...all, ...getAllDescendants(child.id)];
    });
    return all;
  };

  // Filtered pillars and their skills based on search
  const filteredPillarData = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase();

    return rootPillars.map(pillar => {
      const rootSkills = state.nodes.filter(n => n.p === pillar.id);
      const allDescendants = getAllDescendants(pillar.id);

      // Check if pillar itself matches
      const pillarMatches =
        cleanQuery === '' ||
        pillar.n.toLowerCase().includes(cleanQuery) ||
        (pillar.description && pillar.description.toLowerCase().includes(cleanQuery));

      // Filter root skills matching or with matching descendants
      const matchingRootSkills = rootSkills.filter(skill => {
        if (cleanQuery === '') return true;
        const skillMatches =
          skill.n.toLowerCase().includes(cleanQuery) ||
          (skill.ifThenAnchor && skill.ifThenAnchor.toLowerCase().includes(cleanQuery)) ||
          skill.nature.toLowerCase().includes(cleanQuery);

        const childMatches = getAllDescendants(skill.id).some(child =>
          child.n.toLowerCase().includes(cleanQuery) ||
          (child.ifThenAnchor && child.ifThenAnchor.toLowerCase().includes(cleanQuery))
        );

        return skillMatches || childMatches || pillarMatches;
      });

      return {
        pillar,
        rootSkills: matchingRootSkills,
        totalItemsCount: allDescendants.length,
        visible: pillarMatches || matchingRootSkills.length > 0
      };
    }).filter(item => item.visible);
  }, [rootPillars, state.nodes, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      {/* Overview Header Controls */}
      <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-xs flex flex-col gap-3.5 light:bg-white light:border-[#E5E3DA]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌐</span>
              <h2 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E] tracking-tight">
                All Pillars Overview
              </h2>
            </div>
            <p className="text-[11px] text-[#859A90] light:text-[#5C655E] mt-0.5">
              Comprehensive live breakdown across all {rootPillars.length} life domains
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Create Pillar Action */}
            <button
              onClick={() => {
                soundManager.playChime('click');
                onOpenCreatePillar();
              }}
              className="h-10 px-3.5 rounded-xl bg-[#E5A93C] hover:bg-[#D4982B] active:scale-95 text-xs font-bold text-[#121413] shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Pillar</span>
            </button>
          </div>
        </div>

        {/* Search Bar & View Density Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-[#384A41]/60 light:border-[#E5E3DA]">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#859A90]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search skills, anchors or domains across all pillars..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90] focus:outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#859A90] hover:text-[#F4F7F4]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            {/* Expand / Collapse All */}
            <button
              onClick={() => toggleAllPillars(true)}
              className="py-1.5 px-2.5 rounded-xl bg-[#242D29] text-[11px] font-bold text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:text-[#5C655E]"
              title="Expand All Pillars"
            >
              Expand All
            </button>
            <button
              onClick={() => toggleAllPillars(false)}
              className="py-1.5 px-2.5 rounded-xl bg-[#242D29] text-[11px] font-bold text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:text-[#5C655E]"
              title="Collapse All Pillars"
            >
              Collapse
            </button>

            {/* Compact / Detailed Density Toggle */}
            <button
              onClick={() => {
                soundManager.playChime('click');
                setIsCompact(!isCompact);
              }}
              className="py-1.5 px-2.5 rounded-xl bg-[#242D29] text-[11px] font-bold text-[#859A90] hover:text-[#F4F7F4] flex items-center gap-1 light:bg-[#F7F6F2] light:text-[#5C655E]"
              title={isCompact ? 'Switch to Detailed View' : 'Switch to Compact View'}
            >
              {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              <span>{isCompact ? 'Detailed' : 'Compact'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vertically Scrollable Stack of Pillar Accordion Cards */}
      <div className="flex flex-col gap-3">
        {filteredPillarData.map(({ pillar, rootSkills, totalItemsCount }) => {
          const isExpanded = !!expandedPillars[pillar.id];
          const pillarColor = pillar.color || '#3D7D62';

          // Completed habits under this pillar today
          const allPillarNodes = getAllDescendants(pillar.id);
          const completedCount = allPillarNodes.filter(n => isCheckedToday(n.id)).length;
          const completionPct = allPillarNodes.length > 0
            ? Math.round((completedCount / allPillarNodes.length) * 100)
            : 0;

          return (
            <div
              key={pillar.id}
              className={`rounded-3xl bg-[#1B211E] border transition-all light:bg-white shadow-xs ${
                pillar.isCustom
                  ? 'border-[#384A41] hover:border-[#3D7D62]'
                  : 'border-[#384A41] light:border-[#E5E3DA]'
              }`}
            >
              {/* Pillar Header Card */}
              <div
                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => togglePillarExpand(pillar.id)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs"
                    style={{ backgroundColor: `${pillarColor}25`, border: `1.5px solid ${pillarColor}` }}
                  >
                    <span>{pillar.e}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E] truncate">
                        {pillar.n}
                      </h3>
                      {pillar.isCustom && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#242D29] text-[#E5A93C] font-bold light:bg-[#FEF3C7]">
                          Custom
                        </span>
                      )}
                      {pillar.id === 'unassigned' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#242D29] text-[#859A90] font-bold light:bg-[#F7F6F2]">
                          Retained Archive
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#859A90] light:text-[#5C655E] mt-0.5">
                      <span>{rootSkills.length} root skills</span>
                      <span>·</span>
                      <span>{totalItemsCount} total items</span>
                      {allPillarNodes.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[#3D7D62] font-bold">
                            {completionPct}% today
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  {/* Quick Add Root Skill Button */}
                  <button
                    onClick={() => {
                      soundManager.playChime('click');
                      onOpenAddRootSkill(pillar.id);
                    }}
                    className="h-8 px-2.5 rounded-xl bg-[#242D29] border border-[#384A41] hover:border-[#3D7D62] text-xs font-bold text-[#F4F7F4] flex items-center gap-1 light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E] transition-all"
                    title={`Add Root Skill under ${pillar.n}`}
                  >
                    <Plus className="w-3.5 h-3.5 text-[#3D7D62]" />
                    <span className="hidden sm:inline">+ Root Skill</span>
                  </button>

                  {/* Edit Pillar Trigger */}
                  <button
                    onClick={() => {
                      soundManager.playChime('click');
                      onOpenEditPillar(pillar);
                    }}
                    className="p-1.5 rounded-xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#5C655E] transition-all"
                    title="Edit Pillar Settings"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Expand Chevron */}
                  <button
                    onClick={() => togglePillarExpand(pillar.id)}
                    className="p-1.5 rounded-xl bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:text-[#5C655E]"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-3.5 pt-0 border-t border-[#384A41]/40 flex flex-col gap-2 light:border-[#E5E3DA]">
                  {pillar.description && (
                    <p className="text-[11px] text-[#859A90] light:text-[#5C655E] italic py-1">
                      "{pillar.description}"
                    </p>
                  )}

                  {rootSkills.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-[#242D29]/50 border border-dashed border-[#384A41] flex flex-col items-center justify-center text-center gap-2 light:bg-[#F7F6F2]/50">
                      <span className="text-2xl">🌱</span>
                      <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
                        No skills in this pillar yet
                      </div>
                      <p className="text-[11px] text-[#859A90] max-w-xs">
                        Create root skills or link existing habits to cultivate mastery in {pillar.n}.
                      </p>
                      <button
                        onClick={() => onOpenAddRootSkill(pillar.id)}
                        className="mt-1 h-8 px-3.5 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Root Skill</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {rootSkills.map(skill => {
                        const subSkills = state.nodes.filter(n => n.p === skill.id);
                        const isSkillExpanded = !!expandedSkills[skill.id];
                        const checked = isCheckedToday(skill.id);
                        const count = getCountToday(skill.id);

                        return (
                          <div
                            key={skill.id}
                            className={`rounded-2xl border transition-all ${
                              checked
                                ? 'bg-[#242D29]/40 border-[#3D7D62]/40 light:bg-[#E8F3ED]/30'
                                : 'bg-[#242D29] border-[#384A41]/70 hover:border-[#3D7D62]/50 light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                            } ${isCompact ? 'p-2' : 'p-3'}`}
                          >
                            {/* Skill Main Row */}
                            <div className="flex items-center justify-between gap-2.5">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="text-lg shrink-0">{skill.e}</span>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E] truncate">
                                      {skill.n}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#1B211E] text-[#859A90] uppercase font-bold light:bg-white">
                                      {skill.nature}
                                    </span>
                                    {skill.importance === 'critical' && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#2E2308] text-[#E5A93C] font-bold">
                                        ⭐ Critical
                                      </span>
                                    )}
                                  </div>

                                  {!isCompact && (
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[#859A90] light:text-[#5C655E]">
                                      {skill.ifThenAnchor && (
                                        <span className="flex items-center gap-1 truncate max-w-[180px]">
                                          <Anchor className="w-3 h-3 text-[#E5A93C] shrink-0" />
                                          {skill.ifThenAnchor}
                                        </span>
                                      )}
                                      {skill.routineTime && (
                                        <span>
                                          {skill.routineTime === 'morning' ? '🌅 Morning' : skill.routineTime === 'afternoon' ? '☀️ Afternoon' : skill.routineTime === 'evening' ? '🌙 Evening' : '🔄 Flexible'}
                                        </span>
                                      )}
                                      {subSkills.length > 0 && (
                                        <span className="font-mono">
                                          ({subSkills.length} sub-items)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Interactive check / count / action controls */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {skill.k === 'count' ? (
                                  <div className="flex items-center gap-1 bg-[#1B211E] border border-[#384A41] rounded-xl px-2 py-1 light:bg-white light:border-[#E5E3DA]">
                                    <button
                                      onClick={() => incrementCountHabit(skill.id, -1)}
                                      className="text-xs font-bold text-[#859A90] hover:text-white px-1"
                                    >
                                      -
                                    </button>
                                    <span className="text-xs font-mono font-bold text-[#F4F7F4] light:text-[#1C221E] min-w-[20px] text-center">
                                      {count}
                                    </span>
                                    <button
                                      onClick={() => incrementCountHabit(skill.id, 1)}
                                      className="text-xs font-bold text-[#3D7D62] hover:text-[#43765E] px-1"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => toggleHabit(skill.id)}
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                      checked
                                        ? 'bg-[#3D7D62] text-white shadow-xs'
                                        : 'bg-[#1B211E] border border-[#384A41] text-[#859A90] hover:border-[#3D7D62] light:bg-white light:border-[#E5E3DA]'
                                    }`}
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Edit Skill */}
                                <button
                                  onClick={() => onOpenEditSkill(skill)}
                                  className="p-1.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] light:bg-white light:border-[#E5E3DA]"
                                  title="Edit Skill"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {/* Expand Nested Sub-Skills */}
                                {subSkills.length > 0 && (
                                  <button
                                    onClick={() => toggleSkillExpand(skill.id)}
                                    className="p-1.5 rounded-xl bg-[#1B211E] text-[#859A90] hover:text-[#F4F7F4] light:bg-white"
                                  >
                                    {isSkillExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Nested Sub-Skills Tree (Indented Branch) */}
                            {isSkillExpanded && subSkills.length > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-[#384A41]/40 flex flex-col gap-1.5 pl-4 border-l-2 border-[#384A41]/60 ml-2">
                                {subSkills.map(child => {
                                  const childChecked = isCheckedToday(child.id);
                                  return (
                                    <div
                                      key={child.id}
                                      className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-[#1B211E] border border-[#384A41]/60 text-xs light:bg-white light:border-[#E5E3DA]"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-sm shrink-0">↳ {child.e}</span>
                                        <span className="font-bold text-[#F4F7F4] light:text-[#1C221E] truncate">
                                          {child.n}
                                        </span>
                                        <span className="text-[8px] px-1 py-0.2 rounded-md bg-[#242D29] text-[#859A90] uppercase font-bold">
                                          {child.nature}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => toggleHabit(child.id)}
                                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                            childChecked
                                              ? 'bg-[#3D7D62] text-white'
                                              : 'bg-[#242D29] text-[#859A90] hover:border-[#3D7D62]'
                                          }`}
                                        >
                                          <Check className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => onOpenEditSkill(child)}
                                          className="p-1 rounded-lg text-[#859A90] hover:text-white"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
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
    </div>
  );
};
