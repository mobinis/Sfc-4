import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RelationshipContact,
  RelationshipType,
  ContactChannel
} from '../../types';
import {
  X,
  Heart,
  Calendar,
  Clock,
  Star,
  User,
  Coffee,
  Phone,
  MessageSquare,
  Users,
  Mail
} from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';
import { DateUtils } from '../../utils/dateUtils';

interface RelationshipContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactToEdit?: RelationshipContact | null;
}

export const RelationshipContactModal: React.FC<RelationshipContactModalProps> = ({
  isOpen,
  onClose,
  contactToEdit
}) => {
  const { addRelationshipContact, updateRelationshipContact, showToast } = useApp();

  const [name, setName] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('friend');
  const [avatarEmoji, setAvatarEmoji] = useState('✨');
  const [targetCadenceDays, setTargetCadenceDays] = useState<number>(7);
  const [preferredChannel, setPreferredChannel] = useState<ContactChannel>('call');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [lastCheckInDate, setLastCheckInDate] = useState<string>(DateUtils.todayStr());

  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (contactToEdit) {
      setName(contactToEdit.name);
      setRelationshipType(contactToEdit.relationshipType);
      setAvatarEmoji(contactToEdit.avatarEmoji || '✨');
      setTargetCadenceDays(contactToEdit.targetCadenceDays || 7);
      setPreferredChannel(contactToEdit.preferredChannel || 'call');
      setNotes(contactToEdit.notes || '');
      setIsFavorite(!!contactToEdit.isFavorite);
      setLastCheckInDate(contactToEdit.lastCheckInDate || DateUtils.todayStr());
    } else {
      setName('');
      setRelationshipType('friend');
      setAvatarEmoji('✨');
      setTargetCadenceDays(7);
      setPreferredChannel('call');
      setNotes('');
      setIsFavorite(false);
      setLastCheckInDate(DateUtils.todayStr());
    }
  }, [contactToEdit, isOpen]);

  if (!isOpen) return null;

  const emojiPresets = ['🏡', '💖', '✨', '🧭', '☕', '🏋️', '🤝', '🌻', '🎨', '📚', '🌟', '🌱'];

  const channels: { id: ContactChannel; label: string; icon: string }[] = [
    { id: 'call', label: 'Call', icon: '📞' },
    { id: 'text', label: 'Message', icon: '💬' },
    { id: 'coffee', label: 'Coffee', icon: '☕' },
    { id: 'in_person', label: 'In Person', icon: '🤝' },
    { id: 'letter', label: 'Letter / Note', icon: '💌' }
  ];

  const cadencePresets = [
    { label: '3 Days', days: 3 },
    { label: 'Weekly (7d)', days: 7 },
    { label: 'Bi-Weekly (14d)', days: 14 },
    { label: 'Monthly (30d)', days: 30 }
  ];

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

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Please enter the contact\'s name');
      return;
    }

    if (contactToEdit) {
      updateRelationshipContact(contactToEdit.id, {
        name: name.trim(),
        relationshipType,
        avatarEmoji,
        targetCadenceDays: Math.max(1, targetCadenceDays),
        preferredChannel,
        notes: notes.trim() || undefined,
        isFavorite,
        lastCheckInDate
      });
    } else {
      addRelationshipContact({
        name: name.trim(),
        relationshipType,
        avatarEmoji,
        targetCadenceDays: Math.max(1, targetCadenceDays),
        preferredChannel,
        notes: notes.trim() || undefined,
        isFavorite,
        lastCheckInDate
      });
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl p-5 sm:p-6 text-[#F4F7F4] flex flex-col gap-4 my-auto light:bg-white light:border-[#E5E3DA] light:text-[#1C221E] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#384A41]/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#3D7D62]/20 border border-[#3D7D62]/40 text-[#68D391] flex items-center justify-center text-lg">
              {avatarEmoji}
            </div>
            <div>
              <h3 id="contact-modal-title" className="text-sm font-black tracking-tight">
                {contactToEdit ? 'Edit Contact' : 'Add to Relationship Circle'}
              </h3>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Set a proactive touchpoint cadence to nurture genuine connection
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

        {/* Name and Favorite */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Full Name or Moniker *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Mom & Dad, Alex, Marcus..."
              className="w-full h-10 px-3.5 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90] focus:border-[#3D7D62] focus:outline-hidden light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Pin ⭐
            </label>
            <button
              type="button"
              onClick={() => {
                soundManager.playChime('click');
                setIsFavorite(!isFavorite);
              }}
              className={`h-10 px-3.5 rounded-xl border flex items-center justify-center transition-all ${
                isFavorite
                  ? 'bg-[#E5A93C]/20 border-[#E5A93C] text-[#E5A93C]'
                  : 'bg-[#121413] border-[#384A41] text-[#859A90] light:bg-[#FAF9F5] light:border-[#E5E3DA]'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-[#E5A93C]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Emoji Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
            Avatar Icon
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {emojiPresets.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  soundManager.playChime('click');
                  setAvatarEmoji(emoji);
                }}
                className={`w-8 h-8 rounded-xl text-base flex items-center justify-center border transition-all ${
                  avatarEmoji === emoji
                    ? 'bg-[#3D7D62] border-[#3D7D62] shadow-xs'
                    : 'bg-[#121413] border-[#384A41]/60 hover:border-[#384A41] light:bg-[#FAF9F5] light:border-[#E5E3DA]'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Relationship Type & Preferred Channel */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Relationship
            </label>
            <select
              value={relationshipType}
              onChange={e => setRelationshipType(e.target.value as RelationshipType)}
              className="w-full h-10 px-3 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:border-[#3D7D62] focus:outline-hidden light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              <option value="friend">Friend</option>
              <option value="family">Family</option>
              <option value="partner">Partner</option>
              <option value="mentor">Mentor</option>
              <option value="colleague">Colleague</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Preferred Reach-Out
            </label>
            <select
              value={preferredChannel}
              onChange={e => setPreferredChannel(e.target.value as ContactChannel)}
              className="w-full h-10 px-3 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:border-[#3D7D62] focus:outline-hidden light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              {channels.map(ch => (
                <option key={ch.id} value={ch.id}>
                  {ch.icon} {ch.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cadence Days Selection */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Target Touchpoint Cadence
            </label>
            <span className="text-xs font-mono font-bold text-[#68D391]">
              Every {targetCadenceDays} {targetCadenceDays === 1 ? 'day' : 'days'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {cadencePresets.map(cp => (
              <button
                key={cp.days}
                type="button"
                onClick={() => {
                  soundManager.playChime('click');
                  setTargetCadenceDays(cp.days);
                }}
                className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  targetCadenceDays === cp.days
                    ? 'bg-[#3D7D62] border-[#3D7D62] text-white shadow-xs'
                    : 'bg-[#121413] border-[#384A41]/60 text-[#859A90] hover:border-[#384A41] light:bg-[#FAF9F5] light:border-[#E5E3DA]'
                }`}
              >
                {cp.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-[#859A90]">Custom Days:</span>
            <input
              type="number"
              min={1}
              max={365}
              value={targetCadenceDays}
              onChange={e => setTargetCadenceDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-20 h-7 px-2 rounded-lg bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] text-center font-mono light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>
        </div>

        {/* Last Check-In Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
            Last Connected Date
          </label>
          <input
            type="date"
            value={lastCheckInDate}
            onChange={e => setLastCheckInDate(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:border-[#3D7D62] focus:outline-hidden light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
          />
        </div>

        {/* Notes with cursor-preserving timestamp button */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Context & Interests Notes
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
            rows={2}
            placeholder="Important dates, life updates, favorite topics to ask about..."
            className="w-full p-2.5 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90] focus:border-[#3D7D62] focus:outline-hidden light:bg-[#FAF9F5] light:border-[#E5E3DA] light:text-[#1C221E]"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-[#384A41]/60 flex items-center justify-end gap-2">
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
            className="px-5 py-2.5 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-md transition-all active:scale-95"
          >
            {contactToEdit ? 'Save Changes' : 'Add to Circle'}
          </button>
        </div>
      </div>
    </div>
  );
};
