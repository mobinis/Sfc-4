import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, BookOpen, CheckCircle, RefreshCw, X, Sparkles } from 'lucide-react';
import { LearnItem } from '../types';
import { LocalAiCopilot, AiCopilotResponse } from '../ai/LocalAiCopilot';
import { soundManager } from '../utils/soundHaptics';

export const LearnScreen: React.FC = () => {
  const { state, teachBackLearnItem } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTeachBack, setActiveTeachBack] = useState<LearnItem | null>(null);
  const [userExplanation, setUserExplanation] = useState<string>('');
  const [critique, setCritique] = useState<AiCopilotResponse | null>(null);
  const [isCritiquing, setIsCritiquing] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All Wisdom' },
    { id: 'bias', label: 'Cognitive Biases' },
    { id: 'communication', label: 'Communication' },
    { id: 'selfhelp', label: 'Habits & Stoicism' },
    { id: 'islamic', label: 'Spiritual Peace' },
    { id: 'affirmation', label: 'Affirmations' }
  ];

  const filteredItems = selectedCategory === 'all'
    ? state.learnStack
    : state.learnStack.filter(item => item.category === selectedCategory);

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOpenTeachBack = (item: LearnItem) => {
    setActiveTeachBack(item);
    setUserExplanation(item.userExplanation || item.teachBackNote || '');
    setCritique(null);
  };

  const handleAnalyzeFeynman = async () => {
    if (!activeTeachBack || !userExplanation.trim()) return;
    setIsCritiquing(true);
    try {
      const res = await LocalAiCopilot.critiqueFeynmanExplanation(userExplanation, activeTeachBack.title);
      setCritique(res);
      soundManager.playChime('step');
    } finally {
      setIsCritiquing(false);
    }
  };

  const handleSaveMastery = (rating: number) => {
    if (!activeTeachBack) return;
    teachBackLearnItem(activeTeachBack.id, userExplanation, rating);
    setActiveTeachBack(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
            <span>🧠</span> Mental Models & Active Recall
          </h2>
          <p className="text-xs text-[#859A90] light:text-[#5C655E]">
            Feynman technique, cognitive defusion & spaced rememorization
          </p>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-colors ${
              selectedCategory === c.id
                ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white'
                : 'bg-[#1B211E] border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#5C655E]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Wisdom Cards Grid */}
      <div className="flex flex-col gap-3">
        {filteredItems.map(item => {
          const isDue = item.nextReviewDue && item.nextReviewDue <= new Date().toISOString().split('T')[0];

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#1B211E] border border-[#384A41] shadow-md flex flex-col gap-3 light:bg-white light:border-[#E5E3DA]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#242D29] text-[#859A90] light:bg-[#EFECE6] light:text-[#5C655E]">
                      {item.category}
                    </span>
                    {isDue && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#E5A93C] text-[#121413]">
                        Due for Recall
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#B2C4BC] light:text-[#353E38] mt-1.5 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <button
                  onClick={() => playSpeech(`${item.title}. ${item.summary}`)}
                  className="p-2 rounded-xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#E5A93C] transition-colors light:bg-[#EFECE6] light:border-[#E5E3DA]"
                  title="Read Aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {item.whyNote && (
                <div className="p-2.5 rounded-xl bg-[#242D29]/60 border border-[#384A41]/60 text-[11px] text-[#859A90] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#5C655E]">
                  💡 <strong>Practical Application</strong>: {item.whyNote}
                </div>
              )}

              {/* Teach-Back / Recall Section */}
              <div className="flex items-center justify-between pt-2 border-t border-[#384A41]/50 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#859A90]">
                    Mastery: <strong className="text-[#F4F7F4] light:text-[#1C221E]">
                      {item.masteryRating === 3 ? '🟢 Mastered' : item.masteryRating === 2 ? '🟡 Solid' : item.masteryRating === 1 ? '🔴 Struggled' : 'Unassessed'}
                    </strong>
                  </span>
                  {item.nextReviewDue && (
                    <span className="text-[10px] text-[#859A90]">
                      • Due: {item.nextReviewDue}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenTeachBack(item)}
                  className="px-3 py-1.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#22533E] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Teach-Back Recall</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feynman Teach-Back Modal */}
      {activeTeachBack && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[85vh] rounded-2xl bg-[#1B211E] border border-[#384A41] p-6 shadow-2xl flex flex-col gap-4 overflow-hidden light:bg-white light:border-[#E5E3DA]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
                  <span>🧠</span> Active Recall: {activeTeachBack.title}
                </h3>
                <p className="text-xs text-[#859A90]">
                  Explain this concept simply in your own words (The Feynman Technique)
                </p>
              </div>
              <button
                onClick={() => setActiveTeachBack(null)}
                className="p-1.5 rounded-lg text-[#859A90] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#E5A93C]">Your Simple ELI10 Explanation & Analogies:</label>
              <textarea
                value={userExplanation}
                onChange={e => setUserExplanation(e.target.value)}
                placeholder="Explain it as if speaking to a 10-year old. Use analogies ('It's like...') and real-life action anchors ('When X happens, I do Y')..."
                rows={4}
                className="w-full p-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
              />
              <button
                onClick={handleAnalyzeFeynman}
                disabled={isCritiquing || !userExplanation.trim()}
                className="py-2 px-4 rounded-xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] text-xs font-bold self-end flex items-center gap-1.5 hover:bg-[#3D2E0A] transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isCritiquing ? 'Analyzing...' : 'AI Feynman Critique'}</span>
              </button>
            </div>

            {/* Critique Feedback */}
            {critique && (
              <div className="p-3.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line light:bg-[#EFECE6] light:border-[#E5E3DA]">
                {critique.analysisText}
              </div>
            )}

            {/* 3-Tier Self-Assessment Rubric */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#384A41]/50">
              <span className="text-[11px] font-bold text-[#859A90]">Rate your active recall mastery:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSaveMastery(1)}
                  className="py-2.5 px-2 rounded-xl bg-[#242D29] border border-[#B91C1C] text-[#D95D39] text-xs font-bold hover:bg-[#B91C1C]/20 transition-colors"
                >
                  🔴 Struggled (1d)
                </button>
                <button
                  onClick={() => handleSaveMastery(2)}
                  className="py-2.5 px-2 rounded-xl bg-[#242D29] border border-[#E5A93C] text-[#E5A93C] text-xs font-bold hover:bg-[#E5A93C]/20 transition-colors"
                >
                  🟡 Solid (4d)
                </button>
                <button
                  onClick={() => handleSaveMastery(3)}
                  className="py-2.5 px-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#22533E] transition-colors"
                >
                  🟢 Mastered (14d)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
