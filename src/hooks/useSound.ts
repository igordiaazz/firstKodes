'use client';

import { useCallback, useRef } from 'react';

type SoundName =
  | 'spark'
  | 'fireAmbient'
  | 'whoosh'
  | 'snapback'
  | 'streakSuccess'
  | 'streakFail'
  | 'streakLost'
  | 'levelComplete'
  | 'moduleComplete'
  | 'click'
  | 'pageTransition';

interface PlayOptions {
  volume?: number;
  rate?: number;
}

type LooperHandle = {
  start: () => void;
  set: (params: { frequency?: number; volume?: number }) => void;
  stop: () => void;
};

function createContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch {
    return null;
  }
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeLoopsRef = useRef<Set<() => void>>(new Set());

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = createContext();
      if (ctxRef.current) {
        masterGainRef.current = ctxRef.current.createGain();
        masterGainRef.current.gain.value = 0.3;

        const limiter = ctxRef.current.createDynamicsCompressor();
        limiter.threshold.value = -6;
        limiter.knee.value = 6;
        limiter.ratio.value = 12;
        limiter.attack.value = 0.003;
        limiter.release.value = 0.25;

        masterGainRef.current.connect(limiter);
        limiter.connect(ctxRef.current.destination);
      }
    }
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback((name: SoundName, opts?: PlayOptions) => {
    const ctx = ensureCtx();
    if (!ctx) return;
    const gain = masterGainRef.current!;
    const v = opts?.volume ?? 1;
    const r = opts?.rate ?? 1;

    const now = ctx.currentTime;

    switch (name) {
      case 'spark': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.06);
        g.gain.setValueAtTime(0.15 * v, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(g).connect(gain);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
      case 'fireAmbient': {
        if (activeLoopsRef.current.size > 0) break;
        let playing = true;
        let stopped = false;
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const bg = ctx.createGain();
        const lpf = ctx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.value = 180;
        lfo.type = 'sine';
        lfo.frequency.value = 2;
        lfoGain.gain.value = 15;
        lpf.type = 'lowpass';
        lpf.frequency.value = 400;
        lpf.Q.value = 1;
        bg.gain.value = 0.012 * v;
        lfo.connect(lfoGain).connect(osc.frequency);
        osc.connect(lpf);
        lpf.connect(bg);
        bg.connect(gain);
        osc.start();
        lfo.start();
        const cleanup = () => {
          if (stopped) return;
          stopped = true;
          playing = false;
          try { osc.stop(); } catch {}
          try { lfo.stop(); } catch {}
          osc.disconnect();
          lfo.disconnect();
          bg.disconnect();
          lpf.disconnect();
          activeLoopsRef.current.delete(cleanup);
        };
        activeLoopsRef.current.add(cleanup);
        break;
      }
      case 'whoosh': {
        const bufSize = 256;
        const noise = ctx.createScriptProcessor(bufSize, 0, 1);
        let playing = true;
        const bg = ctx.createGain();
        bg.gain.setValueAtTime(0.08 * v, now);
        bg.gain.linearRampToValueAtTime(0.25 * v, now + 0.4);
        bg.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        noise.onaudioprocess = (e) => {
          if (!playing) return;
          const out = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bufSize; i++) {
            out[i] = Math.random() * 2 - 1;
          }
        };
        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(200, now);
        lpf.frequency.exponentialRampToValueAtTime(4000, now + 0.4);
        noise.connect(lpf).connect(bg).connect(gain);
        setTimeout(() => { noise.disconnect(); bg.disconnect(); }, 500);
        break;
      }
      case 'snapback': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        g.gain.setValueAtTime(0.06 * v, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g).connect(gain);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'streakSuccess': {
        // (1) soft whoosh — ignition sweep
        const wSize = 256;
        const wNoise = ctx.createScriptProcessor(wSize, 0, 1);
        let wPlaying = true;
        const wBg = ctx.createGain();
        wBg.gain.setValueAtTime(0.0001, now);
        wBg.gain.linearRampToValueAtTime(0.05 * v, now + 0.12);
        wBg.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        const wLpf = ctx.createBiquadFilter();
        wLpf.type = 'lowpass';
        wLpf.frequency.setValueAtTime(200, now);
        wLpf.frequency.exponentialRampToValueAtTime(3000, now + 0.35);
        wNoise.onaudioprocess = (e) => {
          if (!wPlaying) return;
          const out = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < wSize; i++) {
            out[i] = Math.random() * 2 - 1;
          }
        };
        wNoise.connect(wLpf).connect(wBg).connect(gain);
        setTimeout(() => { wPlaying = false; wNoise.disconnect(); wLpf.disconnect(); wBg.disconnect(); }, 420);

        // (2) pop — dry percussive impact
        const popOsc = ctx.createOscillator();
        const popG = ctx.createGain();
        popOsc.type = 'sine';
        popOsc.frequency.setValueAtTime(720, now);
        popOsc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
        popG.gain.setValueAtTime(0.0001, now);
        popG.gain.linearRampToValueAtTime(0.5 * v, now + 0.005);
        popG.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        popOsc.connect(popG).connect(gain);
        popOsc.start(now);
        popOsc.stop(now + 0.12);

        // (3) ding — bright bell confirmation
        const dingFreqs = [1568, 2349];
        dingFreqs.forEach((freq, i) => {
          const dStart = now + 0.08 + i * 0.015;
          const dOsc = ctx.createOscillator();
          const dG = ctx.createGain();
          dOsc.type = 'triangle';
          dOsc.frequency.value = freq * r;
          dG.gain.setValueAtTime(0.0001, dStart);
          dG.gain.linearRampToValueAtTime(0.2 * v, dStart + 0.01);
          dG.gain.exponentialRampToValueAtTime(0.001, dStart + 0.6);
          dOsc.connect(dG).connect(gain);
          dOsc.start(dStart);
          dOsc.stop(dStart + 0.65);
        });
        break;
      }
      case 'streakFail': {
        const notes = [392, 311, 262];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = freq * r;
          g.gain.setValueAtTime(0.12 * v, now + i * 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.2);
          osc.connect(g).connect(gain);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.2);
        });
        break;
      }
      case 'streakLost': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 2);
        g.gain.setValueAtTime(0.12 * v, now);
        g.gain.linearRampToValueAtTime(0.08 * v, now + 0.5);
        g.gain.linearRampToValueAtTime(0.02 * v, now + 1.5);
        g.gain.exponentialRampToValueAtTime(0.001, now + 2);
        osc.connect(g).connect(gain);
        osc.start(now);
        osc.stop(now + 2.2);
        break;
      }
      case 'levelComplete': {
        const notes = [659, 784];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq * r;
          g.gain.setValueAtTime(0.15 * v, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.15);
          osc.connect(g).connect(gain);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.15);
        });
        break;
      }
      case 'moduleComplete': {
        const notes = [262, 330, 392, 523];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq * r;
          g.gain.setValueAtTime(0.2 * v, now + i * 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.35);
          osc.connect(g).connect(gain);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.35);
        });
        break;
      }
      case 'click': {
        const bufSize = 128;
        const noise = ctx.createScriptProcessor(bufSize, 0, 1);
        let playing = true;
        const bg = ctx.createGain();
        bg.gain.setValueAtTime(0.06 * v, now);
        bg.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        noise.onaudioprocess = (e) => {
          if (!playing) return;
          const out = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bufSize; i++) {
            out[i] = Math.random() * 2 - 1;
          }
        };
        noise.connect(bg).connect(gain);
        setTimeout(() => { playing = false; noise.disconnect(); }, 30);
        break;
      }
      case 'pageTransition': {
        const bufSize = 128;
        const noise = ctx.createScriptProcessor(bufSize, 0, 1);
        let playing = true;
        const bg = ctx.createGain();
        bg.gain.setValueAtTime(0.04 * v, now);
        bg.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        noise.onaudioprocess = (e) => {
          if (!playing) return;
          const out = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bufSize; i++) {
            out[i] = Math.random() * 2 - 1;
          }
        };
        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(2000, now);
        lpf.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        noise.connect(lpf).connect(bg).connect(gain);
        setTimeout(() => { playing = false; noise.disconnect(); }, 180);
        break;
      }
    }
  }, [ensureCtx]);

  const createLooper = useCallback((_name: SoundName): LooperHandle => {
    const ctx = ensureCtx();
    const gain = masterGainRef.current!;
    if (!ctx || !gain) {
      return { start: () => {}, set: () => {}, stop: () => {} };
    }
    const now = ctx.currentTime;
    const bufSize = 256;
    const noise = ctx.createScriptProcessor(bufSize, 0, 1);
    let playing = false;
    let currentFreq = 1200;
    let currentVol = 0.04;
    const bg = ctx.createGain();
    bg.gain.value = 0;
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = currentFreq;
    bpf.Q.value = 0.5;
    noise.connect(bpf).connect(bg).connect(gain);
    noise.onaudioprocess = (e) => {
      if (!playing) return;
      const out = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        out[i] = Math.random() * 2 - 1;
      }
    };

    return {
      start() {
        playing = true;
        bg.gain.setValueAtTime(currentVol, ctx.currentTime);
      },
      set(params) {
        if (params.frequency != null) currentFreq = params.frequency;
        if (params.volume != null) currentVol = params.volume;
        bpf.frequency.value = currentFreq;
        if (playing) {
          bg.gain.value = currentVol;
        }
      },
      stop() {
        playing = false;
        bg.gain.setValueAtTime(0, ctx.currentTime);
      },
    };
  }, [ensureCtx]);

  const setMasterVolume = useCallback((vol: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = vol;
    }
  }, []);

  return { play, createLooper, setMasterVolume };
}
