'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermTooltipProps {
  term: string;
  definition: string;
}

const TIP_WIDTH = 224; // w-56 = 14rem
const EDGE_PADDING = 8;

export default function TermTooltip({ term, definition }: TermTooltipProps) {
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(0);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const position = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const desired = rect.left;
    const maxLeft = window.innerWidth - TIP_WIDTH - EDGE_PADDING;
    const clamped = Math.min(Math.max(desired, EDGE_PADDING), Math.max(EDGE_PADDING, maxLeft));
    setLeft(clamped);
  };

  useEffect(() => {
    if (!open) return;
    position();
    const close = () => setOpen(false);
    const onResize = () => position();
    document.addEventListener('click', close);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      document.removeEventListener('click', close);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open]);

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex cursor-help border-b border-dashed border-purple-400/70 leading-normal text-zinc-400"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((prev) => !prev);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen((prev) => !prev);
        }
      }}
    >
      {term}
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, scale: 0.92, y: 2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 2 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ left }}
            className="absolute top-full z-50 mt-1.5 w-56 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs leading-relaxed text-neutral-300 shadow-xl"
          >
            {definition}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
