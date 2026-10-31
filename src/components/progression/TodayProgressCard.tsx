import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Target, Plus, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';
import { LogProgressModal } from './LogProgressModal';
import { MeasurableTarget } from '../../types';

export const TodayProgressCard: React.FC = () => {
  const { state, setActiveTab } = useApp();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<MeasurableTarget | null>(null);

  const activeTargets = state.measurableTargets.filter(t => t.status === 'active');
  const topTargets = activeTargets.slice(0, 3);

  if (topTargets.length === 0) return null;

  const handleQuickLog = (target: MeasurableTarget) => {
    soundManager.playChime('click');
    setSelectedTarget(target);
    setIsLogModalOpen(true);
  };

  const handleGoToLab = () => {
    soundManager.playChime('click');
    setActiveTab('growth');
  };

  return (
    <div className="flex flex-col gap-2.5 p-3.5 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#3D7D62]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#BAC8C0] light:text-[#4A5568]">
            Progression Lab Targets
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playChime('click');
              setActiveTab('insights');
            }}
            className="text-[11px] font-bold text-[#E5A93C] hover:text-[#FBBF24] flex items-center gap-0.5 transition-all"
          >
            <span>Analytics</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={handleGoToLab}
            className="text-[11px] font-bold text-[#3D7D62] hover:text-[#68D391] flex items-center gap-0.5 transition-all"
          >
            <span>Open Lab</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {topTargets.map(t => {
          const percent = t.targetValue > 0 ? Math.min(100, Math.round((t.currentProgress / t.targetValue) * 100)) : 0;
          const isOverCeiling = t.isReductionTarget && t.currentProgress > t.targetValue;
          const isSafeReduction = t.isReductionTarget && t.currentProgress <= t.targetValue;

          // Mini SVG Ring
          const size = 38;
          const strokeWidth = 3.5;
          const radius = (size - strokeWidth) / 2;
          const circumference = radius * 2 * Math.PI;
          const offset = circumference - (Math.min(100, percent) / 100) * circumference;

          const ringColor = t.isReductionTarget
            ? isOverCeiling
              ? '#EF4444'
              : '#38BDF8'
            : percent >= 100
            ? '#68D391'
            : '#3D7D62';

          return (
            <div
              key={t.id}
              className="p-2.5 rounded-2xl bg-[#242D29] border border-[#384A41]/60 flex items-center justify-between gap-2 transition-all light:bg-[#F7F6F2] light:border-[#E5E3DA]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth={strokeWidth}
                      className="text-[#1B211E] light:text-[#E5E3DA]"
                    />
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="transparent"
                      stroke={ringColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs">{t.icon}</span>
                </div>

                <div className="flex flex-col min-w-0">
                  <h4 className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E] truncate">
                    {t.title}
                  </h4>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-[#859A90] light:text-[#5C655E]">
                    <span className="font-bold text-[#F4F7F4] light:text-[#1C221E]">
                      {t.currentProgress}
                    </span>
                    <span>/</span>
                    <span>{t.targetValue} {t.unit}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleQuickLog(t)}
                className="w-7 h-7 rounded-lg bg-[#384A41] hover:bg-[#3D7D62] text-white flex items-center justify-center shrink-0 active:scale-90 transition-all shadow-xs"
                title="Log progress"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <LogProgressModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setSelectedTarget(null);
        }}
        target={selectedTarget}
      />
    </div>
  );
};
