import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenTimeCategory } from '../../types';
import { Smartphone, X, Check } from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';

interface AddMonitoredAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_OPTIONS = ['📱', '📸', '▶️', '🐦', '💬', '📰', '🎮', '📺', '🎧', '🛍️', '💻', '🔥', '⚡', '🛡️'];

const CATEGORY_OPTIONS: { id: ScreenTimeCategory; label: string }[] = [
  { id: 'short_video', label: 'Short Video / Reels' },
  { id: 'social_media', label: 'Social Media Feed' },
  { id: 'entertainment', label: 'Video Entertainment' },
  { id: 'gaming', label: 'Mobile Gaming' },
  { id: 'news', label: 'News & Current Events' },
  { id: 'productive', label: 'Work & Creative' }
];

export const AddMonitoredAppModal: React.FC<AddMonitoredAppModalProps> = ({ isOpen, onClose }) => {
  const { addScreenTimeApp, showToast } = useApp();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📱');
  const [category, setCategory] = useState<ScreenTimeCategory>('short_video');
  const [dailyCeilingMinutes, setDailyCeilingMinutes] = useState<number>(20);
  const [isDoomscrollRisk, setIsDoomscrollRisk] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please provide an app name');
      return;
    }

    addScreenTimeApp({
      name: name.trim(),
      icon,
      category,
      dailyCeilingMinutes: Math.max(5, dailyCeilingMinutes),
      isDoomscrollRisk
    });

    soundManager.playChime('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md max-h-[90vh] rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl flex flex-col overflow-hidden light:bg-white light:border-[#E5E3DA]">
        {/* Header */}
        <div className="p-4 border-b border-[#384A41]/60 flex items-center justify-between light:border-[#E5E3DA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#242D29] border border-[#384A41] flex items-center justify-center text-lg light:bg-[#F7F6F2]">
              {icon}
            </div>
            <div>
              <h3 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E]">
                Add Monitored App
              </h3>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Set mindful daily budgets and doom-scroll alerts
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
          {/* Icon Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              App Icon
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {EMOJI_OPTIONS.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    soundManager.playChime('click');
                    setIcon(em);
                  }}
                  className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all ${
                    icon === em
                      ? 'bg-[#3D7D62] scale-110 shadow-xs border border-[#68D391]'
                      : 'bg-[#242D29] border border-[#384A41]/60 hover:bg-[#2D3631] light:bg-[#F7F6F2] light:border-[#E5E3DA]'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* App Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              App Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. TikTok, Netflix, Discord"
              className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              {CATEGORY_OPTIONS.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Daily Ceiling Budget */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Daily Ceiling Budget (Minutes)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                step={5}
                value={dailyCeilingMinutes}
                onChange={e => setDailyCeilingMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E] w-28 text-center"
              />
              <div className="flex items-center gap-1 flex-wrap">
                {[15, 20, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyCeilingMinutes(mins)}
                    className="py-1 px-2 rounded-lg bg-[#242D29] text-[10px] font-bold text-[#859A90] hover:text-white border border-[#384A41] light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Doomscroll Risk Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
                High Doom-scroll Risk
              </span>
              <span className="text-[10px] text-[#859A90] light:text-[#5C655E]">
                Warns when approaching ceiling and tracks in dopamine shield
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsDoomscrollRisk(!isDoomscrollRisk)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                isDoomscrollRisk ? 'bg-[#E5A93C]' : 'bg-[#121413] border border-[#384A41]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  isDoomscrollRisk ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
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
              <span>Add App</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
