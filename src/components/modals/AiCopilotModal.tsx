import React, { useState } from 'react';
import { X, Sparkles, Compass, HelpCircle, Save, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocalAiCopilot, AiCopilotResponse } from '../../ai/LocalAiCopilot';
import { soundManager } from '../../utils/soundHaptics';

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'diagnostic' | 'next' | 'reflection' | 'distortion';
}

export const AiCopilotModal: React.FC<AiCopilotModalProps> = ({ isOpen, onClose, initialMode = 'next' }) => {
  const { state, awardXp, awardCoins, saveJournalEntry, toggleLowEnergy, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'next' | 'diagnostic' | 'reflection' | 'distortion'>(initialMode);
  const [response, setResponse] = useState<AiCopilotResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [journalSaved, setJournalSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const runAnalysis = async (mode: 'next' | 'diagnostic' | 'reflection' | 'distortion') => {
    setActiveTab(mode);
    setLoading(true);
    setJournalSaved(false);

    try {
      if (mode === 'diagnostic') {
        const res = await LocalAiCopilot.diagnosePatternsAndFriction(state);
        setResponse(res);
      } else if (mode === 'next') {
        const res = await LocalAiCopilot.suggestWhatToDoNext(state);
        setResponse(res);
      } else if (mode === 'reflection') {
        const res = await LocalAiCopilot.startGuidedReflectionCoach(state);
        setResponse(res);
      } else if (mode === 'distortion') {
        if (!userInput.trim()) {
          setResponse({
            title: 'Cognitive Distortion Scanner',
            analysisText: 'Type an anxious, stressful, or self-critical thought above to scan for the 8 classic cognitive distortion patterns and receive evidence-based reframing.',
            interactiveTools: [],
            confidence: 1.0
          });
        } else {
          const matches = LocalAiCopilot.detectDistortions(userInput);
          if (matches.length === 0) {
            setResponse({
              title: 'Balanced Perspective Detected',
              analysisText: '✅ No severe cognitive distortions (Catastrophizing, All-or-Nothing, Emotional Reasoning, etc.) detected in your input. Your reflection appears grounded and balanced.',
              interactiveTools: [
                { id: 'save_clean_ref', type: 'SAVE_REFLECTION', label: 'Save Reflection to Journal (+15 XP)', payload: userInput, emoji: '✍️' }
              ],
              confidence: 0.95
            });
          } else {
            const lines: string[] = ['🔍 **Cognitive Distortions Identified**:\n'];
            matches.forEach(m => {
              lines.push(`• **${m.name}**: ${m.description}`);
              lines.push(`  *Stoic Reframing*: ${m.reframingAdvice}\n`);
            });
            lines.push('💡 Remember: Thoughts are neural hypotheses, not absolute facts. You can observe a thought without adopting it.');

            setResponse({
              title: 'Cognitive Distortion Reframing',
              analysisText: lines.join('\n'),
              interactiveTools: [
                { id: 'save_reframed', type: 'SAVE_REFLECTION', label: 'Save Reframed Insight (+15 XP)', payload: userInput, emoji: '✍️' }
              ],
              confidence: 0.98
            });
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToolClick = (tool: { id: string; type: string; label: string; payload: string }) => {
    soundManager.playChime('click');
    if (tool.type === 'SAVE_REFLECTION') {
      saveJournalEntry(response?.analysisText || 'Mindful Reflection', 3, ['#ai-reframing', '#growth']);
      setJournalSaved(true);
      awardXp(15, 'Reflection saved to journal');
      awardCoins(2);
      showToast('Reflection deposited directly into your Journal!');
    } else if (tool.payload === 'toggle_low_energy') {
      toggleLowEnergy();
    } else {
      showToast(`Action triggered: ${tool.label}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[85vh] rounded-2xl bg-[#1B211E] border border-[#384A41] p-6 shadow-2xl flex flex-col gap-4 overflow-hidden light:bg-white light:border-[#E5E3DA]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] light:bg-[#FEF3C7] light:text-[#D97706]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F4F7F4] light:text-[#1C221E]">
                Local AI Reflection Coach
              </h3>
              <p className="text-xs text-[#859A90] light:text-[#5C655E]">
                Sub-110MB on-device behavioral copilot • 100% private & offline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#859A90] hover:text-[#F4F7F4] hover:bg-[#242D29] light:hover:bg-[#EFECE6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#242D29] border border-[#384A41] text-[11px] font-bold light:bg-[#EFECE6] light:border-[#E5E3DA]">
          <button
            onClick={() => runAnalysis('next')}
            className={`py-2 px-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'next'
                ? 'bg-[#2D6A4F] text-white shadow-sm'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Next Move</span>
          </button>
          <button
            onClick={() => runAnalysis('diagnostic')}
            className={`py-2 px-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'diagnostic'
                ? 'bg-[#2D6A4F] text-white shadow-sm'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Audit</span>
          </button>
          <button
            onClick={() => runAnalysis('reflection')}
            className={`py-2 px-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'reflection'
                ? 'bg-[#2D6A4F] text-white shadow-sm'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <span>🌿</span>
            <span>Socratic</span>
          </button>
          <button
            onClick={() => runAnalysis('distortion')}
            className={`py-2 px-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'distortion'
                ? 'bg-[#2D6A4F] text-white shadow-sm'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <span>🧠</span>
            <span>Reframe</span>
          </button>
        </div>

        {/* Distortion user input box if on distortion tab */}
        {activeTab === 'distortion' && (
          <div className="flex flex-col gap-2">
            <textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="Type an anxious or frustrating thought here (e.g., 'I completely failed my habit and ruined everything')..."
              rows={3}
              className="w-full p-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] focus:outline-none focus:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
            />
            <button
              onClick={() => runAnalysis('distortion')}
              className="py-2 px-4 rounded-xl bg-[#E5A93C] text-[#121413] text-xs font-bold self-end hover:bg-[#d4962b] transition-colors"
            >
              Scan for Distortions
            </button>
          </div>
        )}

        {/* Analysis Output Box */}
        <div className="flex-1 overflow-y-auto rounded-xl bg-[#242D29] border border-[#384A41] p-4 text-xs leading-relaxed light:bg-[#EFECE6] light:border-[#E5E3DA]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-[#859A90]">
              <Sparkles className="w-6 h-6 animate-spin text-[#E5A93C]" />
              <p>Analyzing behavioral patterns on-device...</p>
            </div>
          ) : response ? (
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-[#E5A93C] light:text-[#D97706]">
                {response.title}
              </h4>
              <div className="whitespace-pre-line text-[#F4F7F4] light:text-[#1C221E]">
                {response.analysisText}
              </div>

              {/* Embedded Tool Actions */}
              {response.interactiveTools.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-[#384A41]/50 mt-2">
                  {response.interactiveTools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool)}
                      disabled={journalSaved && tool.type === 'SAVE_REFLECTION'}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        journalSaved && tool.type === 'SAVE_REFLECTION'
                          ? 'bg-[#2A5643] text-[#E8F3ED] cursor-default'
                          : 'bg-[#2D6A4F] text-white hover:bg-[#22533E]'
                      }`}
                    >
                      <span>{tool.emoji}</span>
                      <span>
                        {journalSaved && tool.type === 'SAVE_REFLECTION'
                          ? 'Deposited to Journal ✓'
                          : tool.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-[#859A90]">
              Select a tab above to initiate coaching analysis.
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-[#F4F7F4] font-bold text-xs hover:border-[#3D7D62] transition-colors light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
        >
          Close Coach
        </button>
      </div>
    </div>
  );
};
