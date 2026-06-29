'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermTooltipProps {
  term: string;
  definition: string;
}

export default function TermTooltip({ term, definition }: TermTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex cursor-help border-b border-dashed border-purple-500/50 leading-normal"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {term}
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, scale: 0.92, y: 2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 2 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs leading-relaxed text-neutral-300 shadow-xl"
          >
            {definition}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
