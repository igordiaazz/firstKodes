'use client';

import {
  BarChart,
  Braces,
  CheckCircle2,
  Code,
  GitBranch,
  Repeat,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  onStartModule?: (moduleId: string) => void;
  onPracticeModule?: (moduleId: string) => void;
  onAdminUnlock?: () => void;
}

const MODULE_BG = 'bg-neutral-900';

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

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, modules.length - 1));
  }, [modules.length]);

  const goTo = useCallback((index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, modules.length - 1)));
  }, [modules.length]);

  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    touchStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const endX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = touchStartX.current - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goTo(activeIndex + 1);
      } else {
        goTo(activeIndex - 1);
      }
    }
  }, [activeIndex, goTo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(activeIndex + 1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, goTo]);

  const handleCardClick = (mod: ModuleData, idx: number) => {
    if (idx !== activeIndex) {
      goTo(idx);
      return;
    }
    if (!mod.unlocked) return;
    if (mod.phasesCompleted === mod.totalPhases) {
      onPracticeModule?.(mod.id);
    } else {
      onStartModule?.(mod.id);
    }
  };

  const handleIconClick = (e: React.MouseEvent, modIndex: number) => {
    e.stopPropagation();
    if (modIndex === 0) {
      const next = clickCount + 1;
      setClickCount(next);
      if (next >= 10) {
        setClickCount(0);
        setShowAdminPopup(true);
      }
    }
  };

  const handleAdminSubmit = () => {
    if (adminPassword === '123456') {
      onAdminUnlock?.();
      setShowAdminPopup(false);
      setAdminPassword('');
    }
  };

  return (
    <div className="relative w-full mt-16 md:mt-24">
      <div
        className="h-[460px] md:h-[520px] overflow-hidden relative select-none"
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => { isDragging.current = false; }}
      >
        {modules.map((mod, idx) => {
          const isLocked = !mod.unlocked;
          const centerOffset = idx - activeIndex;
          const direcao = centerOffset > 0 ? 1 : -1;
          const absOffset = Math.abs(centerOffset);
          const isActive = idx === activeIndex;

          let offsetX = 0;
          let scale = 1;
          const zIndex = 50 - absOffset;
          let opacity = 1;
          let filter = 'blur(0px) brightness(100%)';

          if (centerOffset !== 0) {
            offsetX = (300 + (absOffset - 1) * 70) * direcao;
            scale = 0.85 - absOffset * 0.02;
            opacity = 1;
            filter = 'blur(2px) brightness(85%)';
          }

          return (
            <div
              key={mod.id}
              className="absolute left-1/2 top-1/2 w-[85vw] max-w-[320px] lg:max-w-[400px] h-[440px] md:h-[480px]"
              style={{
                transform: `translateX(calc(-50% + ${offsetX}px)) translateY(-50%) scale(${scale})`,
                zIndex,
                opacity,
                filter,
                transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div
                onClick={() => handleCardClick(mod, idx)}
                className={cn(
                  'relative overflow-hidden rounded-3xl h-full cursor-pointer group border border-white/10',
                  MODULE_BG,
                )}
              >
                <div className="flex flex-col h-full p-6 md:p-8">
                  <div>
                    <p
                      className="text-sm text-white/60 font-medium"
                      onClick={(e) => handleIconClick(e, idx)}
                    >
                      Módulo {idx + 1}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <h3 className="text-2xl font-bold text-white tracking-tight leading-tight md:text-3xl">
                        {mod.title}
                      </h3>
                      {mod.phasesCompleted === mod.totalPhases && (
                        <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-sm text-white/60 mt-1.5 leading-relaxed line-clamp-2">
                      {mod.description}
                    </p>

                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <mod.icon
                      size={88}
                      className={cn(
                        'size-16 md:size-20 lg:size-24 transition-all duration-300',
                        isLocked
                          ? 'text-purple-400/30 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)] drop-shadow-[0_0_40px_rgba(168,85,247,0.4)]'
                          : isActive
                            ? 'text-purple-400/70 scale-110 drop-shadow-[0_0_15px_rgba(168,85,247,0.9)] drop-shadow-[0_0_45px_rgba(168,85,247,0.6)] drop-shadow-[0_0_90px_rgba(168,85,247,0.3)]'
                            : 'text-purple-400/50 group-hover:text-purple-400/70 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(168,85,247,0.7)] drop-shadow-[0_0_40px_rgba(168,85,247,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.9)] group-hover:drop-shadow-[0_0_50px_rgba(168,85,247,0.6)]',
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-xs text-neutral-400 font-medium">
                    <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-purple-300 bg-purple-500/10 border border-purple-500/30 rounded-md">
                      Python
                    </span>
                    <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-300 bg-white/5 border border-white/10 rounded-md">
                      Lógica
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BarChart size={14} className="text-neutral-500" />
                      Iniciante
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60 font-medium">
                      {mod.phasesCompleted}/{mod.totalPhases} fases
                    </span>

                    {isLocked ? (
                      <span className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white/50 backdrop-blur-sm border border-white/5">
                        Bloqueado
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (mod.phasesCompleted === mod.totalPhases) {
                            onPracticeModule?.(mod.id);
                          } else {
                            onStartModule?.(mod.id);
                          }
                        }}
                        className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
                      >
                        {mod.phasesCompleted === mod.totalPhases
                          ? 'Praticar'
                          : 'Iniciar'}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
                      style={{ width: `${(mod.phasesCompleted / mod.totalPhases) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-zinc-500 mt-6">arraste os cards para ver mais</p>

      {showAdminPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm sm:w-80 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
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
