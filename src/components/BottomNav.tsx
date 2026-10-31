import React from 'react';
import { useApp } from '../context/AppContext';
import { CalendarCheck, Sprout, Heart, BarChart3, Plus } from 'lucide-react';
import { soundManager } from '../utils/soundHaptics';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsActionSheetOpen } = useApp();

  const handleTabClick = (tab: 'today' | 'growth' | 'reflect' | 'insights') => {
    soundManager.playChime('click');
    setActiveTab(tab);
  };

  const isTodayActive = activeTab === 'today';
  const isGrowthActive = activeTab === 'growth' || activeTab === 'skills' || activeTab === 'learn' || activeTab === 'books' || activeTab === 'videos';
  const isReflectActive = activeTab === 'reflect' || activeTab === 'journal' || activeTab === 'urge';
  const isInsightsActive = activeTab === 'insights' || activeTab === 'stats';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1B211E]/95 backdrop-blur-md border-t border-[#384A41] shadow-2xl light:bg-white/95 light:border-[#E5E3DA]">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-2 relative">
        {/* Today Tab */}
        <button
          onClick={() => handleTabClick('today')}
          className={`flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-xl transition-all ${
            isTodayActive
              ? 'text-[#3D7D62] font-black light:text-[#2D6A4F]'
              : 'text-[#859A90] hover:text-[#F4F7F4] font-medium light:text-[#5C655E]'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isTodayActive ? 'bg-[#2A5643]/30 light:bg-[#E8F3ED]' : ''}`}>
            <CalendarCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">Today</span>
        </button>

        {/* Growth Tab */}
        <button
          onClick={() => handleTabClick('growth')}
          className={`flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-xl transition-all ${
            isGrowthActive
              ? 'text-[#3D7D62] font-black light:text-[#2D6A4F]'
              : 'text-[#859A90] hover:text-[#F4F7F4] font-medium light:text-[#5C655E]'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isGrowthActive ? 'bg-[#2A5643]/30 light:bg-[#E8F3ED]' : ''}`}>
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">Growth</span>
        </button>

        {/* Center Floating Action Button (+) */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            onClick={() => {
              soundManager.playChime('click');
              setIsActionSheetOpen(true);
            }}
            aria-label="Quick Actions"
            className="w-13 h-13 rounded-full bg-[#E5A93C] text-[#121413] flex items-center justify-center shadow-lg shadow-[#E5A93C]/30 hover:scale-105 active:scale-95 transition-all border-2 border-[#1B211E] light:border-white"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Reflect Tab */}
        <button
          onClick={() => handleTabClick('reflect')}
          className={`flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-xl transition-all ${
            isReflectActive
              ? 'text-[#3D7D62] font-black light:text-[#2D6A4F]'
              : 'text-[#859A90] hover:text-[#F4F7F4] font-medium light:text-[#5C655E]'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isReflectActive ? 'bg-[#2A5643]/30 light:bg-[#E8F3ED]' : ''}`}>
            <Heart className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">Reflect</span>
        </button>

        {/* Insights Tab */}
        <button
          onClick={() => handleTabClick('insights')}
          className={`flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-xl transition-all ${
            isInsightsActive
              ? 'text-[#3D7D62] font-black light:text-[#2D6A4F]'
              : 'text-[#859A90] hover:text-[#F4F7F4] font-medium light:text-[#5C655E]'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isInsightsActive ? 'bg-[#2A5643]/30 light:bg-[#E8F3ED]' : ''}`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">Insights</span>
        </button>
      </div>
    </nav>
  );
};
