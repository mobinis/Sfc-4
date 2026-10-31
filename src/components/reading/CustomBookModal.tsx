import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookResourceItem } from '../../types';
import { BookOpen, X, Check, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';

interface CustomBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_OPTIONS = ['📖', '📚', '🧠', '🛡️', '⚡', '💡', '🌱', '🦉', '🎯', '🌊', '🔬', '🔥', '💎', '🧭', '⚖️', '🗝️', '🚀', '🎨'];

const CATEGORY_OPTIONS = [
  'Personal Growth',
  'Deep Work & Focus',
  'Psychology & Mind',
  'High EQ & Emotions',
  'Healthy Boundaries',
  'Handling Conflict',
  'Communication & Rapport',
  'Philosophy & Stoicism',
  'Health & Vitality',
  'Technology & Code'
];

export const CustomBookModal: React.FC<CustomBookModalProps> = ({ isOpen, onClose }) => {
  const { addCustomBook, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Personal Growth');
  const [totalPages, setTotalPages] = useState<number>(250);
  const [coverEmoji, setCoverEmoji] = useState('📖');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState<'physical' | 'ebook' | 'audiobook'>('physical');
  const [status, setStatus] = useState<BookResourceItem['status']>('reading');
  const [externalUrl, setExternalUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please provide a book title');
      return;
    }

    addCustomBook({
      title: title.trim(),
      author: author.trim() || 'Unknown Author',
      category,
      coverEmoji,
      subtitle: subtitle.trim() || 'A transformative read',
      description: description.trim() || `Personal study book on ${category}.`,
      coreFramework: 'Key Mental Models & Practical Exercises',
      keyConcepts: [category, 'Self-Mastery', 'Reflective Action'],
      fullGuideContent: `# ${title.trim()}\nBy ${author.trim() || 'Author'}\n\nTrack your notes, quotes, and practical application as you progress.`,
      chapters: [
        {
          id: 'ch_1',
          title: 'Part 1: Core Foundation & Principles',
          summary: 'Introduction to main concepts and mental models.',
          keyTakeaways: ['Foundational insight', 'Initial awareness'],
          practicalExercise: 'Daily reflection upon reading.',
          read: false
        }
      ],
      readingProgressPercent: 0,
      status,
      format,
      userNotes: '',
      externalUrl: externalUrl.trim() || '',
      isFavorite: false,
      pagesRead: 0,
      totalPages: Math.max(1, totalPages),
      startDate: new Date().toISOString().split('T')[0]
    });

    soundManager.playChime('success');
    showToast(`Added "${title.trim()}" to your reading shelf!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md max-h-[90vh] rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl flex flex-col overflow-hidden light:bg-white light:border-[#E5E3DA]">
        {/* Header */}
        <div className="p-4 border-b border-[#384A41]/60 flex items-center justify-between light:border-[#E5E3DA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#242D29] border border-[#384A41] flex items-center justify-center text-lg light:bg-[#F7F6F2]">
              {coverEmoji}
            </div>
            <div>
              <h3 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E]">
                Add Book to Shelf
              </h3>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Add any title you are reading or plan to read
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#242D29] border border-[#384A41] flex items-center justify-center text-[#859A90] hover:text-white light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
          {/* Cover Emoji Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Cover Icon
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {EMOJI_OPTIONS.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    soundManager.playChime('click');
                    setCoverEmoji(em);
                  }}
                  className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all ${
                    coverEmoji === em
                      ? 'bg-[#3D7D62] scale-110 shadow-xs border border-[#68D391]'
                      : 'bg-[#242D29] border border-[#384A41]/60 hover:bg-[#2D3631] light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Book Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Atomic Habits"
              className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          {/* Author */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Author
            </label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="e.g. James Clear"
              className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          {/* Total Pages & Format */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Total Pages
              </label>
              <input
                type="number"
                min={1}
                value={totalPages}
                onChange={e => setTotalPages(Math.max(1, parseInt(e.target.value) || 1))}
                className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Format
              </label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value as any)}
                className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              >
                <option value="physical">📖 Physical Book</option>
                <option value="ebook">📱 E-Book / Kindle</option>
                <option value="audiobook">🎧 Audiobook</option>
              </select>
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
              >
                <option value="reading">📖 Reading Now</option>
                <option value="want_to_read">📌 Want to Read</option>
                <option value="completed">✅ Completed</option>
                <option value="paused">⏸️ Paused</option>
              </select>
            </div>
          </div>

          {/* Subtitle / Key Topic */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Subtitle / One-Line Theme
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="e.g. Tiny Changes, Remarkable Results"
              className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#859A90] hover:text-white light:bg-[#F7F6F2] light:border-[#E5E3DA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-[#3D7D62] text-white text-xs font-black hover:bg-[#2D6A4F] transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add to Library</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
