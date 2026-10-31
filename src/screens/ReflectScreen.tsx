import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Heart,
  Lock,
  Wind,
  Waves,
  Sparkles,
  Send,
  Check,
  ChevronDown,
  ChevronRight,
  Smile,
  Tag,
  Clock
} from 'lucide-react';
import { soundManager } from '../utils/soundHaptics';
import { PinVerificationModal } from '../components/modals/PinVerificationModal';
import { BreathPacerModal } from '../components/modals/BreathPacerModal';
import { ImpactDeedModal } from '../components/impact/ImpactDeedModal';
import { DateUtils } from '../utils/dateUtils';

export const ReflectScreen: React.FC = () => {
  const {
    state,
    isUnlocked,
    saveJournalEntry,
    addGoodDeed,
    logImpactDeed,
    setActiveTab,
    showToast
  } = useApp();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isBreathModalOpen, setIsBreathModalOpen] = useState(false);
  const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);

  // Daily Mood check-in (0: Difficult, 1: Low, 2: Neutral, 3: Good, 4: Great)
  const today = DateUtils.todayStr();
  const existingTodayEntry = state.jr.find(j => j.d === today);
  const [selectedMood, setSelectedMood] = useState<number>(existingTodayEntry ? existingTodayEntry.m : 3);
  const [moodSaved, setMoodSaved] = useState<boolean>(!!existingTodayEntry);

  // Optional Journal Entry
  const [entryText, setEntryText] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('#focus, #peace');

  // Secondary Kindness / Self-Compassion section
  const [isKindnessExpanded, setIsKindnessExpanded] = useState<boolean>(false);
  const [deedText, setDeedText] = useState<string>('');
  const [deedTarget, setDeedTarget] = useState<'self' | 'others'>('others');

  const isLocked = state.pinLockEnabled && state.lockJournal && !isUnlocked;

  // 5 clear mood labels per requirements
  const moodLevels = [
    { level: 0, label: 'Difficult', emoji: '😞', color: '#D95D39' },
    { level: 1, label: 'Low', emoji: '😕', color: '#E5A93C' },
    { level: 2, label: 'Neutral', emoji: '😐', color: '#859A90' },
    { level: 3, label: 'Good', emoji: '🙂', color: '#3D7D62' },
    { level: 4, label: 'Great', emoji: '😄', color: '#2D6A4F' }
  ];

  if (isLocked) {
    return (
      <div className="rounded-3xl bg-[#1B211E] border border-[#384A41] p-10 flex flex-col items-center justify-center text-center gap-4 light:bg-white light:border-[#E5E3DA]">
        <div className="w-16 h-16 rounded-3xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] flex items-center justify-center text-3xl shadow-lg light:bg-[#FEF3C7]">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E]">
            Confidential Reflection Sanctuary
          </h3>
          <p className="text-xs text-[#859A90] light:text-[#5C655E] mt-1 max-w-xs">
            Protected with local SHA-256 PIN authentication for absolute offline privacy.
          </p>
        </div>
        <button
          onClick={() => setIsPinModalOpen(true)}
          className="py-3 px-6 rounded-2xl bg-[#3D7D62] text-white font-bold text-xs hover:bg-[#2D6A4F] shadow-md transition-all active:scale-95"
        >
          Unlock Reflections
        </button>

        {isPinModalOpen && (
          <PinVerificationModal
            isOpen={true}
            onClose={() => setIsPinModalOpen(false)}
            onSuccess={() => setIsPinModalOpen(false)}
            title="Unlock Reflections"
          />
        )}
      </div>
    );
  }

  const handleMoodSelect = (level: number) => {
    soundManager.playChime('click');
    setSelectedMood(level);
    setMoodSaved(true);
    // Persist mood check-in immediately
    saveJournalEntry(
      entryText || `Daily mood check-in: ${moodLevels[level].label}`,
      level,
      ['#mood_checkin']
    );
    showToast(`Mood recorded: ${moodLevels[level].label} (+10 XP)`);
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryText.trim()) return;

    soundManager.playChime('success');
    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => (t.startsWith('#') ? t : `#${t}`));

    saveJournalEntry(entryText.trim(), selectedMood, tags);
    setEntryText('');
    showToast('✨ Reflection deposited to your personal journal (+20 XP, +2 🪙)!');
  };

  const handleSaveDeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deedText.trim()) return;

    soundManager.playChime('success');
    const text = deedText.trim();
    addGoodDeed(deedTarget, text);
    logImpactDeed({
      title: text,
      category: deedTarget === 'self' ? 'kindness_self' : 'kindness_other',
      recipientType: deedTarget === 'self' ? 'self' : 'friend',
      impactRating: 3,
      date: today
    });
    setDeedText('');
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* 1. Header */}
      <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🪞</span>
          <h2 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E] tracking-tight">
            Daily Reflection & Mindfulness
          </h2>
        </div>
        <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
          Check in with your emotional climate, release tension, and capture gratitude.
        </p>
      </div>

      {/* 2. One Daily Mood Check-In */}
      <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-[#859A90] light:text-[#5C655E] uppercase tracking-wider">
            Daily Mood Check-In
          </span>
          {moodSaved && (
            <span className="text-[10px] text-[#3D7D62] font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> Recorded
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {moodLevels.map(m => {
            const isSelected = selectedMood === m.level;
            return (
              <button
                key={m.level}
                onClick={() => handleMoodSelect(m.level)}
                className={`flex flex-col items-center gap-1 py-3 px-1 rounded-2xl border transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#2A5643]/30 border-[#3D7D62] text-[#F4F7F4] shadow-sm scale-102 light:bg-[#E8F3ED] light:text-[#1C221E]'
                    : 'bg-[#242D29] border-[#384A41]/70 text-[#859A90] hover:border-[#3D7D62]/50 light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] font-bold tracking-tight">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Accessible Breathing & Urge Surfing Exercises */}
      <div>
        <div className="px-1 mb-2">
          <span className="text-xs font-black text-[#859A90] light:text-[#5C655E] uppercase tracking-wider">
            Somatic & Distress Tolerance Exercises
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Box Breathing Card */}
          <div
            onClick={() => {
              soundManager.playChime('click');
              setIsBreathModalOpen(true);
            }}
            className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] hover:border-[#3D7D62] cursor-pointer transition-all active:scale-98 light:bg-white light:border-[#E5E3DA]"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2">
              <Wind className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">Box Breathing</h4>
            <p className="text-[10px] text-[#859A90] light:text-[#5C655E] mt-0.5">
              4-4-4-4 Navy SEAL calm pacer
            </p>
          </div>

          {/* Urge Surfing Card */}
          <div
            onClick={() => {
              soundManager.playChime('click');
              setActiveTab('urge');
            }}
            className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] hover:border-[#3D7D62] cursor-pointer transition-all active:scale-98 light:bg-white light:border-[#E5E3DA]"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
              <Waves className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">Urge Surfing</h4>
            <p className="text-[10px] text-[#859A90] light:text-[#5C655E] mt-0.5">
              10-minute wave craving timer
            </p>
          </div>
        </div>
      </div>

      {/* 4. One Optional Journal Entry */}
      <form
        onSubmit={handleSaveJournal}
        className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA] flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#859A90] light:text-[#5C655E] uppercase tracking-wider">
            Optional Journal Reflection
          </span>
          <span className="text-[10px] text-[#859A90] light:text-[#5C655E]">Private & Offline</span>
        </div>

        <textarea
          value={entryText}
          onChange={e => setEntryText(e.target.value)}
          rows={4}
          placeholder="What felt challenging today? Where was there a small unexpected win or moment of quiet peace? Write freely..."
          className="w-full p-3 rounded-2xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90] focus:border-[#3D7D62] focus:outline-none light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 max-w-xs">
            <Tag className="w-3.5 h-3.5 text-[#859A90]" />
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="#tags..."
              className="w-full py-1 px-2 rounded-lg bg-[#121413] border border-[#384A41] text-[11px] text-[#F4F7F4] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          <button
            type="submit"
            disabled={!entryText.trim()}
            className="py-2.5 px-4 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all flex items-center gap-1.5 light:bg-[#2D6A4F]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Save Reflection (+20 XP)</span>
          </button>
        </div>
      </form>

      {/* 5. Secondary Kindness & Self-Compassion Prompts (Collapsible) */}
      <div className="rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA] overflow-hidden">
        <button
          onClick={() => setIsKindnessExpanded(!isKindnessExpanded)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#242D29]/40 transition-colors light:hover:bg-[#F7F6F2]"
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#E5A93C]" />
            <span className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
              Kindness & Self-Compassion Prompts
            </span>
          </div>
          {isKindnessExpanded ? <ChevronDown className="w-4 h-4 text-[#859A90]" /> : <ChevronRight className="w-4 h-4 text-[#859A90]" />}
        </button>

        {isKindnessExpanded && (
          <form onSubmit={handleSaveDeed} className="p-4 pt-0 border-t border-[#384A41]/50 flex flex-col gap-3">
            <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
              Track one small compassionate deed performed today for yourself or another person.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeedTarget('others')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  deedTarget === 'others'
                    ? 'bg-[#3D7D62] text-white'
                    : 'bg-[#242D29] text-[#859A90] light:bg-[#F7F6F2]'
                }`}
              >
                🤝 For Others
              </button>
              <button
                type="button"
                onClick={() => setDeedTarget('self')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  deedTarget === 'self'
                    ? 'bg-[#3D7D62] text-white'
                    : 'bg-[#242D29] text-[#859A90] light:bg-[#F7F6F2]'
                }`}
              >
                🌱 For Self
              </button>
            </div>

            <textarea
              value={deedText}
              onChange={e => setDeedText(e.target.value)}
              rows={2}
              placeholder="e.g. Listened attentively without interrupting; allowed myself a 15-minute rest..."
              className="w-full p-2.5 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#384A41]/40">
              <button
                type="button"
                onClick={() => {
                  soundManager.playChime('click');
                  setIsImpactModalOpen(true);
                }}
                className="text-[11px] text-[#68D391] hover:underline font-bold flex items-center gap-1 self-start"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
                <span>Open Full Deed Logger & Ratings</span>
              </button>

              <button
                type="submit"
                disabled={!deedText.trim()}
                className="py-2 px-4 rounded-xl bg-[#E5A93C] text-[#121413] text-xs font-bold disabled:opacity-40 self-end sm:self-auto"
              >
                Record Good Deed (+15 XP)
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 6. Recent Past Reflections */}
      {state.jr.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA]">
          <span className="text-xs font-black text-[#859A90] light:text-[#5C655E] uppercase tracking-wider block mb-3">
            Recent Past Reflections
          </span>

          <div className="flex flex-col gap-2">
            {state.jr.slice(-4).reverse().map(entry => (
              <div
                key={entry.id}
                className="p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/70 light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{moodLevels[entry.m]?.emoji || '🙂'}</span>
                    <span className="text-[10px] font-bold text-[#859A90]">
                      {moodLevels[entry.m]?.label || 'Good'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#859A90]">{entry.d}</span>
                </div>
                <p className="text-xs text-[#F4F7F4] light:text-[#1C221E] whitespace-pre-line">{entry.t}</p>
                {entry.g.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.g.map((tag, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#1B211E] text-[#859A90] light:bg-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breath Pacer Modal */}
      {isBreathModalOpen && (
        <BreathPacerModal isOpen={true} onClose={() => setIsBreathModalOpen(false)} />
      )}

      {/* Full Impact Deed Modal */}
      {isImpactModalOpen && (
        <ImpactDeedModal isOpen={true} onClose={() => setIsImpactModalOpen(false)} />
      )}
    </div>
  );
};
