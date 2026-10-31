import React, { useState, useEffect } from 'react';
import { X, Play, Pause, SkipForward, CheckCircle2 } from 'lucide-react';
import { RoutineFlow } from '../../types';
import { soundManager } from '../../utils/soundHaptics';

interface RoutinePlayerModalProps {
  routine: RoutineFlow;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (routineId: string, habitIdsToMark: string[]) => void;
}

export const RoutinePlayerModal: React.FC<RoutinePlayerModalProps> = ({
  routine,
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    routine?.steps?.[0]?.durationSeconds || 120
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentStep = routine?.steps?.[currentStepIdx];
  const isLastStep = routine?.steps ? currentStepIdx === routine.steps.length - 1 : false;

  useEffect(() => {
    if (!currentStep) return;
    setSecondsRemaining(currentStep.durationSeconds);
  }, [currentStepIdx, currentStep]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          soundManager.playChime('step');
          handleNextStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentStepIdx]);

  const handleNextStep = () => {
    setCompletedSteps(prev => new Set(prev).add(currentStepIdx));

    if (isLastStep) {
      const habitIds = routine.steps.map(s => s.linkedHabitId).filter(Boolean) as string[];
      onComplete(routine.id, habitIds);
      soundManager.playChime('levelUp');
      onClose();
    } else {
      setCurrentStepIdx(idx => idx + 1);
      soundManager.playChime('step');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen || !routine) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#1B211E] border border-[#384A41] p-6 shadow-2xl flex flex-col gap-5 light:bg-white light:border-[#E5E3DA]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{routine.icon}</span>
            <div>
              <h3 className="text-base font-bold text-[#F4F7F4] light:text-[#1C221E]">
                {routine.name}
              </h3>
              <p className="text-xs text-[#859A90] light:text-[#5C655E]">
                Step {currentStepIdx + 1} of {routine.steps.length}
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

        {/* Step Progress indicators */}
        <div className="flex gap-1.5">
          {routine.steps.map((s, idx) => (
            <div
              key={s.id}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                completedSteps.has(idx)
                  ? 'bg-[#3D7D62]'
                  : idx === currentStepIdx
                  ? 'bg-[#E5A93C]'
                  : 'bg-[#242D29] light:bg-[#E5E3DA]'
              }`}
            />
          ))}
        </div>

        {/* Current Active Step Card */}
        <div className="rounded-2xl bg-[#242D29] border border-[#384A41] p-6 flex flex-col items-center justify-center text-center gap-4 light:bg-[#EFECE6] light:border-[#E5E3DA]">
          <div className="w-14 h-14 rounded-2xl bg-[#2A5643] border border-[#3D7D62] text-[#E8F3ED] flex items-center justify-center text-3xl shadow-sm light:bg-[#E8F3ED] light:text-[#1C3026]">
            {currentStep?.icon || '⏱️'}
          </div>

          <div>
            <h4 className="text-lg font-bold text-[#F4F7F4] light:text-[#1C221E]">
              {currentStep?.name}
            </h4>
            <p className="text-xs text-[#859A90] light:text-[#5C655E] mt-1 max-w-sm">
              {currentStep?.guidanceNote}
            </p>
          </div>

          <div className="text-4xl font-black font-mono tracking-wider text-[#E5A93C] light:text-[#D97706]">
            {formatTime(secondsRemaining)}
          </div>
        </div>

        {/* Step list summary */}
        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
          {routine.steps.map((step, idx) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs border ${
                idx === currentStepIdx
                  ? 'bg-[#2A5643]/30 border-[#3D7D62] text-[#F4F7F4] light:bg-[#E8F3ED] light:text-[#1C3026]'
                  : completedSteps.has(idx)
                  ? 'bg-[#1B211E]/40 border-transparent text-[#859A90] line-through'
                  : 'bg-[#242D29]/50 border-transparent text-[#859A90]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{step.icon}</span>
                <span className="font-semibold">{step.name}</span>
              </div>
              <span className="font-mono text-[11px] text-[#859A90]">
                {Math.floor(step.durationSeconds / 60)}m
              </span>
            </div>
          ))}
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
            onClick={handleNextStep}
            className="py-3 px-5 rounded-xl bg-[#2D6A4F] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#22533E] shadow-md"
          >
            {isLastStep ? <CheckCircle2 className="w-4 h-4" /> : <SkipForward className="w-4 h-4" />}
            <span>{isLastStep ? 'Complete (+30 XP)' : 'Next Step'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
