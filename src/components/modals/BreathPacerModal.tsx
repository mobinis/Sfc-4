import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';

interface BreathPacerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (xp: number) => void;
}

type Technique = 'box' | '478' | 'resonance';

export const BreathPacerModal: React.FC<BreathPacerModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [technique, setTechnique] = useState<Technique>('box');
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [phaseSeconds, setPhaseSeconds] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  // Technique timing maps
  const getPhaseTiming = (t: Technique) => {
    switch (t) {
      case 'box':
        return { Inhale: 4, Hold: 4, Exhale: 4, Pause: 4 };
      case '478':
        return { Inhale: 4, Hold: 7, Exhale: 8, Pause: 0 };
      case 'resonance':
        return { Inhale: 5, Hold: 0, Exhale: 5, Pause: 0 };
    }
  };

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const timings = getPhaseTiming(technique);

    const interval = setInterval(() => {
      setPhaseSeconds(prev => {
        if (prev > 1) {
          return prev - 1;
        }

        // Advance phase
        if (phase === 'Inhale') {
          if (timings.Hold > 0) {
            setPhase('Hold');
            soundManager.playChime('click');
            return timings.Hold;
          } else {
            setPhase('Exhale');
            soundManager.playChime('click');
            return timings.Exhale;
          }
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          soundManager.playChime('click');
          return timings.Exhale;
        } else if (phase === 'Exhale') {
          if (timings.Pause > 0) {
            setPhase('Pause');
            soundManager.playChime('click');
            return timings.Pause;
          } else {
            setPhase('Inhale');
            soundManager.playChime('step');
            setCyclesCompleted(c => c + 1);
            return timings.Inhale;
          }
        } else {
          // Pause finished
          setPhase('Inhale');
          soundManager.playChime('step');
          setCyclesCompleted(c => c + 1);
          return timings.Inhale;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, phase, technique]);

  if (!isOpen) return null;

  const handleFinish = () => {
    onComplete?.(20);
    soundManager.playChime('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#1B211E] border border-[#384A41] p-6 shadow-2xl flex flex-col gap-5 light:bg-white light:border-[#E5E3DA]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
              <span>🫁</span> Somatic Breath Pacer
            </h3>
            <p className="text-xs text-[#859A90] light:text-[#5C655E]">
              Balances autonomic tone, vagus nerve stimulation & calm focus
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#859A90] hover:text-[#F4F7F4] hover:bg-[#242D29] light:hover:bg-[#EFECE6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technique Selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => { setTechnique('box'); setPhase('Inhale'); setPhaseSeconds(4); }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors ${
              technique === 'box'
                ? 'bg-[#2A5643] border-[#3D7D62] text-[#E8F3ED] light:bg-[#E8F3ED] light:text-[#1C3026]'
                : 'bg-[#242D29] border-[#384A41] text-[#859A90] light:bg-[#EFECE6] light:border-[#E5E3DA]'
            }`}
          >
            Box (4-4-4-4)
          </button>
          <button
            onClick={() => { setTechnique('478'); setPhase('Inhale'); setPhaseSeconds(4); }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors ${
              technique === '478'
                ? 'bg-[#2A5643] border-[#3D7D62] text-[#E8F3ED] light:bg-[#E8F3ED] light:text-[#1C3026]'
                : 'bg-[#242D29] border-[#384A41] text-[#859A90] light:bg-[#EFECE6] light:border-[#E5E3DA]'
            }`}
          >
            Rest (4-7-8)
          </button>
          <button
            onClick={() => { setTechnique('resonance'); setPhase('Inhale'); setPhaseSeconds(5); }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors ${
              technique === 'resonance'
                ? 'bg-[#2A5643] border-[#3D7D62] text-[#E8F3ED] light:bg-[#E8F3ED] light:text-[#1C3026]'
                : 'bg-[#242D29] border-[#384A41] text-[#859A90] light:bg-[#EFECE6] light:border-[#E5E3DA]'
            }`}
          >
            Resonance (5-5)
          </button>
        </div>

        {/* Animated Breath Visualizer */}
        <div className="h-56 rounded-2xl bg-[#242D29] border border-[#384A41] flex flex-col items-center justify-center relative overflow-hidden light:bg-[#EFECE6] light:border-[#E5E3DA]">
          {/* Pulsing ring based on phase */}
          <div
            className={`w-36 h-36 rounded-full border-4 border-[#3D7D62] bg-[#3D7D62]/10 flex flex-col items-center justify-center transition-all duration-1000 ${
              phase === 'Inhale'
                ? 'scale-125 border-[#3D7D62] bg-[#3D7D62]/20 shadow-lg shadow-[#3D7D62]/30'
                : phase === 'Hold' || phase === 'Pause'
                ? 'scale-120 border-[#E5A93C] bg-[#E5A93C]/10'
                : 'scale-90 border-[#384A41] bg-[#384A41]/10'
            }`}
          >
            <span className="text-sm font-extrabold uppercase tracking-widest text-[#E8F3ED] light:text-[#1C3026]">
              {phase}
            </span>
            <span className="text-3xl font-black font-mono text-[#E5A93C] light:text-[#D97706]">
              {phaseSeconds}
            </span>
          </div>

          <div className="absolute bottom-3 text-xs font-medium text-[#859A90] light:text-[#5C655E]">
            Cycles Completed: <span className="text-[#F4F7F4] font-bold light:text-[#1C221E]">{cyclesCompleted}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1 py-3 px-4 rounded-xl bg-[#242D29] border border-[#384A41] text-[#F4F7F4] font-bold text-sm flex items-center justify-center gap-2 hover:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-[#E5A93C]" /> : <Play className="w-4 h-4 text-[#3D7D62]" />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>
          <button
            onClick={() => {
              setCyclesCompleted(0);
              setPhase('Inhale');
              setPhaseSeconds(getPhaseTiming(technique).Inhale);
            }}
            className="p-3 rounded-xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA]"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleFinish}
          className="w-full py-3 rounded-xl bg-[#2D6A4F] text-white font-bold text-sm hover:bg-[#22533E] transition-colors shadow-md light:bg-[#2D6A4F]"
        >
          Complete Session (+20 XP, +2 🪙)
        </button>
      </div>
    </div>
  );
};
