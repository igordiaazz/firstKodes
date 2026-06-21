'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Braces,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code,
  Flame,
  GitBranch,
  Heart,
  Lock,
  Repeat,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  streak: number;
  onStartModule?: (moduleId: string) => void;
  onPracticeModule?: (moduleId: string) => void;
}

export default function Carousel({
  modules: externalModules,
  streak,
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
    <>
      {/* Gamification Badges */}
      <div className="fixed top-6 right-4 z-50 sm:right-8">
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-3 py-1.5 backdrop-blur-sm">
          <Flame size={18} className="text-orange-500" />
          <span className="text-sm font-semibold text-zinc-50">{streak}</span>
        </div>
      </div>

    <div className="relative mx-auto flex w-full max-w-6xl items-center px-4 sm:px-12">
      {/* Previous Button */}
      <button
        onClick={previous}
        disabled={focusedIndex === 0}
        aria-label="Módulo anterior"
        className={`z-10 hidden shrink-0 items-center justify-center rounded-full bg-zinc-800 p-2 text-purple-500 transition-all hover:bg-zinc-700 hover:text-purple-400 disabled:pointer-events-none disabled:opacity-30 sm:flex ${
          focusedIndex === 0 ? 'opacity-30' : ''
        }`}
      >
        <ChevronLeft size={28} />
      </button>

      {/* Cards Area */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative mx-0 flex w-full items-center justify-center overflow-visible py-8 sm:mx-4"
        style={{ minHeight: 464, touchAction: 'pan-y' }}
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity,
                  scale,
                  x,
                  zIndex,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                onClick={() => handleCardClick(index)}
                style={{ width: cardWidth, minHeight: 400 }}
                className={`absolute shrink-0 cursor-pointer select-none rounded-xl border-2 p-8 transition-shadow ${
                  isFocused
                    ? 'border-purple-500 bg-zinc-900 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                    : 'border-zinc-800 bg-zinc-950'
                }`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex size-12 items-center justify-center rounded-lg ${
                      isFocused
                        ? 'bg-purple-600/20 text-purple-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    <mod.icon size={28} />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-2xl font-bold ${
                        isFocused ? 'text-zinc-50' : 'text-zinc-400'
                      }`}
                    >
                      {mod.title}
                    </h3>
                    {mod.phasesCompleted === mod.totalPhases && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                    {!mod.unlocked && (
                      <Lock size={18} className="text-zinc-500" />
                    )}
                  </div>
                </div>

                <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                  {mod.description}
                </p>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">
                      Progresso
                    </span>
                    <span className="text-zinc-400">
                      {mod.phasesCompleted}/{mod.totalPhases} Fases
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      initial={false}
                      animate={{
                        width: `${(mod.phasesCompleted / mod.totalPhases) * 100}%`,
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-purple-500"
                    />
                  </div>
                </div>

                {/* Action Button */}
                {isFocused && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
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
                    className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all ${
                      !mod.unlocked
                        ? 'cursor-not-allowed bg-zinc-800 text-zinc-600'
                        : mod.phasesCompleted === mod.totalPhases
                          ? 'border-2 border-purple-500 bg-transparent text-purple-400 hover:scale-105 hover:bg-purple-500/10 active:scale-95'
                          : 'bg-purple-600 text-white hover:scale-105 hover:bg-purple-500 active:scale-95'
                    }`}
                  >
                    {!mod.unlocked
                      ? 'Bloqueado'
                      : mod.phasesCompleted === mod.totalPhases
                        ? 'Praticar'
                        : 'Iniciar'}
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Next Button */}
      <button
        onClick={next}
        disabled={focusedIndex === modules.length - 1}
        aria-label="Próximo módulo"
        className={`z-10 hidden shrink-0 items-center justify-center rounded-full bg-zinc-800 p-2 text-purple-500 transition-all hover:bg-zinc-700 hover:text-purple-400 disabled:pointer-events-none disabled:opacity-30 sm:flex ${
          focusedIndex === modules.length - 1 ? 'opacity-30' : ''
        }`}
      >
        <ChevronRight size={28} />
      </button>

      {/* Mobile nav buttons (absolutely positioned over edges) */}
      <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
        <button
          onClick={previous}
          disabled={focusedIndex === 0}
          aria-label="Módulo anterior"
          className="flex size-10 items-center justify-center rounded-full bg-zinc-800/80 text-purple-500 backdrop-blur-sm disabled:opacity-20"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center sm:hidden">
        <button
          onClick={next}
          disabled={focusedIndex === modules.length - 1}
          aria-label="Próximo módulo"
          className="flex size-10 items-center justify-center rounded-full bg-zinc-800/80 text-purple-500 backdrop-blur-sm disabled:opacity-20"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
    </>
  );
}
