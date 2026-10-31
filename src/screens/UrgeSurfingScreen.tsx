import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, Waves, ShieldCheck, HeartPulse } from 'lucide-react';
import { soundManager } from '../utils/soundHaptics';

export const UrgeSurfingScreen: React.FC = () => {
  const { state, logUrgeWave, showToast } = useApp();

  const [secondsRemaining, setSecondsRemaining] = useState<number>(600); // 10 minutes default
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<boolean>(false);

  // Protocol parameters
  const [preIntensity, setPreIntensity] = useState<number>(7);
  const [postIntensity, setPostIntensity] = useState<number>(3);
  const [trigger, setTrigger] = useState<string>('Late Evening Screen Trigger');
  const [want, setWant] = useState<string>('Compulsive social media scrolling / snack');
  const [choice, setChoice] = useState<string>('Box Breathing & herbal tea');
  const [note, setNote] = useState<string>('Noticed facial warmth crest at minute 4, then dissolve after breath pacing.');
  const [selectedSensations, setSelectedSensations] = useState<string[]>([
    'Facial Heat / Flush',
    'Restless Limbs'
  ]);
  const [selectedContextTags, setSelectedContextTags] = useState<string[]>([
    'Late Evening',
    'Boredom / Aimless'
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const somaticOptions = [
    'Facial Heat / Flush',
    'Restless Limbs',
    'Clenched Jaw',
    'Chest Tightness',
    'Shallow Breath',
    'Stomach Knot',
    'Racing Thoughts'
  ];

  const contextOptions = [
    'Late Evening',
    'Boredom / Aimless',
    'Screen Trigger',
    'Fatigue / Exhaustion',
    'Work Stress',
    'Social Friction'
  ];

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          soundManager.playChime('levelUp');
          showToast('🎉 Wave timer complete! Record your post-intensity.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  // Sine Wave Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      step += 0.04;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Gradient wave stroke
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#3D7D62');
      gradient.addColorStop(0.5, '#E5A93C');
      gradient.addColorStop(1, '#3D7D62');

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;

      for (let x = 0; x < width; x++) {
        const progress = (600 - secondsRemaining) / 600;
        const amplitude = 25 * (1 + Math.sin(progress * Math.PI));
        const y = height / 2 + Math.sin(x * 0.03 + step) * amplitude * Math.cos(step * 0.5);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [secondsRemaining]);

  const toggleSensation = (s: string) => {
    setSelectedSensations(prev =>
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const toggleContextTag = (t: string) => {
    setSelectedContextTags(prev =>
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const handleToggleAmbient = () => {
    const next = !ambientSound;
    setAmbientSound(next);
    soundManager.toggleAmbient(next);
  };

  const handleCompleteWave = (status: 'SURFED' | 'RESISTED') => {
    logUrgeWave({
      trigger,
      preIntensity,
      postIntensity,
      want,
      choice,
      note,
      somaticSensations: selectedSensations,
      contextTags: selectedContextTags,
      outcomeStatus: status,
      durationSeconds: 600 - secondsRemaining || 600
    });
    soundManager.playChime('levelUp');
    setSecondsRemaining(600);
    setIsRunning(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-[#F4F7F4] light:text-[#1C221E] flex items-center gap-2">
            <span>🌊</span> Clinical Urge Surfing Protocol
          </h2>
          <p className="text-xs text-[#859A90] light:text-[#5C655E]">
            Urges crest like waves and dissolve in under 10 minutes when observed without judgment
          </p>
        </div>

        <button
          onClick={handleToggleAmbient}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
            ambientSound
              ? 'bg-[#2A5643] border-[#3D7D62] text-[#E8F3ED]'
              : 'bg-[#1B211E] border-[#384A41] text-[#859A90] light:bg-white light:border-[#E5E3DA]'
          }`}
        >
          <Waves className="w-3.5 h-3.5" />
          <span>{ambientSound ? 'Ambient On' : 'Brown Noise'}</span>
        </button>
      </div>

      {/* Wave Timer & Harmonic Canvas Card */}
      <div className="rounded-2xl bg-[#1B211E] border border-[#384A41] p-6 shadow-md flex flex-col items-center gap-5 light:bg-white light:border-[#E5E3DA]">
        <canvas
          ref={canvasRef}
          width={400}
          height={100}
          className="w-full max-w-sm h-24 rounded-xl bg-[#242D29] border border-[#384A41]/50 light:bg-[#EFECE6] light:border-[#E5E3DA]"
        />

        <div className="text-5xl font-black font-mono tracking-widest text-[#E5A93C] light:text-[#D97706]">
          {formatTimer(secondsRemaining)}
        </div>

        <p className="text-xs text-[#859A90] light:text-[#5C655E] text-center max-w-xs">
          Box Breathing Guide: Inhale (4s) • Hold (4s) • Exhale (4s) • Hold (4s)
        </p>

        {/* Timer Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="py-3 px-6 rounded-xl bg-[#2D6A4F] text-white font-bold text-sm flex items-center gap-2 hover:bg-[#22533E] transition-all shadow-md active:scale-95"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause Wave' : 'Ride The Wave'}</span>
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setSecondsRemaining(600);
            }}
            className="p-3 rounded-xl bg-[#242D29] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA]"
            title="Reset to 10:00"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Intensity Sliders */}
      <div className="rounded-2xl bg-[#1B211E] border border-[#384A41] p-4 flex flex-col gap-4 shadow-md light:bg-white light:border-[#E5E3DA]">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-[#F4F7F4] light:text-[#1C221E] mb-1">
              <span>Pre-Wave Craving</span>
              <span className="text-[#D95D39] font-mono text-sm">{preIntensity} / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={preIntensity}
              onChange={e => setPreIntensity(Number(e.target.value))}
              className="w-full accent-[#D95D39]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold text-[#F4F7F4] light:text-[#1C221E] mb-1">
              <span>Post-Wave Intensity</span>
              <span className="text-[#3D7D62] font-mono text-sm">{postIntensity} / 10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={postIntensity}
              onChange={e => setPostIntensity(Number(e.target.value))}
              className="w-full accent-[#3D7D62]"
            />
          </div>
        </div>

        {/* Somatic Sensation Chips */}
        <div>
          <label className="text-[11px] font-bold text-[#859A90] uppercase block mb-1.5">
            Interoceptive Somatic Sensations (Where do you feel it?)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {somaticOptions.map(s => {
              const active = selectedSensations.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSensation(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    active
                      ? 'bg-[#2A5643] border-[#3D7D62] text-[#E8F3ED]'
                      : 'bg-[#242D29] border-[#384A41] text-[#859A90] light:bg-[#EFECE6] light:border-[#E5E3DA]'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Context / Trigger Tags */}
        <div>
          <label className="text-[11px] font-bold text-[#859A90] uppercase block mb-1.5">
            DBT Context / Emotional Triggers
          </label>
          <div className="flex flex-wrap gap-1.5">
            {contextOptions.map(t => {
              const active = selectedContextTags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleContextTag(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    active
                      ? 'bg-[#2E2308] border-[#E5A93C] text-[#E5A93C] light:bg-[#FEF3C7] light:text-[#D97706]'
                      : 'bg-[#242D29] border-[#384A41] text-[#859A90] light:bg-[#EFECE6] light:border-[#E5E3DA]'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reflection Inputs */}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Compulsive craving want (e.g. snack, doomscrolling)..."
            value={want}
            onChange={e => setWant(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
          />
          <input
            type="text"
            placeholder="Mindful replacement choice taken (e.g. Box Breathing, cold water wash)..."
            value={choice}
            onChange={e => setChoice(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[#242D29] border border-[#384A41] text-xs text-[#F4F7F4] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
          />
        </div>

        {/* Complete Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => handleCompleteWave('SURFED')}
            className="flex-1 py-3 rounded-xl bg-[#2D6A4F] text-white font-bold text-xs hover:bg-[#22533E] transition-colors shadow-md"
          >
            Wave Surfed Clean (+35 XP, +15 🪙)
          </button>
          <button
            onClick={() => handleCompleteWave('RESISTED')}
            className="py-3 px-4 rounded-xl bg-[#242D29] border border-[#384A41] text-[#F4F7F4] font-bold text-xs hover:border-[#3D7D62] light:bg-[#EFECE6] light:border-[#E5E3DA] light:text-[#1C221E]"
          >
            Resisted (+25 XP)
          </button>
        </div>
      </div>

      {/* Urge History Logs */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#859A90] px-1">
          Urge Surfing History
        </h3>

        {state.urges.map(urge => {
          const delta = urge.preIntensity - (urge.postIntensity ?? urge.preIntensity);

          return (
            <div
              key={urge.id}
              className="p-3 rounded-xl bg-[#1B211E] border border-[#384A41] flex flex-col gap-2 light:bg-white light:border-[#E5E3DA]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#F4F7F4] light:text-[#1C221E]">
                    {urge.trigger || 'Craving Wave'}
                  </h4>
                  <p className="text-[10px] text-[#859A90]">
                    {urge.d} at {urge.tm} • Choice: {urge.choice}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#2A5643] text-[#E8F3ED] border border-[#3D7D62]">
                    ↓ {delta > 0 ? `-${delta}` : '0'} Drop
                  </span>
                  <span className="text-[10px] font-extrabold text-[#E5A93C]">
                    +{urge.coinsEarned}🪙
                  </span>
                </div>
              </div>

              {urge.somaticSensations.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {urge.somaticSensations.map(s => (
                    <span key={s} className="text-[9px] px-1.5 py-0.2 rounded bg-[#242D29] text-[#859A90] light:bg-[#EFECE6]">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
