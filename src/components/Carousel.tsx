'use client';

import {
  Braces,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code,
  GitBranch,
  Repeat,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

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
  onAdminUnlock?: () => void;
}

export default function Carousel({
  modules: externalModules,
  onStartModule,
  onPracticeModule,
  onAdminUnlock,
}: CarouselProps) {
  const modules = externalModules ?? MOCK_MODULES;
  const [activeIndex, setActiveIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const touchStartX = useRef(0);

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, modules.length - 1));
  }, [modules.length]);

  const goNext = () =>
    setActiveIndex((prev) => Math.min(prev + 1, modules.length - 1));
  const goPrev = () => setActiveIndex((prev) => Math.max(prev - 1, 0));
  const goTo = (index: number) => setActiveIndex(index);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, modules.length - 1));
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modules.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const handleFirstCardClick = () => {
    const next = clickCount + 1;
    if (next >= 10) {
      setClickCount(0);
      setShowAdminPopup(true);
    } else {
      setClickCount(next);
    }
  };

  const handleAdminSubmit = () => {
    if (adminPassword === '123456') {
      onAdminUnlock?.();
      setShowAdminPopup(false);
      setAdminPassword('');
    }
  };

  const getCardStyle = (index: number): React.CSSProperties => {
    const offset = index - activeIndex;
    const absOffset = Math.abs(offset);

    const baseShift = 75;
    const extraShift = 15;
    const totalShift = offset === 0 ? 0 : (baseShift + (absOffset - 1) * extraShift) * Math.sign(offset);
    const translateX = -50 + totalShift;
    const zIndex = modules.length - absOffset;

    const getOpacity = (): number => {
      if (absOffset <= 3) return 1;
      return 0;
    };

    const getScale = (): number => {
      if (absOffset === 0) return 1;
      if (absOffset === 1) return 0.85;
      if (absOffset === 2) return 0.75;
      return 0.65;
    };

    const style: React.CSSProperties = {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translateX(${translateX}%) translateY(-50%) scale(${getScale()})`,
      zIndex,
      opacity: getOpacity(),
      pointerEvents: absOffset <= 3 ? 'auto' : 'none',
      transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
    };

    if (absOffset === 1) {
      style.filter = 'brightness(0.85) blur(1px)';
    } else if (absOffset === 2) {
      style.filter = 'brightness(0.7) blur(2px)';
    } else if (absOffset >= 3) {
      style.filter = 'brightness(0.55) blur(3px)';
    }

    if (absOffset === 0) {
      style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.6)';
    }

    return style;
  };

  return (
    <div className="relative w-screen left-1/2 -translate-x-1/2">
      <div
        className="relative h-[460px] md:h-[520px] select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {modules.map((mod, idx) => (
          <div key={mod.id} style={getCardStyle(idx)}>
            <div
              className="w-[85vw] max-w-[360px]"
              onClick={() => {
                if (idx !== activeIndex) {
                  goTo(idx);
                }
              }}
            >
              <div
                className={cn(
                  'flex flex-col overflow-hidden rounded-[24px] border border-white/10 min-h-[440px]',
                  idx !== activeIndex && 'pointer-events-none',
                )}
              >
                <div
                  className="flex h-48 items-center justify-center bg-neutral-800"
                  onClick={(e) => {
                    if (idx === 0 && idx === activeIndex) {
                      e.stopPropagation();
                      handleFirstCardClick();
                    }
                  }}
                >
                  <mod.icon
                    size={48}
                    className={mod.unlocked ? 'text-purple-400' : 'text-zinc-700'}
                  />
                </div>

                <div className="flex flex-1 flex-col bg-neutral-900 p-8">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        'text-2xl font-semibold tracking-tight',
                        mod.unlocked ? 'text-zinc-50' : 'text-zinc-600',
                      )}
                    >
                      {mod.title}
                    </h3>
                    {mod.phasesCompleted === mod.totalPhases && (
                      <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
                    )}
                  </div>

                  <p
                    className={cn(
                      'mt-2 text-base leading-relaxed',
                      mod.unlocked ? 'text-zinc-400' : 'text-zinc-700',
                    )}
                  >
                    {mod.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
                    <span
                      className={cn(
                        'text-base font-medium',
                        mod.unlocked ? 'text-zinc-500' : 'text-zinc-700',
                      )}
                    >
                      {mod.phasesCompleted}/{mod.totalPhases} fases
                    </span>

                    <button
                      onClick={() => {
                        if (!mod.unlocked) return;
                        if (mod.phasesCompleted === mod.totalPhases) {
                          onPracticeModule?.(mod.id);
                        } else {
                          onStartModule?.(mod.id);
                        }
                      }}
                      disabled={!mod.unlocked}
                      className={cn(
                        'rounded-full px-6 py-2.5 text-base font-semibold transition-colors',
                        !mod.unlocked
                          ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                          : 'bg-zinc-100 text-zinc-900 hover:bg-white',
                      )}
                    >
                      {!mod.unlocked
                        ? 'Bloqueado'
                        : mod.phasesCompleted === mod.totalPhases
                          ? 'Praticar'
                          : 'Iniciar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={goPrev}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex size-10 items-center justify-center rounded-full bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Anterior"
        disabled={activeIndex === 0}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={goNext}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex size-10 items-center justify-center rounded-full bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Próximo"
        disabled={activeIndex === modules.length - 1}
      >
        <ChevronRight size={20} />
      </button>

      {showAdminPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-80 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-zinc-50">Acesso Administrativo</h2>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminSubmit()}
              placeholder="Digite a senha"
              className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAdminPopup(false); setAdminPassword(''); }}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdminSubmit}
                className="flex-1 rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
