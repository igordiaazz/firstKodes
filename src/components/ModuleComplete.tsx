'use client';

import { motion } from 'framer-motion';
import { Clock, Crown } from 'lucide-react';

interface ModuleCompleteProps {
  elapsedMs: number;
  moduleTitle: string;
  isPractice?: boolean;
  onClose: () => void;
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

export default function ModuleComplete({ elapsedMs, moduleTitle, isPractice, onClose }: ModuleCompleteProps) {
  const timeStr = formatTime(elapsedMs);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex flex-col items-center px-6"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="drop-shadow-[0_0_40px_rgba(168,85,247,0.6)]"
        >
          <Crown size={80} className="text-purple-400" />
        </motion.div>

        <h2 className="mt-6 text-center text-2xl font-bold text-zinc-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          {isPractice ? 'Prática Concluída!' : 'Módulo Concluído!'}
        </h2>
        <p className="mt-2 text-zinc-400">{moduleTitle}</p>
        {isPractice && (
          <p className="mt-1 text-sm text-zinc-500">Fases extras</p>
        )}

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/10 px-6 py-3 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <Clock size={22} className="text-purple-300" />
          <span className="text-2xl font-bold text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
            {timeStr}
          </span>
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
