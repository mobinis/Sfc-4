import React, { useState } from 'react';
import { X, Lock, Delete } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundManager } from '../../utils/soundHaptics';

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Confidential Privacy Lock',
  description = 'Enter your 4-digit PIN to access protected data'
}) => {
  const { unlockWithPin } = useApp();
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDigit = async (d: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + d;
    setPin(nextPin);
    soundManager.playChime('click');

    if (nextPin.length === 4) {
      const ok = await unlockWithPin(nextPin);
      if (ok) {
        setPin('');
        setIsError(false);
        onSuccess();
        onClose();
      } else {
        setIsError(true);
        soundManager.vibrate([40, 60, 40]);
        setTimeout(() => {
          setPin('');
          setIsError(false);
        }, 800);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    soundManager.playChime('click');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#1B211E] border border-[#384A41] p-6 shadow-2xl flex flex-col items-center gap-6 light:bg-white light:border-[#E5E3DA]">
        <div className="w-full flex justify-between items-center">
          <div className="w-6" />
          <div className="w-12 h-12 rounded-2xl bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] flex items-center justify-center text-xl shadow-md light:bg-[#FEF3C7] light:text-[#D97706]">
            <Lock className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#859A90] hover:text-[#F4F7F4] hover:bg-[#242D29] light:hover:bg-[#EFECE6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <h3 className="text-base font-bold text-[#F4F7F4] light:text-[#1C221E]">
            {title}
          </h3>
          <p className="text-xs text-[#859A90] light:text-[#5C655E] mt-1">
            {description}
          </p>
        </div>

        {/* 4 Dot Indicators */}
        <div className={`flex gap-4 ${isError ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? isError
                    ? 'bg-[#B91C1C] border-[#B91C1C]'
                    : 'bg-[#E5A93C] border-[#E5A93C] scale-110 shadow-sm'
                  : 'bg-transparent border-[#384A41] light:border-[#C8C5B8]'
              }`}
            />
          ))}
        </div>

        {isError && (
          <p className="text-xs font-bold text-[#B91C1C]">
            Incorrect PIN. Please try again.
          </p>
        )}

        {/* 3x4 Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-14 rounded-2xl bg-[#242D29] border border-[#384A41] text-lg font-bold text-[#F4F7F4] hover:border-[#3D7D62] active:scale-95 transition-all flex items-center justify-center light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-[#242D29] border border-[#384A41] text-lg font-bold text-[#F4F7F4] hover:border-[#3D7D62] active:scale-95 transition-all flex items-center justify-center light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] active:scale-95 transition-all flex items-center justify-center light:bg-[#EFECE6] light:border-[#E5E3DA]"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
