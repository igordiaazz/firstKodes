'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useSound } from '@/hooks/useSound';

interface StreakLostProps {
  show: boolean;
  lostStreak: number;
  onClose: () => void;
}

type Phase = 'burning' | 'flickering' | 'extinguishing' | 'done';

const SMOKE_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 40 + Math.random() * 20,
  y: 50 + Math.random() * 20,
  size: 4 + Math.random() * 12,
  delay: Math.random() * 0.6,
  duration: 1.5 + Math.random() * 1,
}));

export default function StreakLost({ show, lostStreak, onClose }: StreakLostProps) {
  const t = useTranslations('streakLost');
  const { play } = useSound();
  const [phase, setPhase] = useState<Phase>('burning');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!show) {
      setPhase('burning');
      return;
    }

    play('streakLost');

    const timers = timersRef.current;
    timers.forEach(clearTimeout);

    timers.push(setTimeout(() => setPhase('flickering'), 1500));
    timers.push(setTimeout(() => setPhase('extinguishing'), 3000));
    timers.push(setTimeout(() => setPhase('done'), 4500));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [show, play]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      <AnimatePresence mode="wait">
        {phase === 'burning' && (
          <motion.div
            key="burning"
            className="flex flex-col items-center px-6"
          >
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="drop-shadow-[0_0_40px_rgba(249,115,22,0.7)]"
            >
              <Flame size={120} className="text-orange-500 size-20 sm:size-28" />
            </motion.div>
            <span className="mt-4 text-5xl sm:text-7xl font-black text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              {lostStreak}
            </span>
          </motion.div>
        )}

        {phase === 'flickering' && (
          <motion.div
            key="flickering"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center px-6"
          >
            <motion.div
              animate={{
                scale: [1, 0.85, 1.1, 0.9, 1.05, 0.95, 1],
                opacity: [1, 0.6, 0.9, 0.5, 0.8, 0.6, 0.7],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]"
            >
              <Flame size={100} className="text-orange-400 size-18 sm:size-24" />
            </motion.div>
            <span className="mt-4 text-5xl sm:text-7xl font-black text-orange-400/70 drop-shadow-[0_0_10px_rgba(249,115,22,0.2)]">
              {lostStreak}
            </span>
          </motion.div>
        )}

        {phase === 'extinguishing' && (
          <motion.div
            key="extinguishing"
            className="flex flex-col items-center px-6 relative"
          >
            {SMOKE_PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  x: `${p.x}%`,
                  y: `${p.y}%`,
                  opacity: 0.6,
                  scale: 1,
                }}
                animate={{
                  y: `${p.y - 40 - Math.random() * 30}%`,
                  x: `${p.x + (Math.random() - 0.5) * 20}%`,
                  opacity: 0,
                  scale: 0.3,
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: 'easeOut',
                }}
                className="absolute rounded-full bg-zinc-400/30"
                style={{
                  width: p.size,
                  height: p.size,
                  filter: 'blur(2px)',
                }}
              />
            ))}
            <motion.div
              animate={{ scale: [1, 0.6, 0.2, 0], opacity: [0.7, 0.4, 0.1, 0] }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              <Flame size={80} className="text-zinc-500 size-16 sm:size-20" />
            </motion.div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center px-6"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.6 }}
            >
              <Flame size={64} className="text-zinc-700 size-14 sm:size-20" />
            </motion.div>

            <h2 className="mt-6 text-center text-2xl font-bold text-zinc-50">
              {t('title')}
            </h2>
            <p className="mt-3 text-center text-zinc-400 max-w-xs">
              {t('subtitle', { count: lostStreak })}
            </p>
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={onClose}
              className="mt-8 rounded-xl bg-purple-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-500 active:scale-[0.98]"
            >
              {t('continue')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
