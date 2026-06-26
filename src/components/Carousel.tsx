'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Braces,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code,
  GitBranch,
  Heart,
  Lock,
  Repeat,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  totalPhases: number;
  phasesCompleted: number;
  unlocked: boolean;
}

const MOCK_MODULES: ModuleData[] = [
  {
    id: 'fundamentos',
    title: 'Fundamentos',
    description: 'Variáveis, tipos de dados e operadores básicos',
    icon: Code,
    totalPhases: 5,
    phasesCompleted: 5,
    unlocked: true,
  },
  {
    id: 'decisoes',
    title: 'Decisões',
    description: 'Estruturas condicionais (if/else, switch)',
    icon: GitBranch,
    totalPhases: 5,
    phasesCompleted: 0,
    unlocked: false,
  },
  {
    id: 'repeticoes',
    title: 'Repetições',
    description: 'Loops (for, while, do-while)',
    icon: Repeat,
    totalPhases: 5,
    phasesCompleted: 0,
    unlocked: false,
  },
  {
    id: 'funcoes',
    title: 'Funções e Listas',
    description: 'Funções, arrays e listas encadeadas',
    icon: Braces,
    totalPhases: 5,
    phasesCompleted: 0,
    unlocked: false,
  },
];

export interface CarouselProps {
  modules?: ModuleData[];
  onStartModule?: (moduleId: string) => void;
  onPracticeModule?: (moduleId: string) => void;
}

const cardVariants = {
  initial: { opacity: 0, scale: 0.8 },
  exit: { opacity: 0, scale: 0.8 },
};

export default function Carousel({
  modules: externalModules,
  onStartModule,
  onPracticeModule,
}: CarouselProps) {
  const modules = externalModules ?? MOCK_MODULES;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(320);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);
  const swipeStartX = useRef(0);
  const swiping = useRef(false);

  useEffect(() => {
    const updateWidth = () => {
      const vw = window.innerWidth;
      setCardWidth(vw < 768 ? Math.min(vw * 0.85, 384) : 384);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning.current) return;
      isTransitioning.current = true;
      setFocusedIndex(index);
      setTimeout(() => {
        isTransitioning.current = false;
      }, 400);
    },
    [],
  );

  const previous = useCallback(
    () => goTo(Math.max(0, focusedIndex - 1)),
    [focusedIndex, goTo],
  );
  const next = useCallback(
    () => goTo(Math.min(modules.length - 1, focusedIndex + 1)),
    [focusedIndex, goTo, modules.length],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    swipeStartX.current = e.clientX;
    swiping.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (swipeStartX.current === 0) return;
    const diff = Math.abs(e.clientX - swipeStartX.current);
    if (diff > 10) {
      swiping.current = true;
    }
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const startX = swipeStartX.current;
      swipeStartX.current = 0;

      if (!swiping.current || startX === 0) return;

      const diff = e.clientX - startX;
      swiping.current = false;

      if (diff < -50) {
        next();
      } else if (diff > 50) {
        previous();
      }
    },
    [next, previous],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') previous();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [previous, next]);

  const handleCardClick = (index: number) => {
    if (index === focusedIndex) return;
    goTo(index);
  };

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center px-0">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative flex w-full items-center justify-center overflow-visible py-8"
        style={{ minHeight: 520, touchAction: 'pan-y' }}
      >
        <AnimatePresence mode="popLayout">
          {modules.map((mod, index) => {
            const distance = index - focusedIndex;
            const isFocused = distance === 0;
            const isVisible = Math.abs(distance) <= 1;

            if (!isVisible) return null;

            let scale = 0.85;
            let opacity = 0.5;
            let x = 0;
            let zIndex = 1;

            if (distance === -1) {
              x = -cardWidth - 40;
            } else if (distance === 1) {
              x = cardWidth + 40;
            } else if (distance === 0) {
              scale = 1;
              opacity = 1;
              zIndex = 10;
            }

            return (
              <motion.div
                key={mod.id}
                layout
                initial="initial"
                animate={{
                  opacity,
                  scale,
                  x,
                  zIndex,
                }}
                exit="exit"
                variants={cardVariants}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 25,
                }}
                onClick={() => handleCardClick(index)}
                style={{ width: cardWidth }}
                className={cn(
                  'absolute shrink-0 select-none h-[460px]',
                  mod.unlocked ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <div
                  className={cn(
                    'h-full p-2 rounded-[2.5rem] bg-zinc-800/40 border border-zinc-700/50 shadow-2xl transition-transform duration-300',
                    mod.unlocked
                      ? 'group hover:scale-[1.02]'
                      : 'opacity-40',
                  )}
                >
                  <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800/80">
                    {/* Dynamic background with icon */}
                    <div
                      className={cn(
                        'absolute inset-0 flex justify-center pt-16 transition-colors duration-500',
                        isFocused
                          ? 'bg-gradient-to-b from-purple-900/20 to-zinc-950 group-hover:from-purple-800/30'
                          : 'bg-gradient-to-b from-zinc-800/20 to-zinc-950',
                      )}
                    >
                      <div
                        className={cn(
                          'w-32 h-32 rounded-full bg-purple-500/10 flex items-center justify-center transition-all duration-500',
                          isFocused ? 'blur-none' : 'blur-[2px]',
                        )}
                      >
                        <mod.icon size={64} className="text-purple-400/80" />
                      </div>
                    </div>

                    {/* Bottom Frost */}
                    <div className="absolute bottom-0 left-0 right-0 pt-16 pb-6 px-6 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-zinc-50 tracking-tight">
                          {mod.title}
                        </h3>
                        {mod.phasesCompleted === mod.totalPhases && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-medium line-clamp-2">
                        {mod.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-4 text-zinc-300 text-sm font-semibold">
                          <span>
                            {mod.phasesCompleted}/{mod.totalPhases} fases
                          </span>
                        </div>

                        {isFocused && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!mod.unlocked) return;
                              if (mod.phasesCompleted === mod.totalPhases) {
                                onPracticeModule?.(mod.id);
                              } else {
                                onStartModule?.(mod.id);
                              }
                            }}
                            disabled={!mod.unlocked}
                            className={cn(
                              'px-5 py-2.5 font-bold text-sm rounded-full transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]',
                              !mod.unlocked
                                ? 'cursor-not-allowed bg-zinc-800 text-zinc-600'
                                : 'bg-zinc-100 hover:bg-white text-zinc-950',
                            )}
                          >
                            {!mod.unlocked
                              ? 'Bloqueado'
                              : mod.phasesCompleted === mod.totalPhases
                                ? 'Praticar'
                                : 'Iniciar'}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-6 pb-4">
        <button
          onClick={previous}
          disabled={focusedIndex === 0}
          aria-label="Módulo anterior"
          className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:pointer-events-none disabled:opacity-20"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-xs text-zinc-600">
          {focusedIndex + 1} / {modules.length}
        </span>
        <button
          onClick={next}
          disabled={focusedIndex === modules.length - 1}
          aria-label="Próximo módulo"
          className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:pointer-events-none disabled:opacity-20"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
