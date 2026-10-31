import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ImpactDeedCategory,
  ImpactDeedRecord
} from '../../types';
import {
  X,
  Heart,
  Sparkles,
  Users,
  Clock,
  Send,
  Star,
  Smile,
  Compass,
  Gift
} from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';
import { DateUtils } from '../../utils/dateUtils';

interface ImpactDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContactId?: string;
  initialRecipientName?: string;
}

export const ImpactDeedModal: React.FC<ImpactDeedModalProps> = ({
  isOpen,
  onClose,
  initialContactId,
  initialRecipientName
}) => {
  const { state, logImpactDeed, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ImpactDeedCategory>('kindness_other');
  const [recipientType, setRecipientType] = useState<ImpactDeedRecord['recipientType']>('friend');
  const [recipientName, setRecipientName] = useState(initialRecipientName || '');
  const [linkedContactId, setLinkedContactId] = useState<string | undefined>(initialContactId);
  const [impactRating, setImpactRating] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [deedDate, setDeedDate] = useState<string>(DateUtils.todayStr());

  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialContactId) {
      setLinkedContactId(initialContactId);
      const contact = state.relationshipContacts.find(c => c.id === initialContactId);
      if (contact) {
        setRecipientName(contact.name);
        if (contact.relationshipType === 'family') setRecipientType('family');
        else if (contact.relationshipType === 'partner') setRecipientType('partner');
        else if (contact.relationshipType === 'mentor') setRecipientType('colleague');
        else setRecipientType('friend');
      }
    }
  }, [initialContactId, state.relationshipContacts]);

  if (!isOpen) return null;

  const categories: { id: ImpactDeedCategory; label: string; icon: string; desc: string }[] = [
    { id: 'kindness_other', label: 'Kindness for Others', icon: '🤝', desc: 'Directly supported, cheered, or helped another person' },
    { id: 'gratitude_expression', label: 'Gratitude Expression', icon: '💌', desc: 'Voiced sincere appreciation or wrote a thank-you note' },
    { id: 'mentorship_help', label: 'Mentorship & Help', icon: '🧭', desc: 'Guided, taught, or shared knowledge to lift someone up' },
    { id: 'community_service', label: 'Community & Planet', icon: '🌍', desc: 'Civic contribution, volunteering, or environmental care' },
    { id: 'kindness_self', label: 'Self-Compassion', icon: '🌱', desc: 'Honored personal boundaries, allowed restorative grace' }
  ];

  const deedIdeas = [
    'Sent an unexpected warm text of appreciation',
    'Offered genuine focused listening without interrupting',
    'Shared detailed constructive feedback to empower a peer',
    'Brought coffee or a small thoughtful gesture',
    'Forgave a minor grievance and released resentment',
    'Cleared litter from a shared walking path'
  ];

  const handleSelectIdea = (idea: string) => {
    soundManager.playChime('click');
    setTitle(idea);
  };

  const handleContactSelect = (contactId: string) => {
    soundManager.playChime('click');
    if (!contactId) {
      setLinkedContactId(undefined);
      return;
    }
    const c = state.relationshipContacts.find(contact => contact.id === contactId);
    if (c) {
      setLinkedContactId(c.id);
      setRecipientName(c.name);
      if (c.relationshipType === 'family') setRecipientType('family');
      else if (c.relationshipType === 'partner') setRecipientType('partner');
      else if (c.relationshipType === 'mentor') setRecipientType('colleague');
      else setRecipientType('friend');
    }
  };

  const handleInsertTimestamp = () => {
    soundManager.playChime('click');
    const stamp = `[${DateUtils.todayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] `;
    const textarea = notesRef.current;
    if (!textarea) {
      setNotes(prev => (prev ? `${prev}\n${stamp}` : stamp));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const toInsert = `\n${stamp}`;
    const newVal = currentVal.substring(0, start) + toInsert + currentVal.substring(end);
    setNotes(newVal);
    setTimeout(() => {
      textarea.focus();
      const newPos = start + toInsert.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const calculatedXp = Math.round(15 + Math.min(5, Math.max(1, impactRating)) * 3);
  const calculatedCoins = impactRating >= 4 ? 2 : 1;

  const handleSave = () => {
    if (!title.trim()) {
      showToast('Please describe the meaningful deed or action');
      return;
    }

    logImpactDeed({
      title: title.trim(),
      category,
      recipientType,
      recipientName: recipientName.trim() || undefined,
      linkedContactId,
      impactRating,
      notes: notes.trim() || undefined,
      date: deedDate
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="impact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl p-5 sm:p-6 text-[#F4F7F4] flex flex-col gap-4 my-auto light:bg-white light:border-[#E5E3DA] light:text-[#1C221E] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#384A41]/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#E5A93C] flex items-center justify-center text-lg">
              🌱
            </div>
            <div>
              <h3 id="impact-modal-title" className="text-sm font-black tracking-tight">
                Record Meaningful Action
              </h3>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Deposit an act of kindness, gratitude, or social connection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#859A90] hover:text-[#F4F7F4] hover:bg-[#242D29] transition-colors light:hover:bg-[#F2F1EC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
            What did you do? *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Sent an audio note thanking mentor for advice..."
            className="w-full h-10 px-3.5 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90] focus:border-[#3D7D62] focus:outline-hidden light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
          />

          {/* Prompt Ideas Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <span className="text-[10px] text-[#859A90] shrink-0">💡 Ideas:</span>
            {deedIdeas.slice(0, 3).map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectIdea(idea)}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] border border-[#384A41]/50 shrink-0 light:bg-[#F7F6F2] light:text-[#5C655E]"
              >
                {idea.length > 28 ? idea.slice(0, 28) + '...' : idea}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map(c => {
              const isSelected = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    soundManager.playChime('click');
                    setCategory(c.id);
                  }}
                  className={`p-2 rounded-xl border text-left flex items-start gap-2 transition-all ${
                    isSelected
                      ? 'bg-[#3D7D62]/20 border-[#3D7D62] text-white shadow-xs light:bg-[#3D7D62]/10 light:text-[#1C221E]'
                      : 'bg-[#121413] border-[#384A41]/60 text-[#859A90] hover:border-[#384A41] light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#5C655E]'
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight">{c.label}</span>
                    <span className="text-[9px] text-[#859A90] line-clamp-1 mt-0.5">{c.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recipient & Linked Relationship */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Recipient Role
            </label>
            <select
              value={recipientType}
              onChange={e => setRecipientType(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:border-[#3D7D62] focus:outline-hidden light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <option value="friend">Friend</option>
              <option value="family">Family Member</option>
              <option value="partner">Partner / Spouse</option>
              <option value="colleague">Colleague / Peer</option>
              <option value="stranger">Stranger</option>
              <option value="community">Community / Public</option>
              <option value="self">Myself (Self-Compassion)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Recipient Name (Optional)
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="e.g. Mom, Alex, Elena..."
              className="w-full h-10 px-3.5 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90] focus:border-[#3D7D62] focus:outline-hidden light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>
        </div>

        {/* Link to Contact Circle */}
        {state.relationshipContacts.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E] flex items-center justify-between">
              <span>Link to Relationship Contact</span>
              <span className="text-[10px] text-[#68D391] normal-case">Resets touchpoint cadence</span>
            </label>
            <select
              value={linkedContactId || ''}
              onChange={e => handleContactSelect(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:border-[#3D7D62] focus:outline-hidden light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <option value="">-- No linked contact --</option>
              {state.relationshipContacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.avatarEmoji} {c.name} ({c.relationshipType}) - Target: every {c.targetCadenceDays}d
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Impact Rating */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Meaningful Impact Level
            </label>
            <span className="text-xs font-bold text-[#E5A93C]">
              {impactRating === 1 && '🌱 Subtle positive gesture'}
              {impactRating === 2 && '🙂 Warm social cheer'}
              {impactRating === 3 && '✨ Meaningful support'}
              {impactRating === 4 && '🌟 High-leverage help'}
              {impactRating === 5 && '🕊️ Profound / Life-changing'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  soundManager.playChime('click');
                  setImpactRating(star);
                }}
                className={`flex-1 h-10 rounded-xl flex items-center justify-center font-bold text-xs gap-1 border transition-all ${
                  star <= impactRating
                    ? 'bg-[#E5A93C]/20 border-[#E5A93C] text-[#E5A93C] shadow-xs'
                    : 'bg-[#121413] border-[#384A41]/50 text-[#859A90] hover:border-[#384A41] light:bg-[#FAF9F5] light:border-[#E5E3DA]'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${star <= impactRating ? 'fill-[#E5A93C]' : ''}`} />
                <span>{star}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes with cursor-preserving timestamp button */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Reflection Notes
            </label>
            <button
              type="button"
              onClick={handleInsertTimestamp}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-[#242D29] text-[#68D391] hover:bg-[#384A41] font-mono flex items-center gap-1 transition-colors light:bg-[#F2F1EC]"
            >
              <Clock className="w-3 h-3" />
              <span>+ Insert Stamp ⏱️</span>
            </button>
          </div>
          <textarea
            ref={notesRef}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="How did they react? How did it feel in your body and mind? Takeaways for deeper connection..."
            className="w-full p-3 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90] focus:border-[#3D7D62] focus:outline-hidden light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
          />
        </div>

        {/* Reward Preview and Save Button */}
        <div className="pt-2 border-t border-[#384A41]/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-lg bg-[#3D7D62]/20 text-[#68D391] font-mono font-bold">
              +{calculatedXp} XP
            </span>
            <span className="text-xs px-2 py-1 rounded-lg bg-[#E5A93C]/20 text-[#E5A93C] font-mono font-bold">
              +{calculatedCoins} 🪙
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Record Action</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
