// Audio & Ambient Soundscape Synthesizer via Web Audio API + Capacitor Haptics
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

class SoundHapticsManager {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private isAmbientPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft tactile haptic feedback via Capacitor native bridge with fallback
  async vibrate(pattern: number | number[] = 25) {
    try {
      if (typeof pattern === 'number' && pattern <= 30) {
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      } else if (typeof pattern === 'number' && pattern <= 60) {
        await Haptics.impact({ style: ImpactStyle.Medium });
        return;
      } else if (Array.isArray(pattern) && pattern.length >= 3) {
        await Haptics.notification({ type: NotificationType.Success });
        return;
      }
    } catch {
      // Not on native device, use browser navigator.vibrate
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore
      }
    }
  }

  // Pleasant bell chime for completion (e.g. routine step or wave complete)
  playChime(type: 'success' | 'step' | 'levelUp' | 'click' | 'timer' | 'reminder' | 'curfew' = 'success') {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (type === 'reminder') {
        // Warm Tibetan bell double harmonic chime
        const notes = [587.33, 880];
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.18, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.85);
        });
        this.vibrate([30, 40, 30]);
        return;
      }

      if (type === 'curfew') {
        // Deep soothing wind-down tone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.exponentialRampToValueAtTime(196.00, now + 1.2); // G3
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.55);
        this.vibrate([50, 100, 50]);
        return;
      }

      if (type === 'timer') {
        // High crisp double beep for rest timer completion
        [0, 0.15, 0.3].forEach((offset, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(idx === 2 ? 880 : 700, now + offset);
          gain.gain.setValueAtTime(0.2, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.11);
        });
        this.vibrate([40, 60, 40]);
        return;
      }

      if (type === 'click') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
        this.vibrate(15);
        return;
      }

      if (type === 'step') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now); // E4
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.25); // E5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        this.vibrate(30);
        return;
      }

      if (type === 'levelUp') {
        // Pentatonic joyful arpeggio
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.2, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.45);
        });
        this.vibrate([40, 60, 40, 60, 80]);
        return;
      }

      // Default: Pure high meditative singing bowl ping
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(528, now); // Solfeggio frequency (Miracle/Transformation)
      osc2.frequency.setValueAtTime(532, now); // Gentle binaural beating
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.3);
      osc2.stop(now + 1.3);
      this.vibrate([30, 50, 40]);
    } catch {
      // Audio autoplay policy or not supported
    }
  }

  // Ambient sound generator (Brown Noise / Gentle Waves for deep focus or urge surfing)
  toggleAmbient(enable: boolean) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (!enable) {
        if (this.ambientSource) {
          (this.ambientSource as AudioNode & { stop?: () => void }).stop?.();
          this.ambientSource.disconnect();
          this.ambientSource = null;
        }
        this.isAmbientPlaying = false;
        return;
      }

      if (this.isAmbientPlaying) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
      this.ambientSource = whiteNoise;
      this.isAmbientPlaying = true;
    } catch {
      // ignore
    }
  }
}

export const soundManager = new SoundHapticsManager();
