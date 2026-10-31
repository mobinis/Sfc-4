import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Save, Heart, Lock, Tag, Smile, Meh, Frown } from 'lucide-react';
import { PinVerificationModal } from '../components/modals/PinVerificationModal';
import { AiCopilotModal } from '../components/modals/AiCopilotModal';

export const JournalScreen: React.FC = () => {
  const {
    state,
    isUnlocked,
    saveJournalEntry,
    addGoodDeed,
    showToast
  } = useApp();

  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  // Journal form state
  const [entryText, setEntryText] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [tagInput, setTagInput] = useState<string>('#focus, #gratitude');

  // Good deed form state
  const [deedText, setDeedText] = useState<string>('');
  const [deedTarget, setDeedTarget] = useState<'self' | 'others'>('others');

  const isLocked = state.pinLockEnabled && state.lockJournal && !isUnlocked;

  const moodEmojis = [
    { level: 0, emoji: '😢', label: 'Heavy' },
    { level: 1, emoji: '😔', label: 'Low' },
    { level: 2, emoji: '😐', label: 'Neutral' },
    { level: 3, emoji: '🙂', label: 'Good' },
    { level: 4, emoji: '😄', label: 'Radiant' }
  ];

  if (isLocked) {
    return (
      <div className="rounded-2xl bg-[#1B211E] border border-[#384A41] p-10 flex flex-col items-center justify-center text-center gap-4 light:bg-white light:border-[#E5E3DA]">
        <div className="w-16 h-16 rounded-3xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] flex items-center justify-center text-3xl shadow-lg light:bg-[#FEF3C7] light:text-[#D97706]">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#F4F7F4] light:text-[#1C221E]">
            Confidential Journal Protected
          </h3>
          <p className="text-xs text-[#859A90] light:text-[#5C655E] mt-1 max-w-xs">
            This section is protected with local SHA-256 PIN authentication.
          </p>
        </div>
        <button
          onClick={() => setIsPinModalOpen(true)}
          className="py-3 px-6 rounded-xl bg-[#2D6A4F] text-white font-bold text-xs hover:bg-[#22533E] shadow-md transition-all active:scale-95"
        >
          Unlock Journal
        </button>

        {isPinModalOpen && (
          <PinVerificationModal
            isOpen={true}
            onClose={() => setIsPinModalOpen(false)}
            onSuccess={() => setIsPinModalOpen(false)}
            title="Unlock Confidential Journal"
          />
        )}
      </div>
    );
  }

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryText.trim()) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => (t.startsWith('#') ? t : `#${t}`));

    saveJournalEntry(entryText.trim(), selectedMood, tags);
    setEntryText('');
    showToast('Reflection deposited directly into your journal (+20 XP, +2 🪙)!');
  };

  const handleSaveDeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deedText.trim()) return;

    addGoodDeed(deedTarget, deedText.trim());
    setDeedText('');
    showToast('Kind deed recorded (+15 XP, +1 🪙)!');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
            <span>✍️</span> Mindful Reflection & Gratitude
          </h2>
          <p className="text-xs text-[#859A90] light:text-[#5C655E]">
            Emotional granularity, daily wins & unburdening friction
          </p>
        </div>

        <button
          onClick={() => setIsCopilotOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] text-xs font-bold flex items-center gap-1.5 hover:bg-[#3D2E0A] transition-colors light:bg-[#FEF3C7] light:text-[#D97706]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Socratic Coach</span>
        </button>
      </div>

      {/* Write New Reflection Card */}
      <form
        onSubmit={handleSaveEntry}
        className="rounded-2xl bg-[#1B211E] border border-[#384A41] p-4 flex flex-col gap-3 shadow-md light:bg-white light:border-[#E5E3DA]"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
            How is your somatic and emotional energy right now?
          </label>
        </div>

        {/* Mood scale */}
        <div className="grid grid-cols-5 gap-2">
          {moodEmojis.map(m => (
            <button
              key={m.level}
              type="button"
              onClick={() => setSelectedMood(m.level)}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                selectedMood === m.level
                  ? 'bg-[#2A5643] border-[#3D7D62] text-white scale-105 shadow-sm light:bg-[#E8F3ED] light:text-[#1C3026]'
                  : 'bg-[#242D29] border-[#384A41] text-[#859A90] hover:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA]'
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] font-bold">{m.label}</span>
            </button>
          ))}
        </div>

        <textarea
          rows={4}
          value={entryText}
          onChange={e => setEntryText(e.target.value)}
          placeholder="Reflect on 1 win today, 1 moment of friction without guilt, and what you need right now..."
          className="w-full p-3.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
        />

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            placeholder="#tags separated by comma..."
            className="flex-1 p-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#22533E] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Deposit (+20 XP)</span>
          </button>
        </div>
      </form>

      {/* Gratitude & Kindness Section */}
      <form
        onSubmit={handleSaveDeed}
        className="rounded-2xl bg-[#1B211E] border border-[#384A41] p-4 flex flex-col gap-3 shadow-md light:bg-white light:border-[#E5E3DA]"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-[#E5A93C]" />
            <span>Kindness & Gratitude Deed</span>
          </h3>

          <div className="flex gap-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setDeedTarget('others')}
              className={`px-2 py-0.5 rounded-md border ${
                deedTarget === 'others'
                  ? 'bg-[#2A5643] border-[#3D7D62] text-white'
                  : 'bg-[#242D29] border-[#384A41] text-[#859A90]'
              }`}
            >
              Towards Others
            </button>
            <button
              type="button"
              onClick={() => setDeedTarget('self')}
              className={`px-2 py-0.5 rounded-md border ${
                deedTarget === 'self'
                  ? 'bg-[#2A5643] border-[#3D7D62] text-white'
                  : 'bg-[#242D29] border-[#384A41] text-[#859A90]'
              }`}
            >
              Self-Compassion
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={deedText}
            onChange={e => setDeedText(e.target.value)}
            placeholder="Record 1 genuine moment of kindness, compliment, or self-care grace..."
            className="flex-1 p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#E5A93C] text-[#121413] text-xs font-bold hover:bg-[#d4962b] transition-colors"
          >
            Record
          </button>
        </div>
      </form>

      {/* Past Journal Entries */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#859A90] px-1">
          Recent Reflections
        </h3>

        {state.jr.map(entry => {
          const moodInfo = moodEmojis[entry.m] || moodEmojis[3];

          return (
            <div
              key={entry.id}
              className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex flex-col gap-2 light:bg-white light:border-[#E5E3DA]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#859A90]">
                  {entry.d}
                </span>
                <span className="text-xs font-bold flex items-center gap-1 text-[#F4F7F4] light:text-[#1C221E]">
                  <span>{moodInfo.emoji}</span>
                  <span>{moodInfo.label}</span>
                </span>
              </div>

              <p className="text-xs text-[#F4F7F4] light:text-[#1C221E] leading-relaxed whitespace-pre-line">
                {entry.t}
              </p>

              {entry.g.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {entry.g.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-[#3D7D62]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Copilot Modal */}
      {isCopilotOpen && (
        <AiCopilotModal
          isOpen={true}
          onClose={() => setIsCopilotOpen(false)}
          initialMode="reflection"
        />
      )}
    </div>
  );
};
