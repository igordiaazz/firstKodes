'use client';

import { motion } from 'framer-motion';
import { Clock, Bot, Hexagon } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { NumberTicker } from '@/components/ui/number-ticker';

interface ModuleCompleteProps {
  elapsedMs: number;
  moduleTitle: string;
  isPractice?: boolean;
  onClose: () => void;
  kodeScore: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

export default function ModuleComplete({ elapsedMs, moduleTitle, isPractice, onClose, kodeScore }: ModuleCompleteProps) {
  const timeStr = formatTime(elapsedMs);

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#a855f7', '#c084fc', '#ffffff', '#1e1b4b'],
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex flex-col items-center px-6"
      >
        <motion.div
          initial={{ scale: 0, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="flex size-20 items-center justify-center rounded-2xl bg-purple-600/20 drop-shadow-[0_0_40px_rgba(168,85,247,0.6)]"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Bot size={48} className="text-purple-300" />
          </motion.div>
        </motion.div>

        <h2 className="mt-6 text-center text-2xl font-bold text-zinc-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          {isPractice ? 'Prática Concluída!' : 'Módulo Concluído!'}
        </h2>
        <p className="mt-2 text-zinc-400">{moduleTitle}</p>
        {isPractice && (
          <p className="mt-1 text-sm text-zinc-500">Fases extras</p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-4">
            <Clock size={24} className="text-purple-400 shrink-0" />
            <div>
              <p className="text-xs text-zinc-500">Tempo</p>
              <p className="text-xl font-bold text-zinc-50">{timeStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-4">
            <Hexagon size={24} className="text-purple-400 shrink-0" />
            <div>
              <p className="text-xs text-zinc-500">KodeScore</p>
              <p className="text-xl font-bold text-zinc-50">
                <NumberTicker value={kodeScore} />
              </p>
            </div>
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onClose}
          className="mt-8 rounded-xl bg-purple-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] active:scale-[0.98]"
        >
          Continuar
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
