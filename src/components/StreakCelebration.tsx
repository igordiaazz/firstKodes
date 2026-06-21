'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakCelebrationProps {
  show: boolean;
  onClose: () => void;
}

export default function StreakCelebration({ show, onClose }: StreakCelebrationProps) {
  if (!show) return null;

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
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="drop-shadow-[0_0_30px_rgba(249,115,22,0.6)]"
        >
          <Flame size={96} className="text-orange-500" />
        </motion.div>
        <span className="mt-2 text-7xl font-black text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">
          1
        </span>
        <h2 className="mt-6 text-center text-2xl font-bold text-zinc-50">
          Parabéns, seu primeiro dia de muitos na programação!
        </h2>
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onClose}
          className="mt-8 rounded-xl bg-purple-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-500 active:scale-[0.98]"
        >
          Continuar
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
