'use client';

import { motion, AnimatePresence, useMotionValue, useTransform, animate, MotionValue } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSound } from '@/hooks/useSound';

interface StreakPendingProps {
  pendingStreak: number;
  onConfirm: () => void;
}

type Phase = 'idle' | 'dragging' | 'success';

const DRAG_DISTANCE = 300;
const IGNITION_THRESHOLD = 0.8;

type RGB = [number, number, number];

const GRAY_CORE: RGB = [212, 212, 216];
const GRAY_MID: RGB = [161, 161, 170];
const GRAY_EDGE: RGB = [113, 113, 122];
const GRAY_GLOW: RGB = [113, 113, 122];
const ORANGE_CORE: RGB = [251, 146, 60];
const ORANGE_MID: RGB = [249, 115, 22];
const ORANGE_EDGE: RGB = [234, 88, 12];
const ORANGE_GLOW: RGB = [249, 115, 22];

function mix(a: RGB, b: RGB, t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `${r}, ${g}, ${bl}`;
}

const FIRE_BLOBS = [
  { size: 100, left: '50%', bottom: 4, dur: 0.95 },
  { size: 68, left: '42%', bottom: 14, dur: 0.72 },
  { size: 56, left: '59%', bottom: 18, dur: 0.6 },
];

const FIRE_SPARKS = Array.from({ length: 11 }, (_, i) => {
  const left = 36 + ((i * 41) % 46);
  return {
    id: i,
    left: `${left}%`,
    size: 3 + (i % 3) * 2,
    duration: 0.85 + (i % 4) * 0.22,
    delay: (i * 0.17) % 1.1,
    x: (i % 2 === 0 ? 1 : -1) * (5 + (i % 3) * 4),
    rise: 80 + (i % 5) * 16,
  };
});

