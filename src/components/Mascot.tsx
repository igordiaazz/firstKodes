'use client';

import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MascotProps {
  status: 'idle' | 'typing' | 'error' | 'success';
}

const animations: Record<
  MascotProps['status'],
  { animate: Record<string, number | number[]>; transition?: object }
> = {
  idle: {
    animate: { y: [0, -3, 0] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  typing: {
    animate: { rotate: [-2, 2] },
    transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
  },
  error: {
    animate: { x: [0, -4, 4, -4, 4, 0] },
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  success: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export default function Mascot({ status }: MascotProps) {
  const { animate, transition } = animations[status];

  return (
    <motion.div
      animate={animate}
      transition={transition}
      className={cn(
        'flex size-14 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
        status === 'error'
          ? 'bg-red-600/20'
          : status === 'success'
            ? 'bg-purple-600/20 [filter:drop-shadow(0_0_6px_#a855f7)]'
            : 'bg-purple-600/20',
      )}
    >
      <Bot
        size={32}
        className={cn(
          'transition-colors duration-300',
          status === 'error'
            ? 'text-red-400'
            : status === 'success'
              ? 'text-purple-300'
              : 'text-purple-400',
        )}
      />
    </motion.div>
  );
}
