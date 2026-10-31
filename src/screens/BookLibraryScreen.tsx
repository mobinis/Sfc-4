import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Check, ExternalLink, Bookmark, ChevronDown, ChevronRight, Save, Plus, Clock, Star } from 'lucide-react';
import { BookResourceItem } from '../types';
import { soundManager } from '../utils/soundHaptics';
import { ReadingSessionModal } from '../components/reading/ReadingSessionModal';
import { CustomBookModal } from '../components/reading/CustomBookModal';

export const BookLibraryScreen: React.FC = () => {
  const { state, updateBookChapter, saveBookNote, updateBookReadingStatus, showToast } = useApp();

  const [selectedBook, setSelectedBook] = useState<BookResourceItem | null>(null);
  const [activeTab, setActiveTab] = useState<'chapters' | 'guide' | 'notes'>('chapters');
  const [userNote, setUserNote] = useState<string>('');

  // Modals
  const [isReadingSessionOpen, setIsReadingSessionOpen] = useState(false);
  const [bookForSession, setBookForSession] = useState<BookResourceItem | null>(null);
  const [isCustomBookOpen, setIsCustomBookOpen] = useState(false);

  const handleOpenBook = (book: BookResourceItem) => {
    setSelectedBook(book);
    setUserNote(book.userNotes || '');
    setActiveTab('chapters');
  };

  const handleStartSession = (book?: BookResourceItem) => {
    soundManager.playChime('click');
    setBookForSession(book || null);
    setIsReadingSessionOpen(true);
  };

  const handleSaveNote = () => {
    if (!selectedBook) return;
    saveBookNote(selectedBook.id, userNote);
    showToast('Book notes saved successfully!');
    soundManager.playChime('click');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
            <span>📚</span> Books & Field Guides
          </h2>
          <p className="text-xs text-[#859A90] light:text-[#5C655E]">
            High-EQ interpersonal mastery, healthy boundaries & nonviolent communication
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              soundManager.playChime('click');
              setIsCustomBookOpen(true);
            }}
            className="py-2 px-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] flex items-center gap-1.5 transition-all light:bg-[#F7F6F2] light:border-[#E5E3DA]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Book</span>
          </button>
          <button
            onClick={() => handleStartSession()}
            className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-[#3D7D62] text-white text-xs font-black hover:bg-[#2D6A4F] flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Log Reading</span>
          </button>
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 gap-3">
        {state.bookResources.map(book => {
          const completedCount = book.chapters.filter(c => c.read).length;
          const totalChapters = book.chapters.length || 1;
          const progressPercent = book.totalPages > 0 && book.pagesRead > 0
            ? Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100))
            : Math.round((completedCount / totalChapters) * 100);

          return (
            <div
              key={book.id}
              className="p-4 rounded-2xl bg-[#1B211E] border border-[#384A41] shadow-md flex flex-col gap-3 light:bg-white light:border-[#E5E3DA]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-14 rounded-xl bg-[#242D29] border border-[#384A41] flex items-center justify-center text-3xl shadow-sm shrink-0 light:bg-[#EFECE6] light:border-[#E5E3DA]">
                    {book.coverEmoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-[#F4F7F4] light:text-[#1C221E] truncate">
                        {book.title}
                      </h3>
                      {book.status === 'completed' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3D7D62]/30 text-[#68D391] border border-[#3D7D62]/40 font-bold">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#859A90] light:text-[#5C655E] mt-0.5">
                      {book.author} • <span className="text-[#E5A93C]">{book.category}</span>
                    </p>
                    <p className="text-xs text-[#B2C4BC] light:text-[#353E38] mt-1 line-clamp-2">
                      {book.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <button
                    onClick={() => handleStartSession(book)}
                    className="px-3 py-1.5 rounded-xl bg-[#3D7D62] text-white text-xs font-bold hover:bg-[#2D6A4F] transition-colors whitespace-nowrap shadow-sm flex items-center gap-1 active:scale-95"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Log Read</span>
                  </button>

                  <button
                    onClick={() => handleOpenBook(book)}
                    className="px-3 py-1 rounded-xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] text-xs font-bold transition-colors whitespace-nowrap light:bg-[#F7F6F2] light:border-[#E5E3DA]"
                  >
                    Open Study
                  </button>
                </div>
              </div>

              {/* Progress Bar & Pages Info */}
              <div className="flex items-center gap-3 pt-1 border-t border-[#384A41]/40 light:border-[#E5E3DA]">
                <div className="flex-1 h-2 rounded-full bg-[#121413] light:bg-[#D5D2C9] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#3D7D62] to-[#E5A93C] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[11px] font-bold text-[#E5A93C] light:text-[#D97706] whitespace-nowrap">
                  {book.pagesRead || 0} / {book.totalPages || 0} pp ({progressPercent}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Study Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[88vh] rounded-2xl bg-[#1B211E] border border-[#384A41] p-6 shadow-2xl flex flex-col gap-4 overflow-hidden light:bg-white light:border-[#E5E3DA]">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedBook.coverEmoji}</span>
                <div>
                  <h3 className="text-base font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
                    {selectedBook.title}
                  </h3>
                  <p className="text-xs text-[#859A90] light:text-[#5C655E]">
                    {selectedBook.author} • {selectedBook.category} • {selectedBook.pagesRead || 0}/{selectedBook.totalPages} pp
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartSession(selectedBook)}
                  className="py-1.5 px-3 rounded-xl bg-[#3D7D62] text-white text-xs font-bold hover:bg-[#2D6A4F] flex items-center gap-1 shadow-sm"
                >
                  <Clock className="w-3 h-3" />
                  <span>Log Reading</span>
                </button>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="p-1.5 rounded-lg text-[#859A90] hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold light:bg-[#EFECE6] light:border-[#E5E3DA]">
              <button
                onClick={() => setActiveTab('chapters')}
                className={`py-2 rounded-lg transition-colors ${
                  activeTab === 'chapters'
                    ? 'bg-[#2D6A4F] text-white shadow-sm'
                    : 'text-[#859A90] hover:text-[#F4F7F4]'
                }`}
              >
                Chapters ({selectedBook.chapters.filter(c => c.read).length}/{selectedBook.chapters.length})
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`py-2 rounded-lg transition-colors ${
                  activeTab === 'guide'
                    ? 'bg-[#2D6A4F] text-white shadow-sm'
                    : 'text-[#859A90] hover:text-[#F4F7F4]'
                }`}
              >
                Field Guide
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-2 rounded-lg transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-[#2D6A4F] text-white shadow-sm'
                    : 'text-[#859A90] hover:text-[#F4F7F4]'
                }`}
              >
                Personal Notes
              </button>
            </div>

            {/* Content view */}
            <div className="flex-1 overflow-y-auto pr-1">
              {activeTab === 'chapters' && (
                <div className="flex flex-col gap-3">
                  {selectedBook.chapters.map(chapter => (
                    <div
                      key={chapter.id}
                      className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
                        chapter.read
                          ? 'bg-[#2A5643]/20 border-[#3D7D62]'
                          : 'bg-[#242D29] border-[#384A41] light:bg-[#EFECE6] light:border-[#E5E3DA]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
                            {chapter.title}
                          </h4>
                          <p className="text-[11px] text-[#B2C4BC] light:text-[#353E38] mt-1">
                            {chapter.summary}
                          </p>
                        </div>
                        <button
                          onClick={() => updateBookChapter(selectedBook.id, chapter.id, !chapter.read)}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                            chapter.read
                              ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white'
                              : 'bg-[#121413] border-[#384A41] text-[#859A90]'
                          }`}
                        >
                          {chapter.read && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>
                      </div>

                      {chapter.practicalExercise && (
                        <div className="p-2 rounded-lg bg-[#121413]/50 text-[10px] text-[#E5A93C] light:bg-white/80 light:text-[#D97706]">
                          🎯 <strong>Practical Exercise</strong>: {chapter.practicalExercise}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'guide' && (
                <div className="p-4 rounded-xl bg-[#242D29] border border-[#384A41] text-xs leading-relaxed whitespace-pre-line text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]">
                  {selectedBook.fullGuideContent}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="flex flex-col gap-3">
                  <textarea
                    rows={8}
                    value={userNote}
                    onChange={e => setUserNote(e.target.value)}
                    placeholder="Record key reflections, verbatim quotes, or practical action commitments from this book..."
                    className="w-full p-3.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="py-2.5 px-4 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold self-end flex items-center gap-1.5 hover:bg-[#22533E] shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Book Notes</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBook(null)}
              className="w-full py-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <ReadingSessionModal
        isOpen={isReadingSessionOpen}
        onClose={() => setIsReadingSessionOpen(false)}
        preselectedBook={bookForSession}
      />

      <CustomBookModal
        isOpen={isCustomBookOpen}
        onClose={() => setIsCustomBookOpen(false)}
      />
    </div>
  );
};