function FireFlame({ ignition, active, sparks = true }: { ignition: MotionValue<number>; active: boolean; sparks?: boolean }) {
  const core = useTransform(ignition, (v) => `rgb(${mix(GRAY_CORE, ORANGE_CORE, v)})`);
  const mid = useTransform(ignition, (v) => `rgb(${mix(GRAY_MID, ORANGE_MID, v)})`);
  const edge = useTransform(ignition, (v) => `rgba(${mix(GRAY_EDGE, ORANGE_EDGE, v)}, 0)`);
  const glow = useTransform(ignition, (v) => `rgba(${mix(GRAY_GLOW, ORANGE_GLOW, v)}, ${0.35 + 0.15 * v})`);
  const sparkColor = useTransform(ignition, (v) => `rgb(${mix(GRAY_MID, ORANGE_MID, v)})`);

  const blobBg = useTransform(
    [core, mid, edge],
    ([c, m, e]: string[]) =>
      `radial-gradient(circle at 50% 78%, ${c} 0%, ${m} 45%, ${e} 72%)`,
  );

  const blobOpacity = active
    ? [0.85, 1, 0.8, 0.95, 0.85]
    : [0.5, 0.62, 0.5, 0.58, 0.5];

  return (
    <div
      className="relative"
      style={{ width: 240, height: 240, transformOrigin: 'center bottom' }}
    >
      <motion.div
        className="absolute"
        style={{
          width: 210, height: 210, left: '50%', bottom: 0, marginLeft: -105,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          filter: 'blur(18px)',
        }}
        animate={{ opacity: [0.55, 0.78, 0.55], scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {FIRE_BLOBS.map((b, i) => (
        <motion.div
          key={`b${i}`}
          className="absolute"
          style={{
            width: b.size,
            height: b.size * 1.35,
            left: b.left,
            bottom: b.bottom,
            marginLeft: -(b.size / 2),
            borderRadius: '50% 50% 48% 48% / 62% 62% 38% 38%',
            background: blobBg,
            filter: 'blur(7px)',
            transformOrigin: 'center bottom',
          }}
          animate={{ scaleY: [1, 1.18, 0.92, 1.08, 1], scaleX: [1, 0.94, 1.06, 0.97, 1], x: [0, -4, 4, -2, 0], opacity: blobOpacity }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {sparks &&
        FIRE_SPARKS.map((s) => (
          <motion.span
            key={`s${s.id}`}
            className="absolute rounded-full"
            style={{
              width: s.size, height: s.size,
              left: s.left, bottom: 34, marginLeft: -(s.size / 2),
              background: sparkColor,
              boxShadow: `0 0 6px rgba(249,115,22,0.7)`,
            }}
            initial={{ y: 0, opacity: 0, scale: 1 }}
            animate={{ y: -s.rise, x: s.x, opacity: [0, 1, 0], scale: [1, 0.3] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
    </div>
  );
}

export default function StreakPending({ pendingStreak, onConfirm }: StreakPendingProps) {
  const t = useTranslations('streakPending');
  const { play, createLooper } = useSound();
  const [phase, setPhase] = useState<Phase>('idle');
  const [showText, setShowText] = useState(false);
  const dragY = useMotionValue(0);
  const ignition = useMotionValue(0);
  const flameScale = useMotionValue(0.42);
  const looperRef = useRef<ReturnType<typeof createLooper>>();
  const ignitedRef = useRef(false);
  const startYRef = useRef<number | null>(null);

  const progress = useTransform(dragY, [0, -DRAG_DISTANCE], [0, 1]);
  const clampedProgress = useTransform(progress, (v) => Math.min(Math.max(v, 0), 1));

  useEffect(() => {
    play('spark');
  }, [play]);

  useEffect(() => {
    if (phase === 'dragging') {
      if (!looperRef.current) {
        looperRef.current = createLooper('fireAmbient');
      }
      looperRef.current.start();
    } else {
      looperRef.current?.stop();
    }
    return () => { looperRef.current?.stop(); };
  }, [phase, createLooper]);

  useEffect(() => {
    const unsubscribe = clampedProgress.on('change', (v) => {
      if (looperRef.current && phase === 'dragging') {
        const freq = 180 + v * 250;
        const vol = 0.01 + v * 0.035;
        looperRef.current.set({ frequency: freq, volume: vol });
      }
    });
    return unsubscribe;
  }, [clampedProgress, phase]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (phase === 'success') return;
    startYRef.current = e.clientY;
  }, [phase]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (startYRef.current === null || phase === 'success') return;

    const delta = startYRef.current - e.clientY;
    if (delta > 5 && phase === 'idle') {
      setPhase('dragging');
    }

    const clamped = Math.min(Math.max(delta, 0), DRAG_DISTANCE);
    dragY.set(-clamped);
    if (phase === 'dragging' || delta > 5) {
      flameScale.set(0.42 + (clamped / DRAG_DISTANCE) * 0.14);
    }
  }, [phase, dragY, flameScale]);

  const handlePointerUp = useCallback(() => {
    if (startYRef.current === null || phase === 'success') return;
    startYRef.current = null;

    const currentProgress = progress.get();

    if (currentProgress >= IGNITION_THRESHOLD) {
      ignitedRef.current = true;
      looperRef.current?.stop();
      setPhase('success');
      play('streakSuccess');
      animate(dragY, -DRAG_DISTANCE, { type: 'spring', stiffness: 300, damping: 25 });
      animate(ignition, 1, { duration: 0.85, ease: [0.4, 0, 0.2, 1] });
      animate(flameScale, 1, { type: 'spring', stiffness: 180, damping: 18 });

      setTimeout(() => {
        setShowText(true);
      }, 2000);
    } else {
      play('snapback');
      animate(dragY, 0, { type: 'spring', stiffness: 350, damping: 22 });
      animate(flameScale, 0.42, { type: 'spring', stiffness: 350, damping: 22 });
      if (phase === 'dragging') {
        setPhase('idle');
      }
    }
  }, [phase, progress, dragY, flameScale, ignition, play]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm touch-none select-none overflow-hidden"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <AnimatePresence>
        {phase !== 'success' && (
          <motion.p
            key="instruction"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute bottom-24 text-lg font-semibold text-zinc-400 animate-pulse"
          >
            {t('instruction')}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        className="relative z-10"
        style={{ scale: flameScale, transformOrigin: 'center bottom', width: 240, height: 240 }}
      >
        <FireFlame ignition={ignition} active={phase === 'success'} sparks={phase === 'success'} />
      </motion.div>

      <AnimatePresence>
        {phase === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center relative"
          >
            <AnimatePresence>
              {showText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 mt-6 flex flex-col items-center"
                >
                  <h2 className="text-center text-xl sm:text-2xl font-bold text-zinc-50">
                    {t('congratulations', { count: pendingStreak })}
                  </h2>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    onClick={onConfirm}
                    className="mt-6 rounded-xl bg-purple-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-500 active:scale-[0.98]"
                  >
                    {t('continue')}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
