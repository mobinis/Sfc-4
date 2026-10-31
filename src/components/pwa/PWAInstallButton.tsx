import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone PWA mode, suppress install button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-[#87A96B] text-[#1E241B] font-bold shadow-md hover:bg-[#78995C] active:scale-95 transition-all ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs'
        }`}
        title="Install Offline PWA App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-[#33402E] bg-[#252D22] text-[#87A96B] font-bold hover:border-[#87A96B] active:scale-95 transition-all ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
          title="Install on iOS Safari"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-[#1E241B] border border-[#33402E] p-5 shadow-2xl text-left">
              <div className="flex items-center justify-between pb-3 border-b border-[#33402E]">
                <h3 className="text-sm font-black text-[#F4F7F2] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#87A96B]" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-[#859A90] hover:text-[#F4F7F2]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 text-xs text-[#C5D1C9] space-y-2">
                <p>To run SelfCare Hero as an offline, full-screen mobile app:</p>
                <ol className="list-decimal pl-4 space-y-1.5 text-[#F4F7F2]">
                  <li>Tap the <strong>Share</strong> icon (square with arrow) in Safari.</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                  <li>Tap <strong>Add</strong> in the top-right corner.</li>
                </ol>
                <p className="text-[11px] text-[#859A90] pt-1">
                  All habit data and offline storage will remain cached on your device.
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-[#87A96B] py-2 text-xs font-bold text-[#1E241B] hover:bg-[#78995C]"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
