import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FutureLearningView } from '../components/roadmap/FutureLearningView';
import { ProgressionLabView } from '../components/progression/ProgressionLabView';
import { SkillsScreen } from './SkillsScreen';
import { LearnScreen } from './LearnScreen';
import { BookLibraryScreen } from './BookLibraryScreen';
import { VideoLibraryScreen } from './VideoLibraryScreen';
import { AllPillarsOverview } from '../components/pillars/AllPillarsOverview';
import { PillarEditorModal } from '../components/pillars/PillarEditorModal';
import { SkillEditorModal } from '../components/pillars/SkillEditorModal';
import {
  Sparkles,
  GitBranch,
  Brain,
  BookOpen,
  Compass,
  List,
  Network,
  Plus,
  Check,
  MoreVertical,
  X,
  Target,
  Edit2,
  Trash2,
  Flame,
  ArrowRight,
  Layers
} from 'lucide-react';
import { NodeItem, LearnItem } from '../types';
import { soundManager } from '../utils/soundHaptics';

export const GrowthScreen: React.FC = () => {
  const { state, addSkillNode, deleteSkillNode, toggleHabit, awardXp, showToast } = useApp();

  const [activeSection, setActiveSection] = useState<'roadmap' | 'lab' | 'skills' | 'recall' | 'library'>('lab');
  const [skillsViewMode, setSkillsViewMode] = useState<'all' | 'outline' | 'mindmap'>('all');
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'books' | 'videos'>('all');

  // Pillar & Skill Modals
  const [isPillarModalOpen, setIsPillarModalOpen] = useState(false);
  const [pillarToEdit, setPillarToEdit] = useState<NodeItem | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<NodeItem | null>(null);
  const [defaultParentForSkill, setDefaultParentForSkill] = useState<string>('learn');

  // Contextual Bottom Sheet for Skill Actions
  const [selectedSkillForAction, setSelectedSkillForAction] = useState<NodeItem | null>(null);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [childName, setChildName] = useState('');
  const [childEmoji, setChildEmoji] = useState('🌱');
  const [childNature, setChildNature] = useState<'skill' | 'technique' | 'concept' | 'course' | 'habit'>('technique');

  // Mind map zoom/selection
  const [selectedPillarId, setSelectedPillarId] = useState<string>('learn');

  const rootPillars = state.nodes.filter(n => n.p === '0');

  const isCheckedToday = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    return state.ev.some(e => e.n === id && e.d === today);
  };

  const handleAddChildSkill = () => {
    if (!selectedSkillForAction || !childName.trim()) return;
    addSkillNode({
      p: selectedSkillForAction.id,
      e: childEmoji || '🌱',
      n: childName.trim(),
      k: 'check',
      g: 1,
      nature: childNature,
      importance: 'medium',
      routineTime: 'morning'
    });
    setChildName('');
    setIsAddChildOpen(false);
    setSelectedSkillForAction(null);
    showToast(`Added sub-skill under ${selectedSkillForAction.n}`);
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Growth Hub Header Navigation */}
      <div className="flex flex-col gap-3 p-3.5 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <div>
              <h2 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E] tracking-tight">
                Growth & Learning Hub
              </h2>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Skill trees, Feynman active recall, curated library & roadmap
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Navigation Segmented Tabs */}
        <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-[#242D29] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
          <button
            onClick={() => {
              soundManager.playChime('click');
              setActiveSection('lab');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeSection === 'lab'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span className="text-[11px]">Lab</span>
          </button>

          <button
            onClick={() => {
              soundManager.playChime('click');
              setActiveSection('roadmap');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeSection === 'roadmap'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="text-[11px]">Roadmap</span>
          </button>

          <button
            onClick={() => {
              soundManager.playChime('click');
              setActiveSection('skills');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeSection === 'skills'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="text-[11px]">Skills</span>
          </button>

          <button
            onClick={() => {
              soundManager.playChime('click');
              setActiveSection('recall');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeSection === 'recall'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="text-[11px]">Recall</span>
          </button>

          <button
            onClick={() => {
              soundManager.playChime('click');
              setActiveSection('library');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeSection === 'library'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[11px]">Library</span>
          </button>
        </div>
      </div>

      {/* Prominent Quick-Switch Banner to Lab or Roadmap if not currently viewing them */}
      {activeSection !== 'lab' && activeSection !== 'roadmap' && (
        <div
          onClick={() => setActiveSection('lab')}
          className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#242D29] to-[#1B211E] border border-[#3D7D62]/40 hover:border-[#3D7D62] cursor-pointer transition-all active:scale-99 light:from-[#E8F3ED] light:to-white light:border-[#3D7D62]/30"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎯</span>
            <div>
              <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
                Progression Lab Active
              </div>
              <div className="text-[10px] text-[#859A90] light:text-[#5C655E]">
                {state.measurableTargets.length} measurable targets • {state.activityRecords.length} activity records logged
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-[#3D7D62] flex items-center gap-1">
            Open Lab <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      )}

      {/* 1. SECTION: PROGRESSION LAB */}
      {activeSection === 'lab' && <ProgressionLabView />}

      {/* 2. SECTION: FUTURE LEARNING ROADMAP */}
      {activeSection === 'roadmap' && <FutureLearningView />}

      {/* 3. SECTION: SKILLS (Mind Map & Outline views with Contextual Actions) */}
      {activeSection === 'skills' && (
        <div className="flex flex-col gap-3">
          {/* 3-Way View Switcher: All Pillars vs Outline vs Mind Map */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-2xl bg-[#1B211E] border border-[#384A41] light:bg-white light:border-[#E5E3DA]">
            <span className="text-xs font-bold text-[#859A90] light:text-[#5C655E] uppercase tracking-wider pl-1">
              Skill Tree Views
            </span>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-[#242D29] border border-[#384A41] p-0.5 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
                <button
                  onClick={() => {
                    soundManager.playChime('click');
                    setSkillsViewMode('all');
                  }}
                  className={`py-1 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    skillsViewMode === 'all'
                      ? 'bg-[#3D7D62] text-white shadow-xs'
                      : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Pillars</span>
                </button>
                <button
                  onClick={() => {
                    soundManager.playChime('click');
                    setSkillsViewMode('outline');
                  }}
                  className={`py-1 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    skillsViewMode === 'outline'
                      ? 'bg-[#3D7D62] text-white shadow-xs'
                      : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Outline</span>
                </button>
                <button
                  onClick={() => {
                    soundManager.playChime('click');
                    setSkillsViewMode('mindmap');
                  }}
                  className={`py-1 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    skillsViewMode === 'mindmap'
                      ? 'bg-[#3D7D62] text-white shadow-xs'
                      : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Mind Map</span>
                </button>
              </div>

              {/* Quick Pillar Creation Launcher */}
              <button
                onClick={() => {
                  soundManager.playChime('click');
                  setPillarToEdit(null);
                  setIsPillarModalOpen(true);
                }}
                className="py-1 px-2.5 rounded-xl bg-[#E5A93C] hover:bg-[#D4982B] text-xs font-bold text-[#121413] shadow-xs flex items-center gap-1 transition-all"
                title="Create Custom Pillar"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pillar</span>
              </button>
            </div>
          </div>

          {/* 1. ALL PILLARS OVERVIEW VIEW */}
          {skillsViewMode === 'all' && (
            <AllPillarsOverview
              onOpenCreatePillar={() => {
                setPillarToEdit(null);
                setIsPillarModalOpen(true);
              }}
              onOpenEditPillar={pillar => {
                setPillarToEdit(pillar);
                setIsPillarModalOpen(true);
              }}
              onOpenAddRootSkill={pillarId => {
                setSkillToEdit(null);
                setDefaultParentForSkill(pillarId);
                setIsSkillModalOpen(true);
              }}
              onOpenEditSkill={skill => {
                setSkillToEdit(skill);
                setIsSkillModalOpen(true);
              }}
            />
          )}

          {/* 2. OUTLINE TREE VIEW */}
          {skillsViewMode === 'outline' && (
            <div className="flex flex-col gap-3">
              {rootPillars.map(pillar => {
                const subNodes = state.nodes.filter(n => n.p === pillar.id);
                const pillarColor = pillar.color || '#3D7D62';
                return (
                  <div
                    key={pillar.id}
                    className="p-3.5 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA]"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl">{pillar.e}</span>
                        <h3 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E] truncate">
                          {pillar.n}
                        </h3>
                        {pillar.isCustom && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#242D29] text-[#E5A93C] font-bold">
                            Custom
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#242D29] text-[#859A90] font-mono light:bg-[#F7F6F2]">
                          {subNodes.length} items
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setPillarToEdit(pillar);
                            setIsPillarModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                          title="Edit Pillar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setSkillToEdit(null);
                            setDefaultParentForSkill(pillar.id);
                            setIsSkillModalOpen(true);
                          }}
                          className="py-1 px-2.5 rounded-xl bg-[#242D29] border border-[#384A41] hover:border-[#3D7D62] text-[11px] font-bold text-[#F4F7F4] flex items-center gap-1 light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
                        >
                          <Plus className="w-3 h-3 text-[#3D7D62]" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    {/* Sub-skill rows with Contextual Action Sheet trigger */}
                    {subNodes.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-[#242D29]/50 border border-dashed border-[#384A41] text-center text-xs text-[#859A90]">
                        No skills in this pillar yet. Tap '+ Add' to create your first root skill.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {subNodes.map(node => {
                          const checked = isCheckedToday(node.id);
                          return (
                            <div
                              key={node.id}
                              className={`flex items-center justify-between p-2 rounded-2xl border transition-all ${
                                checked
                                  ? 'bg-[#242D29]/50 border-[#3D7D62]/40 light:bg-[#E8F3ED]/30'
                                  : 'bg-[#242D29] border-[#384A41]/70 hover:border-[#3D7D62]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="text-base shrink-0">{node.e}</span>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E] truncate">
                                    {node.n}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#1B211E] text-[#859A90] uppercase font-bold light:bg-white">
                                      {node.nature}
                                    </span>
                                    {node.ifThenAnchor && (
                                      <span className="text-[10px] text-[#859A90] truncate max-w-[120px] light:text-[#5C655E]">
                                        ⚓ {node.ifThenAnchor}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleHabit(node.id)}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                    checked
                                      ? 'bg-[#3D7D62] text-white'
                                      : 'bg-[#1B211E] border border-[#384A41] text-[#859A90]'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    soundManager.playChime('click');
                                    setSelectedSkillForAction(node);
                                  }}
                                  className="p-1.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] active:scale-95 transition-all light:bg-white light:border-[#E5E3DA] light:text-[#5C655E]"
                                  title="Skill Actions"
                                >
                                  <MoreVertical className="w-4 h-4" />
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

          {/* 3. MIND MAP VIEW */}
          {skillsViewMode === 'mindmap' && (
            <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] light:bg-white light:border-[#E5E3DA] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#859A90] uppercase tracking-wider">
                    Mind Map Radial Hub
                  </span>
                  <p className="text-[11px] text-[#859A90]">Select any default or custom pillar to branch</p>
                </div>

                <button
                  onClick={() => {
                    soundManager.playChime('click');
                    setPillarToEdit(null);
                    setIsPillarModalOpen(true);
                  }}
                  className="py-1 px-2.5 rounded-xl bg-[#E5A93C] text-[#121413] text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Pillar</span>
                </button>
              </div>

              {/* Pillar Selector Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {rootPillars.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      soundManager.playChime('click');
                      setSelectedPillarId(p.id);
                    }}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                      selectedPillarId === p.id
                        ? 'bg-[#3D7D62] text-white shadow-xs'
                        : 'bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                    }`}
                  >
                    <span>{p.e}</span>
                    <span>{p.n}</span>
                    {p.isCustom && <span className="text-[9px] text-[#E5A93C]">★</span>}
                  </button>
                ))}
              </div>

              {/* Interactive Visual Graph representation */}
              <div className="p-4 rounded-2xl bg-[#121413] border border-[#384A41]/70 light:bg-[#FAF9F5] light:border-[#E5E3DA]">
                {(() => {
                  const activePillar = rootPillars.find(p => p.id === selectedPillarId) || rootPillars[0];
                  if (!activePillar) return null;
                  const childNodes = state.nodes.filter(n => n.p === activePillar.id);
                  const pillarColor = activePillar.color || '#3D7D62';

                  return (
                    <div className="flex flex-col items-center gap-4">
                      {/* Central Pillar Node */}
                      <div
                        className="py-2.5 px-5 rounded-2xl text-white font-black text-sm shadow-md flex items-center gap-2"
                        style={{ backgroundColor: pillarColor }}
                      >
                        <span className="text-xl">{activePillar.e}</span>
                        <span>{activePillar.n} Pillar</span>
                      </div>

                      {/* Branching SVG Visual Connectors */}
                      <div className="w-full h-8 flex justify-center">
                        <svg className="w-full h-full" viewBox="0 0 300 32" preserveAspectRatio="none">
                          <line x1="150" y1="0" x2="150" y2="16" stroke="#384A41" strokeWidth="2" />
                          <line x1="30" y1="16" x2="270" y2="16" stroke="#384A41" strokeWidth="2" />
                        </svg>
                      </div>

                      {/* Child Skill Nodes Grid */}
                      {childNodes.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-[#1B211E] border border-dashed border-[#384A41] text-center text-xs text-[#859A90] w-full">
                          No skills connected to this pillar yet.
                          <div className="mt-2">
                            <button
                              onClick={() => {
                                setSkillToEdit(null);
                                setDefaultParentForSkill(activePillar.id);
                                setIsSkillModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#3D7D62] text-white font-bold text-xs"
                            >
                              + Add First Skill
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                          {childNodes.map(child => (
                            <div
                              key={child.id}
                              onClick={() => setSelectedSkillForAction(child)}
                              className="p-3 rounded-2xl bg-[#1B211E] border border-[#384A41] hover:border-[#3D7D62] cursor-pointer transition-all flex items-center justify-between light:bg-white light:border-[#E5E3DA]"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-lg">{child.e}</span>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E] truncate">
                                    {child.n}
                                  </div>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#242D29] text-[#859A90] uppercase font-bold light:bg-[#F7F6F2]">
                                    {child.nature}
                                  </span>
                                </div>
                              </div>
                              <MoreVertical className="w-4 h-4 text-[#859A90]" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. SECTION: RECALL (Teach-Back & Spaced Repetition) */}
      {activeSection === 'recall' && <LearnScreen />}

      {/* 4. SECTION: LIBRARY (Unified Videos & Books behind simple filters) */}
      {activeSection === 'library' && (
        <div className="flex flex-col gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#1B211E] border border-[#384A41] light:bg-white light:border-[#E5E3DA]">
            <button
              onClick={() => setLibraryFilter('all')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                libraryFilter === 'all'
                  ? 'bg-[#3D7D62] text-white'
                  : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
              }`}
            >
              All Resources
            </button>
            <button
              onClick={() => setLibraryFilter('books')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                libraryFilter === 'books'
                  ? 'bg-[#3D7D62] text-white'
                  : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
              }`}
            >
              📚 Reading Field Guides ({state.bookResources.length})
            </button>
            <button
              onClick={() => setLibraryFilter('videos')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                libraryFilter === 'videos'
                  ? 'bg-[#3D7D62] text-white'
                  : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
              }`}
            >
              🎥 Masterclasses ({state.videoResources.length})
            </button>
          </div>

          {/* Display Sub-library */}
          {libraryFilter === 'all' && (
            <div className="flex flex-col gap-4">
              <BookLibraryScreen />
              <div className="h-px bg-[#384A41]/60 my-2" />
              <VideoLibraryScreen />
            </div>
          )}
          {libraryFilter === 'books' && <BookLibraryScreen />}
          {libraryFilter === 'videos' && <VideoLibraryScreen />}
        </div>
      )}

      {/* CONTEXTUAL ACTION BOTTOM SHEET FOR SKILLS */}
      {selectedSkillForAction && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setSelectedSkillForAction(null)} />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-[#1B211E] border-t border-[#384A41] p-5 shadow-2xl light:bg-white light:border-[#E5E3DA] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedSkillForAction.e}</span>
                <div>
                  <h3 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E]">
                    {selectedSkillForAction.n}
                  </h3>
                  <span className="text-[10px] text-[#859A90] uppercase font-bold">
                    {selectedSkillForAction.nature} • {selectedSkillForAction.importance}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSkillForAction(null)}
                className="w-8 h-8 rounded-full bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions list */}
            <div className="flex flex-col gap-2 mt-1">
              {/* Action 1: Add Child Sub-skill */}
              <button
                onClick={() => setIsAddChildOpen(true)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#242D29] border border-[#384A41] hover:border-[#3D7D62] text-left transition-all light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                <Plus className="w-4 h-4 text-[#3D7D62]" />
                <div>
                  <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">Add Sub-Skill</div>
                  <div className="text-[10px] text-[#859A90] light:text-[#5C655E]">Nest a new technique or micro-habit underneath</div>
                </div>
              </button>

              {/* Action 2: Check-in / Toggle */}
              <button
                onClick={() => {
                  soundManager.playChime('success');
                  toggleHabit(selectedSkillForAction.id);
                  setSelectedSkillForAction(null);
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#242D29] border border-[#384A41] hover:border-[#3D7D62] text-left transition-all light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                <Check className="w-4 h-4 text-[#E5A93C]" />
                <div>
                  <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">Check In Today (+15 XP)</div>
                  <div className="text-[10px] text-[#859A90] light:text-[#5C655E]">Log habit repetition for today</div>
                </div>
              </button>

              {/* Action 3: Edit Skill */}
              <button
                onClick={() => {
                  setSkillToEdit(selectedSkillForAction);
                  setIsSkillModalOpen(true);
                  setSelectedSkillForAction(null);
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#242D29] border border-[#384A41] hover:border-[#3D7D62] text-left transition-all light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                <Edit2 className="w-4 h-4 text-[#859A90]" />
                <div>
                  <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">Edit Skill Details</div>
                  <div className="text-[10px] text-[#859A90] light:text-[#5C655E]">Rename, change nature, routine window, anchor cue & notes</div>
                </div>
              </button>

              {/* Action 4: Delete Skill */}
              {selectedSkillForAction.p !== '0' && (
                <button
                  onClick={() => {
                    if (confirm(`Remove skill "${selectedSkillForAction.n}"?`)) {
                      deleteSkillNode(selectedSkillForAction.id);
                      setSelectedSkillForAction(null);
                    }
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-red-950/30 border border-red-800/40 hover:border-red-600 text-left transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <div>
                    <div className="text-xs font-bold text-red-400">Delete Skill</div>
                    <div className="text-[10px] text-red-300/70">Remove from skill tree</div>
                  </div>
                </button>
              )}
            </div>

            {/* Nested Add Sub-skill form if open */}
            {isAddChildOpen && (
              <div className="mt-2 p-3 rounded-2xl bg-[#121413] border border-[#384A41] flex flex-col gap-2 light:bg-[#FAF9F5] light:border-[#E5E3DA]">
                <div className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
                  Add Child to {selectedSkillForAction.n}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={childEmoji}
                    onChange={e => setChildEmoji(e.target.value)}
                    className="w-12 text-center p-2 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs light:bg-white"
                  />
                  <input
                    type="text"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    placeholder="Sub-skill name..."
                    className="flex-1 p-2 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    onClick={() => setIsAddChildOpen(false)}
                    className="py-1 px-3 rounded-lg text-xs font-bold text-[#859A90]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddChildSkill}
                    className="py-1 px-4 rounded-lg bg-[#3D7D62] text-white text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Pillar Editor / Creator Modal */}
      <PillarEditorModal
        isOpen={isPillarModalOpen}
        onClose={() => setIsPillarModalOpen(false)}
        pillarToEdit={pillarToEdit}
      />

      {/* Skill Editor / Creator Modal */}
      <SkillEditorModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        skillToEdit={skillToEdit}
        defaultParentId={defaultParentForSkill}
      />
    </div>
  );
};
