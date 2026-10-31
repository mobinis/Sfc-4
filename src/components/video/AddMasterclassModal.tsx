import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Video, Sparkles, Link, Check, Clipboard, Play, ExternalLink, Clock } from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';

interface AddMasterclassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  'Somatic & Nervous System',
  'High-Stakes Communication',
  'Deep Focus & Dopamine',
  'Wisdom & Stoic Philosophy',
  'Emotional Regulation & Urges',
  'Physical Conditioning & Recovery',
  'Habit Systems & Identity'
];

const SUGGESTED_EMOJIS = ['🎥', '🧠', '🎙️', '⚡', '🌊', '💡', '🧘', '📚', '🏆', '🏹', '🌿', '🛡️'];

const QUICK_TAGS = [
  'communication',
  'polyvagal',
  'dopamine',
  'stoicism',
  'focus',
  'leadership',
  'somatic',
  'resilience',
  'habit-stacking',
  'breathwork'
];

export const AddMasterclassModal: React.FC<AddMasterclassModalProps> = ({ isOpen, onClose }) => {
  const { addVideoResource, showToast } = useApp();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [durationLabel, setDurationLabel] = useState('25 min');
  const [description, setDescription] = useState('');
  const [thumbnailEmoji, setThumbnailEmoji] = useState('🎥');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['focus']);
  const [platform, setPlatform] = useState<string>('Web');
  const [embedUrl, setEmbedUrl] = useState<string>('');

  if (!isOpen) return null;

  // Helper to parse URL and auto-detect embed & platform
  const processUrl = (inputUrl: string) => {
    const trimmed = inputUrl.trim();
    setUrl(trimmed);
    if (!trimmed) {
      setPlatform('Web');
      setEmbedUrl('');
      return;
    }

    // YouTube regex detection
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      setPlatform('YouTube');
      setEmbedUrl(`https://www.youtube-nocookie.com/embed/${videoId}`);
      if (!thumbnailEmoji || thumbnailEmoji === '🎥') setThumbnailEmoji('🎥');
      return;
    }

    // Vimeo detection
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
    if (vimeoMatch && (vimeoMatch[3] || vimeoMatch[1])) {
      const vimeoId = vimeoMatch[3] || vimeoMatch[1];
      setPlatform('Vimeo');
      setEmbedUrl(`https://player.vimeo.com/video/${vimeoId}`);
      return;
    }

    // TED detection
    if (trimmed.includes('ted.com/talks/')) {
      setPlatform('TED');
      setThumbnailEmoji('🎙️');
      return;
    }

    // Direct MP4 / WebM
    if (/\.(mp4|webm|ogg)($|\?)/i.test(trimmed)) {
      setPlatform('Direct Video');
      setEmbedUrl(trimmed);
      return;
    }

    // General Web Link
    setPlatform('Web Link');
    setEmbedUrl(trimmed);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        processUrl(text);
        showToast('Link pasted from clipboard!');
        soundManager.playChime('click');
      }
    } catch {
      showToast('Unable to read clipboard. Please paste manually.');
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (clean && !selectedTags.includes(clean)) {
      setSelectedTags(prev => [...prev, clean]);
      setTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      showToast('Please provide a title and masterclass link');
      return;
    }

    const finalCategory = customCategory.trim() || category;

    addVideoResource({
      title: title.trim(),
      url: url.trim(),
      platform,
      embedUrl: embedUrl || url.trim(),
      instructor: instructor.trim() || undefined,
      category: finalCategory,
      durationLabel: durationLabel.trim() || '20 min',
      description: description.trim() || `Masterclass lecture on ${finalCategory}`,
      thumbnailEmoji,
      tags: selectedTags.length > 0 ? selectedTags : ['masterclass'],
      isFavorite: false
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-[#1B211E] border border-[#384A41] p-5 shadow-2xl flex flex-col gap-4 my-auto light:bg-white light:border-[#E5E3DA] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] flex items-center justify-center text-xl shadow-sm">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-1.5">
                <span>Add Masterclass from Link</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E5A93C]/20 text-[#E5A93C]">
                  +15 XP
                </span>
              </h3>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Import YouTube, Vimeo, TED talks or video lectures into your study sanctuary
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Masterclass Link Input & Platform Detector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#E5A93C] flex items-center gap-1">
                <Link className="w-3.5 h-3.5" />
                <span>Video / Masterclass URL *</span>
              </label>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-[10px] font-bold text-[#859A90] hover:text-[#E5A93C] flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#242D29] border border-[#384A41] light:bg-[#EFECE6] light:border-[#E5E3DA]"
              >
                <Clipboard className="w-3 h-3" />
                <span>Paste Link</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=... or Vimeo, TED, MP4 link"
                value={url}
                onChange={e => processUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#E5A93C] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E] pr-20"
              />
              {platform && platform !== 'Web' && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-[#121413] border border-[#384A41] text-[10px] font-bold text-[#E5A93C]">
                  {platform}
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#859A90]">
              Supports YouTube (auto-embed), Vimeo, TED, Loom, Coursera, or direct .mp4 video files.
            </p>
          </div>

          {/* Title & Instructor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#F4F7F4] light:text-[#1C221E]">
                Lecture / Masterclass Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Master Your Dopamine & Drive"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#F4F7F4] light:text-[#1C221E]">
                Speaker / Instructor / Channel
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Andrew Huberman, Chris Voss"
                value={instructor}
                onChange={e => setInstructor(e.target.value)}
                className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#F4F7F4] light:text-[#1C221E]">
                Domain Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#E5A93C]" />
                <span>Estimated Duration</span>
              </label>
              <div className="flex gap-1.5">
                {['15 min', '25 min', '45 min', '1 hr'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDurationLabel(preset)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      durationLabel === preset
                        ? 'bg-[#3D7D62] text-white'
                        : 'bg-[#242D29] text-[#859A90] border border-[#384A41]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="Custom"
                  value={durationLabel}
                  onChange={e => setDurationLabel(e.target.value)}
                  className="w-20 p-1 rounded-lg bg-[#242D29] border border-[#384A41] text-center text-[10px] text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
                />
              </div>
            </div>
          </div>

          {/* Emoji & Description */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-[#F4F7F4] light:text-[#1C221E]">
              Thumbnail Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setThumbnailEmoji(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-transform ${
                    thumbnailEmoji === emoji
                      ? 'bg-[#3D7D62]/30 border-[#3D7D62] scale-110 shadow-sm'
                      : 'bg-[#242D29] border-[#384A41] hover:border-[#859A90]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Description / Summary */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-[#F4F7F4] light:text-[#1C221E]">
              Key Summary & Action Anchors
            </label>
            <textarea
              rows={2}
              placeholder="What core concept, technique or mental model does this lecture teach?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-[#F4F7F4] light:text-[#1C221E]">
              Recall Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {QUICK_TAGS.map(t => {
                const active = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      active
                        ? 'bg-[#3D7D62] text-white shadow-xs'
                        : 'bg-[#242D29] text-[#859A90] border border-[#384A41]'
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom tag (e.g. dopamine)..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                className="flex-1 p-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#F4F7F4] hover:border-[#3D7D62]"
              >
                Add
              </button>
            </div>
          </div>

          {/* Live Card Preview */}
          {title && (
            <div className="p-3 rounded-2xl bg-[#121413] border border-[#384A41] flex flex-col gap-2 light:bg-[#FAF9F5] light:border-[#E5E3DA]">
              <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider">
                Preview In Sanctuary Library:
              </span>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#242D29] border border-[#384A41] flex items-center justify-center text-xl shadow-xs">
                  {thumbnailEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#F4F7F4] truncate light:text-[#1C221E]">
                    {title}
                  </h4>
                  <p className="text-[10px] text-[#E5A93C] font-semibold">
                    {instructor ? `${instructor} • ` : ''}{category} • {durationLabel}
                  </p>
                  <p className="text-[10px] text-[#859A90] line-clamp-1 mt-0.5">
                    {description || 'Masterclass lecture'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#384A41]/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] text-xs font-bold light:bg-[#EFECE6] light:border-[#E5E3DA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#22533E] flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>Save & Add to Sanctuary (+15 XP)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
