import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { NodeItem } from '../../types';
import { soundManager } from '../../utils/soundHaptics';

interface PillarEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillarToEdit?: NodeItem | null;
}

const PRESET_EMOJIS = [
  '🏛️', '🧠', '🛠️', '💪', '🌙', '🪥', '🕌', '💼',
  '🎨', '🎵', '💰', '🌿', '📚', '🤝', '🎯', '⭐',
  '🚀', '💡', '🔥', '❤️', '⚖️', '🧭', '🌱', '🛡️'
];

const PRESET_COLORS = [
  { name: 'Forest Sage', hex: '#3D7D62' },
  { name: 'Warm Amber', hex: '#E5A93C' },
  { name: 'Ocean Blue', hex: '#3B82F6' },
  { name: 'Royal Violet', hex: '#8B5CF6' },
  { name: 'Rose Pink', hex: '#EC4899' },
  { name: 'Emerald Teal', hex: '#14B8A6' },
  { name: 'Terracotta', hex: '#D95D39' },
  { name: 'Warm Slate', hex: '#64748B' },
];

export const PillarEditorModal: React.FC<PillarEditorModalProps> = ({
  isOpen,
  onClose,
  pillarToEdit
}) => {
  const { createPillar, updatePillar, deletePillar, state } = useApp();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏛️');
  const [color, setColor] = useState('#3D7D62');
  const [description, setDescription] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (pillarToEdit) {
      setName(pillarToEdit.n);
      setEmoji(pillarToEdit.e || '🏛️');
      setColor(pillarToEdit.color || '#3D7D62');
      setDescription(pillarToEdit.description || '');
    } else {
      setName('');
      setEmoji('🏛️');
      setColor('#3D7D62');
      setDescription('');
    }
    setIsConfirmDeleteOpen(false);
  }, [pillarToEdit, isOpen]);

  if (!isOpen) return null;

  const childSkillsCount = pillarToEdit
    ? state.nodes.filter(n => n.p === pillarToEdit.id).length
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (pillarToEdit) {
      updatePillar(pillarToEdit.id, {
        n: name.trim(),
        e: emoji,
        color,
        description: description.trim()
      });
    } else {
      createPillar({
        name: name.trim(),
        emoji,
        color,
        description: description.trim()
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!pillarToEdit) return;
    deletePillar(pillarToEdit.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl p-5 flex flex-col gap-4 text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {pillarToEdit ? 'Edit Life Pillar' : 'Create Custom Pillar'}
              </h2>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                {pillarToEdit ? 'Update pillar attributes & colors' : 'Establish a new top-level domain for your skills'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playChime('click');
              onClose();
            }}
            className="p-1.5 rounded-xl bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:text-[#5C655E]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Delete Confirmation Step */}
        {isConfirmDeleteOpen ? (
          <div className="p-4 rounded-2xl bg-[#2E1814] border border-[#B91C1C]/50 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#EA867A]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold">Remove Pillar '{pillarToEdit?.n}'?</span>
            </div>
            <p className="text-[11px] text-[#F4F7F4]/90 light:text-[#1C221E]">
              {childSkillsCount > 0 ? (
                <>
                  This pillar contains <strong>{childSkillsCount} active skills</strong>. Per your settings, all child skills and progress logs will be <strong>safely moved to the Unassigned Archive</strong>. No user data will be lost.
                </>
              ) : (
                'This pillar is empty and will be removed.'
              )}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[#242D29] text-xs font-bold text-[#859A90] hover:text-[#F4F7F4]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-1.5 rounded-xl bg-[#B91C1C] text-white text-xs font-bold hover:bg-[#991B1B] transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Removal</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Pillar Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E]">
                Pillar Name <span className="text-[#E5A93C]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Creative Arts, Career, Finance..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>

            {/* Emoji Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E]">
                Icon / Emoji
              </label>
              <div className="grid grid-cols-8 gap-1.5 p-2 rounded-2xl bg-[#242D29] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
                {PRESET_EMOJIS.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      soundManager.playChime('click');
                      setEmoji(item);
                    }}
                    className={`h-9 rounded-xl text-base flex items-center justify-center transition-all ${
                      emoji === item
                        ? 'bg-[#3D7D62] scale-110 shadow-xs'
                        : 'hover:bg-[#1B211E] light:hover:bg-white'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Swatches */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E]">
                Accent Color
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2 rounded-2xl bg-[#242D29] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      soundManager.playChime('click');
                      setColor(c.hex);
                    }}
                    title={c.name}
                    className={`h-8 rounded-xl flex items-center justify-center transition-all ${
                      color === c.hex ? 'ring-2 ring-white scale-105' : 'hover:scale-95'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {color === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Description / Mission Note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#859A90] light:text-[#5C655E]">
                Description / Core Intent <span className="text-[10px] text-[#859A90]">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="What does mastery in this life domain mean to you?"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-hidden focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#384A41]/60 light:border-[#E5E3DA]">
              {pillarToEdit ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-[#EA867A] hover:bg-[#B91C1C]/20 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Pillar</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#242D29] text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:text-[#5C655E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{pillarToEdit ? 'Save Changes' : 'Create Pillar'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
