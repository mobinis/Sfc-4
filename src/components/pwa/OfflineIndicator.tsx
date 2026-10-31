import React from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-xl bg-[#252D22] border border-[#E5A93C] px-3 py-1.5 text-xs font-semibold text-[#F4F7F2] shadow-xl animate-pulse">
      <WifiOff className="w-3.5 h-3.5 text-[#E5A93C]" />
      <span>Offline Mode — Dual-layer hardware storage active</span>
      <Database className="w-3.5 h-3.5 text-[#87A96B]" />
    </div>
  );
};
