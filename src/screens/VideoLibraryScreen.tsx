import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Play,
  Video,
  Save,
  X,
  Plus,
  Search,
  Star,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  Tag,
  BookOpen,
  CheckCircle,
  Timer,
  Pause,
  RotateCcw
} from 'lucide-react';
import { VideoResourceItem } from '../types';
import { soundManager } from '../utils/soundHaptics';
import { AddMasterclassModal } from '../components/video/AddMasterclassModal';

export const VideoLibraryScreen: React.FC = () => {
  const {
    state,
    saveVideoNote,
    deleteVideoResource,
    toggleVideoFavorite,
    logVideoStudySession,
    showToast
  } = useApp();

  const [activeVideo, setActiveVideo] = useState<VideoResourceItem | null>(null);
  const [videoNote, setVideoNote] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Study Session Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenVideo = (video: VideoResourceItem) => {
    setActiveVideo(video);
    setVideoNote(video.userNotes || '');
    setTimerSeconds(0);
    setIsTimerRunning(true);
    soundManager.playChime('click');
  };

  const handleCloseVideo = () => {
    setActiveVideo(null);
    setIsTimerRunning(false);
  };

  const handleInsertTimestamp = () => {
    const timeCode = `[${formatTimer(timerSeconds)}] `;
    setVideoNote(prev => prev + (prev.length > 0 && !prev.endsWith('\n') ? '\n' : '') + timeCode);
    soundManager.playChime('click');
  };

  const handleSaveVideoNote = () => {
    if (!activeVideo) return;
    saveVideoNote(activeVideo.id, videoNote);
    showToast('Video notes saved!');
    soundManager.playChime('click');
  };

  const handleCompleteSession = () => {
    if (!activeVideo) return;
    const studyMinutes = Math.max(1, Math.round(timerSeconds / 60)) || 15;
    logVideoStudySession(activeVideo.id, studyMinutes, videoNote);
    setIsTimerRunning(false);
    setActiveVideo(null);
  };

  const handleDeleteVideo = (video: VideoResourceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Remove masterclass "${video.title}" from library?`)) {
      deleteVideoResource(video.id);
    }
  };

  // Helper for embed URL
  const getEmbedUrl = (video: VideoResourceItem) => {
    if (video.embedUrl) return video.embedUrl;
    const url = video.url;
    // Check YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
    }
    // Check Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
    if (vimeoMatch && (vimeoMatch[3] || vimeoMatch[1])) {
      return `https://player.vimeo.com/video/${vimeoMatch[3] || vimeoMatch[1]}`;
    }
    return url;
  };

  // Category list derived from items
  const categories = useMemo(() => {
    const set = new Set<string>();
    state.videoResources.forEach(v => {
      if (v.category) set.add(v.category);
    });
    return Array.from(set);
  }, [state.videoResources]);

  // Filtered masterclasses
  const filteredVideos = useMemo(() => {
    return state.videoResources.filter(vid => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        vid.title.toLowerCase().includes(q) ||
        (vid.instructor && vid.instructor.toLowerCase().includes(q)) ||
        (vid.description && vid.description.toLowerCase().includes(q)) ||
        vid.tags.some(t => t.toLowerCase().includes(q));

      if (!matchesQuery) return false;

      if (selectedCategoryFilter === 'favorites') return !!vid.isFavorite;
      if (selectedCategoryFilter === 'custom') return !!vid.isCustom;
      if (selectedCategoryFilter !== 'all') return vid.category === selectedCategoryFilter;

      return true;
    });
  }, [state.videoResources, searchQuery, selectedCategoryFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA]">
        <div>
          <h2 className="text-lg font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
            <span>🎥</span>
            <span>Masterclasses & Video Guides</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#242D29] text-[#E5A93C] border border-[#384A41] font-bold light:bg-[#EFECE6] light:border-[#E5E3DA]">
              {state.videoResources.length} lectures
            </span>
          </h2>
          <p className="text-xs text-[#859A90] light:text-[#5C655E] mt-0.5">
            Curated talks & masterclasses on high-stakes communication, active listening, polyvagal theory & nervous system regulation
          </p>
        </div>

        {/* Action Button: Add from Link */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-[#E5A93C] text-[#121413] hover:bg-[#D4982B] text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Masterclass from Link</span>
        </button>
      </div>

      {/* Filter and Search Shelf */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#859A90] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by topic, speaker (Huberman, Voss...), or #tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#859A90] hover:text-[#F4F7F4]"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategoryFilter === 'all'
                ? 'bg-[#3D7D62] text-white'
                : 'bg-[#1B211E] text-[#859A90] border border-[#384A41] hover:border-[#859A90] light:bg-white light:border-[#E5E3DA]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('favorites')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              selectedCategoryFilter === 'favorites'
                ? 'bg-[#E5A93C] text-[#121413]'
                : 'bg-[#1B211E] text-[#859A90] border border-[#384A41] hover:border-[#859A90] light:bg-white light:border-[#E5E3DA]'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Starred</span>
          </button>
          {categories.slice(0, 4).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategoryFilter === cat
                  ? 'bg-[#3D7D62] text-white'
                  : 'bg-[#1B211E] text-[#859A90] border border-[#384A41] hover:border-[#859A90] light:bg-white light:border-[#E5E3DA]'
              }`}
            >
              {cat}
            </button>
          ))}
          {state.videoResources.some(v => v.isCustom) && (
            <button
              onClick={() => setSelectedCategoryFilter('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategoryFilter === 'custom'
                  ? 'bg-[#3D7D62] text-white'
                  : 'bg-[#1B211E] text-[#859A90] border border-[#384A41] hover:border-[#859A90] light:bg-white light:border-[#E5E3DA]'
              }`}
            >
              My Added
            </button>
          )}
        </div>
      </div>

      {/* Videos List */}
      {filteredVideos.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#1B211E] border border-[#384A41] text-center flex flex-col items-center gap-3 light:bg-white light:border-[#E5E3DA]">
          <div className="w-12 h-12 rounded-2xl bg-[#242D29] border border-[#384A41] flex items-center justify-center text-2xl text-[#859A90]">
            🎥
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#F4F7F4] light:text-[#1C221E]">
              No Masterclasses Found
            </h4>
            <p className="text-xs text-[#859A90] mt-1 max-w-sm">
              {searchQuery
                ? `No videos match "${searchQuery}". Try a different keyword or reset filters.`
                : 'Your study sanctuary has no videos in this category yet. Click below to add one from a YouTube or video link!'}
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#22533E] flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Masterclass from Link</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredVideos.map(vid => {
            const isYt = vid.platform === 'YouTube' || vid.url.includes('youtube.com') || vid.url.includes('youtu.be');
            const isVimeo = vid.platform === 'Vimeo' || vid.url.includes('vimeo.com');

            return (
              <div
                key={vid.id}
                className="group p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-md hover:border-[#3D7D62] transition-all flex flex-col justify-between gap-3 light:bg-white light:border-[#E5E3DA]"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#242D29] border border-[#384A41] flex items-center justify-center text-2xl shadow-sm shrink-0 light:bg-[#EFECE6] light:border-[#E5E3DA]">
                        {vid.thumbnailEmoji || '🎥'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#242D29] text-[#E5A93C] border border-[#384A41] light:bg-[#EFECE6] light:border-[#E5E3DA]">
                            {vid.category}
                          </span>
                          {isYt && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                              YouTube
                            </span>
                          )}
                          {isVimeo && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/40">
                              Vimeo
                            </span>
                          )}
                          {vid.isCustom && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#3D7D62]/20 text-[#68D391] border border-[#3D7D62]/40">
                              Custom
                            </span>
                          )}
                        </div>

                        <h3 className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E] mt-1 group-hover:text-[#E5A93C] transition-colors line-clamp-1">
                          {vid.title}
                        </h3>

                        {vid.instructor && (
                          <p className="text-[11px] font-medium text-[#859A90] light:text-[#5C655E]">
                            🎙️ {vid.instructor}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Star & Delete Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleVideoFavorite(vid.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          vid.isFavorite
                            ? 'text-[#E5A93C]'
                            : 'text-[#859A90] hover:text-[#E5A93C]'
                        }`}
                        title="Toggle Favorite"
                      >
                        <Star className={`w-4 h-4 ${vid.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      {vid.isCustom && (
                        <button
                          onClick={e => handleDeleteVideo(vid, e)}
                          className="p-1.5 rounded-lg text-[#859A90] hover:text-red-400 transition-colors"
                          title="Remove Masterclass"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#859A90] light:text-[#5C655E] line-clamp-2 leading-relaxed">
                    {vid.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-[#384A41]/50 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#859A90] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#E5A93C]" />
                      <span>{vid.durationLabel}</span>
                    </span>
                    {vid.playCount ? (
                      <span className="text-[10px] text-[#859A90]">
                        • {vid.playCount} studied
                      </span>
                    ) : null}
                  </div>

                  <button
                    onClick={() => handleOpenVideo(vid)}
                    className="px-3 py-1.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#22533E] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch & Study</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enhanced Video Player Modal with Study Timer & Notes */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#1B211E] border border-[#384A41] p-4 sm:p-5 shadow-2xl flex flex-col gap-4 my-auto light:bg-white light:border-[#E5E3DA] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#384A41]/60 light:border-[#E5E3DA]">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{activeVideo.thumbnailEmoji || '🎥'}</span>
                  <h3 className="text-sm font-black text-[#F4F7F4] truncate light:text-[#1C221E]">
                    {activeVideo.title}
                  </h3>
                </div>
                <p className="text-[11px] text-[#859A90] mt-0.5">
                  {activeVideo.instructor ? `${activeVideo.instructor} • ` : ''}
                  {activeVideo.category} • {activeVideo.durationLabel}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeVideo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#E5A93C] light:bg-[#EFECE6] light:border-[#E5E3DA]"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={handleCloseVideo}
                  className="p-1.5 rounded-xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Canvas / Responsive Embed */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#384A41] shadow-inner flex items-center justify-center relative">
              {(() => {
                const embed = getEmbedUrl(activeVideo);
                const isIframe = embed.includes('youtube') || embed.includes('vimeo');
                const isHtml5 = /\.(mp4|webm|ogg)($|\?)/i.test(embed);

                if (isIframe) {
                  return (
                    <iframe
                      src={embed}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                } else if (isHtml5) {
                  return (
                    <video
                      controls
                      autoPlay
                      src={embed}
                      className="w-full h-full object-contain"
                    >
                      Your browser does not support HTML5 video playback.
                    </video>
                  );
                } else {
                  return (
                    <div className="flex flex-col items-center justify-center p-6 text-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1B211E] border border-[#384A41] flex items-center justify-center text-2xl text-[#E5A93C]">
                        🎥
                      </div>
                      <p className="text-xs text-[#F4F7F4]">
                        External masterclass lecture from <strong>{activeVideo.platform || 'web'}</strong>
                      </p>
                      <a
                        href={activeVideo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#22533E] flex items-center gap-1.5 shadow-md"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Masterclass in New Tab</span>
                      </a>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Active Study Session Bar (Timer & Timestamp helper) */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#121413] border border-[#384A41] light:bg-[#FAF9F5] light:border-[#E5E3DA]">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#242D29] border border-[#384A41] text-[#E5A93C] font-mono text-xs font-bold light:bg-[#EFECE6] light:border-[#E5E3DA]">
                  <Timer className="w-3.5 h-3.5" />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-1 rounded-lg text-[#859A90] hover:text-[#F4F7F4]"
                  title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(0);
                  }}
                  className="p-1 rounded-lg text-[#859A90] hover:text-[#F4F7F4]"
                  title="Reset timer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleInsertTimestamp}
                className="px-2.5 py-1 rounded-xl bg-[#242D29] border border-[#384A41] text-[11px] font-bold text-[#E5A93C] hover:border-[#E5A93C] flex items-center gap-1 light:bg-[#EFECE6] light:border-[#E5E3DA]"
              >
                <span>⏱️ Insert Timestamp</span>
              </button>
            </div>

            {/* Notes Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#E5A93C] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Your Lecture Notes & Action Anchors:</span>
                </label>
                <span className="text-[10px] text-[#859A90]">
                  Auto-saved with timestamp bookmarks
                </span>
              </div>
              <textarea
                rows={3}
                value={videoNote}
                onChange={e => setVideoNote(e.target.value)}
                placeholder="Take notes while watching (e.g. key insights, quotes, or practical exercises)..."
                className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E] font-sans"
              />
              <div className="flex justify-between items-center pt-1">
                <button
                  onClick={handleSaveVideoNote}
                  className="py-1.5 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-[#F4F7F4] text-xs font-bold flex items-center gap-1.5 hover:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
                >
                  <Save className="w-3.5 h-3.5 text-[#859A90]" />
                  <span>Save Notes Only</span>
                </button>

                <button
                  onClick={handleCompleteSession}
                  className="py-2 px-4 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#22533E] shadow-md active:scale-95 transition-all"
                >
                  <CheckCircle className="w-4 h-4 text-[#E5A93C]" />
                  <span>Complete & Log Study (+20 XP, +2 🪙)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Masterclass Modal */}
      <AddMasterclassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
