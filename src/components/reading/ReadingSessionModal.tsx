import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { BookResourceItem } from '../../types';
import {
  BookOpen,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Sparkles,
  Quote,
  Star,
  Bookmark,
  Calendar,
  Zap,
  Volume2
} from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';
import { DateUtils } from '../../utils/dateUtils';
import confetti from 'canvas-confetti';

interface ReadingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBook?: BookResourceItem | null;
}

export const ReadingSessionModal: React.FC<ReadingSessionModalProps> = ({
  isOpen,
  onClose,
  preselectedBook = null
}) => {
  const { state, logReadingSession, showToast } = useApp();

  const [activeMode, setActiveMode] = useState<'timer' | 'direct'>('direct');
  const [selectedBookId, setSelectedBookId] = useState<string>(
    preselectedBook ? preselectedBook.id : state.bookResources[0]?.id || ''
  );

  // Custom book fallback if user chooses manual title
  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');

  // Page tracking
  const currentBook = state.bookResources.find(b => b.id === selectedBookId);
  const initialStartPage = currentBook ? currentBook.pagesRead || 0 : 0;
  const [startPage, setStartPage] = useState<number>(initialStartPage);
  const [endPage, setEndPage] = useState<number>(initialStartPage + 15);

  // Time & Date
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [sessionDate, setSessionDate] = useState<string>(DateUtils.todayStr());

  // Notes, Quotes & Rating
  const [notes, setNotes] = useState<string>('');
  const [favoriteQuote, setFavoriteQuote] = useState<string>('');
  const [userRating, setUserRating] = useState<number>(5);

  // Live Timer State
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Sync start page when selected book changes
  useEffect(() => {
    if (currentBook) {
      const cur = currentBook.pagesRead || 0;
      setStartPage(cur);
      setEndPage(cur + 15);
    }
  }, [selectedBookId]);

  // Live timer interval
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  if (!isOpen) return null;

  const pagesRead = Math.max(0, endPage - startPage);
  const effectiveDuration = activeMode === 'timer' ? Math.max(1, Math.round(elapsedSeconds / 60)) : durationMinutes;
  const readingSpeedPpm = effectiveDuration > 0 ? Number(((pagesRead / effectiveDuration) * 60).toFixed(1)) : 0;
  const isFinishingBook = currentBook ? endPage >= currentBook.totalPages : false;

  const handleToggleTimer = () => {
    soundManager.playChime('click');
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    soundManager.playChime('click');
    setIsTimerRunning(false);
    setElapsedSeconds(0);
  };

  const handleInsertTimestamp = () => {
    soundManager.playChime('click');
    const stamp = `[${DateUtils.todayStr()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] `;
    setNotes(prev => (prev ? `${prev}\n${stamp}` : stamp));
  };

  const handleSaveSession = () => {
    if (pagesRead <= 0 && effectiveDuration <= 0) {
      showToast('Please enter pages read or session duration');
      return;
    }

    const title = currentBook ? currentBook.title : customTitle.trim() || 'Untitled Book';
    const author = currentBook ? currentBook.author : customAuthor.trim() || undefined;

    logReadingSession({
      bookId: currentBook ? currentBook.id : null,
      bookTitle: title,
      author,
      startPage,
      endPage,
      durationMinutes: effectiveDuration,
      notes: notes.trim() || undefined,
      favoriteQuote: favoriteQuote.trim() || undefined,
      date: sessionDate
    });

    onClose();
  };

  // Timer format display
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg max-h-[92vh] rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-2xl flex flex-col overflow-hidden light:bg-white light:border-[#E5E3DA]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#384A41]/60 flex items-center justify-between light:border-[#E5E3DA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] flex items-center justify-center text-lg shadow-sm">
              📖
            </div>
            <div>
              <h3 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-1.5">
                <span>Log Reading Session</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3D7D62]/30 text-[#68D391] border border-[#3D7D62]/50 font-bold">
                  +25 Learn XP
                </span>
              </h3>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                Track pages, flow duration, reading speed & memorable quotes
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playChime('click');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#242D29] border border-[#384A41] flex items-center justify-center text-[#859A90] hover:text-white transition-colors light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1.5 m-3 rounded-2xl bg-[#121413] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
          <button
            onClick={() => {
              soundManager.playChime('click');
              setActiveMode('direct');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeMode === 'direct'
                ? 'bg-[#3D7D62] text-white shadow-sm'
                : 'text-[#859A90] hover:text-white light:text-[#5C655E]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Fast Progress Log</span>
          </button>
          <button
            onClick={() => {
              soundManager.playChime('click');
              setActiveMode('timer');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeMode === 'timer'
                ? 'bg-[#3D7D62] text-white shadow-sm'
                : 'text-[#859A90] hover:text-white light:text-[#5C655E]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Live Reading Timer</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4">
          {/* Book Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-[#BAC8C0] light:text-[#4A5568]">
              Select Book
            </label>
            <select
              value={selectedBookId}
              onChange={e => setSelectedBookId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              {state.bookResources.map(book => (
                <option key={book.id} value={book.id}>
                  {book.coverEmoji} {book.title} ({book.author}) — p. {book.pagesRead}/{book.totalPages}
                </option>
              ))}
              <option value="custom">➕ Enter Custom Book / Article</option>
            </select>
          </div>

          {selectedBookId === 'custom' && (
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#242D29] border border-[#384A41] light:bg-[#F7F6F2] light:border-[#E5E3DA]">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#859A90]">Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="e.g. Deep Work"
                  className="p-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#859A90]">Author</label>
                <input
                  type="text"
                  value={customAuthor}
                  onChange={e => setCustomAuthor(e.target.value)}
                  placeholder="e.g. Cal Newport"
                  className="p-2 rounded-xl bg-[#121413] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
                />
              </div>
            </div>
          )}

          {/* Book Preview Card */}
          {currentBook && selectedBookId !== 'custom' && (
            <div className="p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/60 flex items-center justify-between gap-3 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentBook.coverEmoji}</span>
                <div>
                  <h4 className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                    {currentBook.title}
                  </h4>
                  <p className="text-[10px] text-[#859A90] light:text-[#5C655E]">
                    {currentBook.author} • <span className="text-[#E5A93C]">{currentBook.category}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-[#68D391]">
                  {Math.round(((currentBook.pagesRead || 0) / (currentBook.totalPages || 1)) * 100)}%
                </div>
                <div className="text-[10px] text-[#859A90]">
                  {currentBook.pagesRead || 0} / {currentBook.totalPages} pp
                </div>
              </div>
            </div>
          )}

          {/* Live Timer Mode Body */}
          {activeMode === 'timer' && (
            <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-[#121413] border border-[#384A41] gap-4 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[#859A90]">
                {isTimerRunning ? 'Mindful Focus In Progress' : 'Ready To Read'}
              </div>

              {/* Big Digital Timer Display */}
              <div className="text-5xl font-black font-mono text-[#F4F7F4] light:text-[#1C221E] tracking-tight">
                {formatTimer(elapsedSeconds)}
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleTimer}
                  className={`h-12 px-6 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                    isTimerRunning
                      ? 'bg-[#E5A93C] text-[#121413] hover:bg-[#D4982B]'
                      : 'bg-[#3D7D62] text-white hover:bg-[#2D6A4F]'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Reading</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetTimer}
                  className="h-12 w-12 rounded-2xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] flex items-center justify-center transition-all active:scale-95 light:bg-white light:border-[#E5E3DA]"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Page Range Input */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
              <label className="text-[10px] font-bold text-[#859A90] light:text-[#5C655E]">
                Start Page
              </label>
              <input
                type="number"
                min={0}
                value={startPage}
                onChange={e => setStartPage(Math.max(0, parseInt(e.target.value) || 0))}
                className="p-2 rounded-xl bg-[#121413] border border-[#384A41] text-sm font-black text-[#F4F7F4] text-center focus:outline-none focus:border-[#3D7D62] light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
              />
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
              <label className="text-[10px] font-bold text-[#859A90] light:text-[#5C655E]">
                End Page
              </label>
              <input
                type="number"
                min={startPage}
                value={endPage}
                onChange={e => setEndPage(Math.max(startPage, parseInt(e.target.value) || startPage))}
                className="p-2 rounded-xl bg-[#121413] border border-[#384A41] text-sm font-black text-[#E5A93C] text-center focus:outline-none focus:border-[#E5A93C] light:bg-white light:border-[#E5E3DA] light:text-[#D97706]"
              />
            </div>
          </div>

          {/* Direct Duration Controls (Visible in Direct Mode) */}
          {activeMode === 'direct' && (
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/60 light:bg-[#F7F6F2] light:border-[#E5E3DA]">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#859A90] light:text-[#5C655E]">
                  Reading Duration
                </label>
                <span className="text-xs font-black text-[#68D391]">
                  {durationMinutes} minutes
                </span>
              </div>

              {/* Quick minute pill presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[10, 15, 20, 25, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      soundManager.playChime('click');
                      setDurationMinutes(mins);
                    }}
                    className={`py-1 px-2.5 rounded-xl text-xs font-bold transition-all ${
                      durationMinutes === mins
                        ? 'bg-[#3D7D62] text-white shadow-xs'
                        : 'bg-[#121413] text-[#859A90] hover:text-white border border-[#384A41] light:bg-white light:border-[#E5E3DA]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Velocity & Progress Calculation Banner */}
          <div className="p-3 rounded-2xl bg-[#121413] border border-[#384A41] flex items-center justify-between light:bg-[#EFECE6] light:border-[#E5E3DA]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#E5A93C]" />
              <div>
                <span className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                  {pagesRead} pages read
                </span>
                <span className="text-[10px] text-[#859A90] block">
                  Speed: ~{readingSpeedPpm} pages/hr
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-[#68D391]">
                +{25 + Math.min(25, pagesRead)} XP
              </span>
              <span className="text-[10px] text-[#E5A93C] block">+2 🪙 Coins</span>
            </div>
          </div>

          {/* Favorite Quote Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#859A90] flex items-center gap-1 light:text-[#5C655E]">
              <Quote className="w-3 h-3 text-[#E5A93C]" />
              <span>Memorable Quote or Insight (Optional)</span>
            </label>
            <input
              type="text"
              value={favoriteQuote}
              onChange={e => setFavoriteQuote(e.target.value)}
              placeholder='e.g. "The deepest urge in human nature is the desire to be important."'
              className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          {/* Personal Notes & Reflections */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-[#859A90] light:text-[#5C655E]">
                Personal Takeaways & Commitments
              </label>
              <button
                type="button"
                onClick={handleInsertTimestamp}
                className="text-[10px] font-bold text-[#E5A93C] hover:text-[#F3BA55] flex items-center gap-1"
              >
                <span>+ Insert Stamp ⏱️</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What did you learn? How will you apply this principle today?"
              className="p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
          </div>

          {/* If finishing book: show rating selector */}
          {isFinishingBook && (
            <div className="p-3.5 rounded-2xl bg-[#2E2308] border border-[#E5A93C] flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E5A93C]" />
                <h4 className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                  🎉 Book Completion! How would you rate it?
                </h4>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      soundManager.playChime('click');
                      setUserRating(star);
                    }}
                    className="p-1 text-lg transition-transform active:scale-125"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        userRating >= star
                          ? 'text-[#E5A93C] fill-[#E5A93C]'
                          : 'text-[#859A90]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-[#384A41]/60 flex items-center justify-between gap-3 light:border-[#E5E3DA]">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#859A90] hover:text-white transition-colors light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveSession}
            className="flex-1 py-2.5 px-5 rounded-xl bg-[#3D7D62] text-white text-xs font-black hover:bg-[#2D6A4F] transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete & Log Reading</span>
          </button>
        </div>
      </div>
    </div>
  );
};
