'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermTooltipProps {
  term: string;
  definition: string;
}

const TIP_WIDTH = 224; // w-56 = 14rem
const EDGE_PADDING = 8;
const TIP_EST_HEIGHT = 96;

export default function TermTooltip({ term, definition }: TermTooltipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  const position = () => {
    const el = triggerRef.current;
    const tip = tipRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tipW = tip?.offsetWidth ?? TIP_WIDTH;
    const tipH = tip?.offsetHeight ?? TIP_EST_HEIGHT;
    const gap = 6;

    let vTop = rect.bottom + gap;
    if (vTop + tipH > vh - EDGE_PADDING) {
      vTop = rect.top - gap - tipH;
    }
    vTop = Math.min(
      Math.max(vTop, EDGE_PADDING),
      Math.max(EDGE_PADDING, vh - tipH - EDGE_PADDING),
    );

    let vLeft = rect.left;
    vLeft = Math.min(
      Math.max(vLeft, EDGE_PADDING),
      Math.max(EDGE_PADDING, vw - tipW - EDGE_PADDING),
    );

    setPos({ left: vLeft - rect.left, top: vTop - rect.top });
  };

  useEffect(() => {
    if (!open) return;
    const measure = () => position();
    measure();
    const raf = requestAnimationFrame(measure);
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('click', close);
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            ref={tipRef}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ left: pos.left, top: pos.top }}
            className="absolute z-50 max-h-[40vh] w-56 overflow-y-auto whitespace-normal rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs leading-relaxed text-neutral-300 shadow-xl"
          >
            {definition}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
