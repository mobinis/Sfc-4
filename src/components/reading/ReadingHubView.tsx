import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookResourceItem, ReadingSessionRecord, MeasurableTarget } from '../../types';
import {
  BookOpen,
  Plus,
  Clock,
  Zap,
  TrendingUp,
  Bookmark,
  Quote,
  Star,
  CheckCircle2,
  Trash2,
  Calendar,
  Sparkles,
  ChevronRight,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';
import { ReadingSessionModal } from './ReadingSessionModal';
import { CustomBookModal } from './CustomBookModal';
import { soundManager } from '../../utils/soundHaptics';
import { DateUtils } from '../../utils/dateUtils';

export const ReadingHubView: React.FC = () => {
  const {
    state,
    deleteReadingSession,
    updateBookReadingStatus,
    showToast
  } = useApp();

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedBookForSession, setSelectedBookForSession] = useState<BookResourceItem | null>(null);
  const [isCustomBookModalOpen, setIsCustomBookModalOpen] = useState(false);

  const [activeTabFilter, setActiveTabFilter] = useState<'currently_reading' | 'all' | 'completed' | 'want_to_read'>('currently_reading');
  const [searchQuery, setSearchQuery] = useState('');

  const today = DateUtils.todayStr();

  // Metrics calculations
  const allSessions = state.readingSessions || [];
  const totalPagesRead = allSessions.reduce((acc, s) => acc + (s.pagesRead || 0), 0);
  const totalMinutesRead = allSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalHoursRead = (totalMinutesRead / 60).toFixed(1);

  const todaySessions = allSessions.filter(s => s.date === today);
  const todayPagesRead = todaySessions.reduce((acc, s) => acc + (s.pagesRead || 0), 0);

  const completedBooks = state.bookResources.filter(b => b.status === 'completed');
  const activeBooks = state.bookResources.filter(b => b.status === 'reading');

  const avgSpeed = allSessions.length > 0 && totalMinutesRead > 0
    ? Math.round((totalPagesRead / totalMinutesRead) * 60)
    : 35;

  // Filtered books
  const filteredBooks = state.bookResources.filter(b => {
    if (activeTabFilter === 'currently_reading' && b.status !== 'reading') return false;
    if (activeTabFilter === 'completed' && b.status !== 'completed') return false;
    if (activeTabFilter === 'want_to_read' && b.status !== 'want_to_read') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q);
    }
    return true;
  });

  // Reading Measurable Targets
  const readingTargets = state.measurableTargets.filter(t => t.category === 'reading' && t.status === 'active');

  // Collected memorable quotes across sessions and books
  const collectedQuotes: { quote: string; bookTitle: string; author?: string }[] = [];
  allSessions.forEach(s => {
    if (s.favoriteQuote && !collectedQuotes.some(q => q.quote === s.favoriteQuote)) {
      collectedQuotes.push({ quote: s.favoriteQuote, bookTitle: s.bookTitle, author: s.author });
    }
  });
  state.bookResources.forEach(b => {
    if (b.favoriteQuotes) {
      b.favoriteQuotes.forEach(fq => {
        if (!collectedQuotes.some(q => q.quote === fq)) {
          collectedQuotes.push({ quote: fq, bookTitle: b.title, author: b.author });
        }
      });
    }
  });

  const handleStartReading = (book?: BookResourceItem) => {
    soundManager.playChime('click');
    setSelectedBookForSession(book || null);
    setIsSessionModalOpen(true);
  };

  const handleDeleteSession = (id: string) => {
    soundManager.playChime('click');
    deleteReadingSession(id);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in">
      {/* Reading Hub Header & Actions */}
      <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 light:bg-white light:border-[#E5E3DA]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] flex items-center justify-center text-xl shadow-sm">
            📖
          </div>
          <div>
            <h3 className="text-base font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
              <span>Reading & Knowledge Progression</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3D7D62]/30 text-[#68D391] border border-[#3D7D62]/50 font-bold">
                Learn Pillar
              </span>
            </h3>
            <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
              Track books, page volume, focused reading speed & key wisdom
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              soundManager.playChime('click');
              setIsCustomBookModalOpen(true);
            }}
            className="py-2 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] flex items-center gap-1.5 transition-all light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Book</span>
          </button>

          <button
            onClick={() => handleStartReading()}
            className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-[#3D7D62] text-white text-xs font-black hover:bg-[#2D6A4F] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Log Reading Session</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Analytics KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41]/60 flex flex-col gap-1 light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
              Books Finished
            </span>
            <span className="text-xs">🏆</span>
          </div>
          <div className="text-xl font-black text-[#F4F7F4] light:text-[#1C221E]">
            {completedBooks.length} <span className="text-xs font-normal text-[#859A90]">/ {state.bookResources.length} total</span>
          </div>
          <span className="text-[10px] text-[#E5A93C] font-semibold">
            {activeBooks.length} in progress
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41]/60 flex flex-col gap-1 light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
              Pages Read
            </span>
            <span className="text-xs">📄</span>
          </div>
          <div className="text-xl font-black text-[#68D391]">
            {totalPagesRead} <span className="text-xs font-normal text-[#859A90]">pp</span>
          </div>
          <span className="text-[10px] text-[#68D391] font-semibold">
            +{todayPagesRead} pp today
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41]/60 flex flex-col gap-1 light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
              Reading Time
            </span>
            <span className="text-xs">⏱️</span>
          </div>
          <div className="text-xl font-black text-[#F4F7F4] light:text-[#1C221E]">
            {totalHoursRead} <span className="text-xs font-normal text-[#859A90]">hrs</span>
          </div>
          <span className="text-[10px] text-[#859A90]">
            {totalMinutesRead} minutes total
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41]/60 flex flex-col gap-1 light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#859A90] light:text-[#5C655E]">
              Reading Velocity
            </span>
            <span className="text-xs">⚡</span>
          </div>
          <div className="text-xl font-black text-[#E5A93C]">
            ~{avgSpeed} <span className="text-xs font-normal text-[#859A90]">p/hr</span>
          </div>
          <span className="text-[10px] text-[#859A90]">
            Paced deep comprehension
          </span>
        </div>
      </div>

      {/* Active Reading Targets Overview */}
      {readingTargets.length > 0 && (
        <div className="p-3.5 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-xs flex flex-col gap-2.5 light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🎯</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#BAC8C0] light:text-[#4A5568]">
                Reading Targets & Goals
              </h4>
            </div>
            <span className="text-[10px] font-bold text-[#68D391]">
              Daily Target Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {readingTargets.map(t => {
              const percent = t.targetValue > 0 ? Math.min(100, Math.round((t.currentProgress / t.targetValue) * 100)) : 0;
              return (
                <div
                  key={t.id}
                  className="p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/60 flex items-center justify-between gap-3 light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl">{t.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E] truncate">
                        {t.title}
                      </div>
                      <div className="text-[10px] text-[#859A90] light:text-[#5C655E]">
                        {t.currentProgress} / {t.targetValue} {t.unit} ({percent}%)
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartReading()}
                    className="py-1 px-2.5 rounded-xl bg-[#3D7D62] text-white text-[11px] font-black hover:bg-[#2D6A4F] transition-all"
                  >
                    Log
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reading Shelf Section with Filter Tabs */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-1">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#E5A93C]" />
            <h4 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E]">
              Book Shelf & Field Guides
            </h4>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#242D29] border border-[#384A41]/60 text-xs font-bold light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <button
              onClick={() => setActiveTabFilter('currently_reading')}
              className={`py-1 px-2.5 rounded-lg transition-all ${
                activeTabFilter === 'currently_reading'
                  ? 'bg-[#3D7D62] text-white shadow-xs'
                  : 'text-[#859A90] hover:text-[#F4F7F4]'
              }`}
            >
              Reading ({activeBooks.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`py-1 px-2.5 rounded-lg transition-all ${
                activeTabFilter === 'all'
                  ? 'bg-[#3D7D62] text-white shadow-xs'
                  : 'text-[#859A90] hover:text-[#F4F7F4]'
              }`}
            >
              All ({state.bookResources.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('completed')}
              className={`py-1 px-2.5 rounded-lg transition-all ${
                activeTabFilter === 'completed'
                  ? 'bg-[#3D7D62] text-white shadow-xs'
                  : 'text-[#859A90] hover:text-[#F4F7F4]'
              }`}
            >
              Finished ({completedBooks.length})
            </button>
          </div>
        </div>

        {/* Books List / Grid */}
        <div className="grid grid-cols-1 gap-2.5">
          {filteredBooks.map(book => {
            const pages = book.pagesRead || 0;
            const total = book.totalPages || 1;
            const pct = Math.min(100, Math.round((pages / total) * 100));

            return (
              <div
                key={book.id}
                className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm flex flex-col gap-3 transition-all light:bg-white light:border-[#E5E3DA]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-14 rounded-2xl bg-[#242D29] border border-[#384A41] flex items-center justify-center text-3xl shrink-0 light:bg-[#EFECE6] light:border-[#E5E3DA]">
                      {book.coverEmoji}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-extrabold text-[#F4F7F4] light:text-[#1C221E] truncate">
                          {book.title}
                        </h5>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2E2308] border border-[#E5A93C]/40 text-[#E5A93C] font-bold">
                          {book.category}
                        </span>
                        {book.format && (
                          <span className="text-[10px] text-[#859A90]">
                            {book.format === 'physical' ? '📖 Paper' : book.format === 'ebook' ? '📱 Kindle' : '🎧 Audio'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#859A90] light:text-[#5C655E] mt-0.5">
                        {book.author}
                      </p>
                      <p className="text-xs text-[#B2C4BC] light:text-[#353E38] mt-1 line-clamp-2">
                        {book.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={() => handleStartReading(book)}
                      className="py-1.5 px-3.5 rounded-xl bg-[#3D7D62] text-white text-xs font-black hover:bg-[#2D6A4F] transition-all flex items-center gap-1 shadow-sm active:scale-95 whitespace-nowrap"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{book.status === 'completed' ? 'Re-read' : 'Log / Read'}</span>
                    </button>

                    <select
                      value={book.status}
                      onChange={e => updateBookReadingStatus(book.id, e.target.value as any)}
                      className="text-[10px] py-1 px-1.5 rounded-lg bg-[#242D29] border border-[#384A41] text-[#859A90] focus:outline-none light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                    >
                      <option value="reading">📖 Reading</option>
                      <option value="want_to_read">📌 Want to Read</option>
                      <option value="completed">✅ Completed</option>
                      <option value="paused">⏸️ Paused</option>
                    </select>
                  </div>
                </div>

                {/* Progress Bar & Pages read */}
                <div className="flex items-center gap-3 pt-1 border-t border-[#384A41]/40 light:border-[#E5E3DA]">
                  <div className="flex-1 h-2 rounded-full bg-[#121413] light:bg-[#D5D2C9] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#3D7D62] to-[#E5A93C] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs font-black text-[#E5A93C] light:text-[#D97706] whitespace-nowrap">
                    {pages} / {total} pp ({pct}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reading Sessions Timeline */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#3D7D62]" />
            <h4 className="text-sm font-black text-[#F4F7F4] light:text-[#1C221E]">
              Recent Reading Activity Timeline
            </h4>
          </div>
          <span className="text-[11px] font-bold text-[#859A90]">
            {allSessions.length} total sessions
          </span>
        </div>

        {allSessions.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#1B211E] border border-dashed border-[#384A41] text-center flex flex-col items-center justify-center gap-2 light:bg-white light:border-[#E5E3DA]">
            <BookOpen className="w-8 h-8 text-[#859A90]" />
            <h5 className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
              No Reading Sessions Recorded Yet
            </h5>
            <p className="text-[11px] text-[#859A90] max-w-xs">
              Log a 15-minute sprint or enter pages read to start cultivating your deep reading momentum.
            </p>
            <button
              onClick={() => handleStartReading()}
              className="mt-2 py-2 px-4 rounded-xl bg-[#3D7D62] text-white text-xs font-bold hover:bg-[#2D6A4F] transition-all"
            >
              Start First Reading Session
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {allSessions.slice(0, 8).map(session => (
              <div
                key={session.id}
                className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41]/60 flex flex-col gap-2 hover:border-[#3D7D62]/60 transition-all light:bg-white light:border-[#E5E3DA]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#242D29] border border-[#384A41] flex items-center justify-center text-sm shrink-0 light:bg-[#F7F6F2]">
                      📖
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                        {session.bookTitle}
                      </div>
                      <div className="text-[10px] text-[#859A90] light:text-[#5C655E] flex items-center gap-2">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span className="text-[#68D391] font-bold">
                          +{session.pagesRead} pages (pp. {session.startPage}–{session.endPage})
                        </span>
                        <span>•</span>
                        <span>{session.durationMinutes} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {session.readingSpeedPpm && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#121413] border border-[#384A41] text-[#E5A93C] font-bold light:bg-[#F7F6F2]">
                        ~{session.readingSpeedPpm} p/h
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-1 rounded-lg text-[#859A90] hover:text-[#EF4444] transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Favorite Quote if present */}
                {session.favoriteQuote && (
                  <div className="p-2 rounded-xl bg-[#2E2308]/50 border border-[#E5A93C]/30 text-[11px] text-[#E5A93C] italic flex items-start gap-1.5 light:bg-[#FEF3C7] light:text-[#B45309]">
                    <Quote className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>"{session.favoriteQuote}"</span>
                  </div>
                )}

                {/* Notes if present */}
                {session.notes && !session.notes.startsWith('Read pages') && (
                  <p className="text-[11px] text-[#B2C4BC] light:text-[#353E38] pl-10 whitespace-pre-line">
                    {session.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extracted Quotes & Wisdom Reel */}
      {collectedQuotes.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-xs flex flex-col gap-3 light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E5A93C]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-[#BAC8C0] light:text-[#4A5568]">
              Wisdom Highlights & Saved Quotes ({collectedQuotes.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {collectedQuotes.slice(0, 4).map((q, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[#242D29] border border-[#384A41]/60 flex flex-col justify-between gap-2 light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                <p className="text-xs italic text-[#F4F7F4] light:text-[#1C221E] leading-relaxed">
                  "{q.quote}"
                </p>
                <div className="text-[10px] font-bold text-[#E5A93C] light:text-[#D97706] self-end">
                  — {q.bookTitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ReadingSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        preselectedBook={selectedBookForSession}
      />

      <CustomBookModal
        isOpen={isCustomBookModalOpen}
        onClose={() => setIsCustomBookModalOpen(false)}
      />
    </div>
  );
};
