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
import { useCallback, useEffect, useState } from 'react';

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
    <div className="relative w-screen left-1/2 -translate-x-1/2 mt-16 md:mt-24">
      <div className="h-[500px] overflow-hidden relative">
        {modules.map((mod, idx) => {
          const isLocked = !mod.unlocked;
          const centerOffset = idx - activeIndex;
          const direcao = centerOffset > 0 ? 1 : -1;
          const absOffset = Math.abs(centerOffset);
          const isActive = idx === activeIndex;

          let translateX = 0;
          let scale = 1;
          const zIndex = 50 - absOffset;
          let opacity = 1;
          let filter = 'blur(0px) brightness(100%)';

          if (centerOffset !== 0) {
            translateX = (360 + (absOffset - 1) * 90) * direcao;
            scale = 0.85 - absOffset * 0.02;
            opacity = 1;
            filter = 'blur(2px) brightness(85%)';
          }

          return (
            <div
              key={mod.id}
              className="absolute inset-0 m-auto w-[85vw] max-w-[320px] h-[480px]"
              style={{
                transform: `translateX(${translateX}px) scale(${scale})`,
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
                        'md:size-24 transition-all duration-300',
                        isLocked
                          ? 'text-white/10 group-hover:scale-110'
                          : isActive
                            ? 'text-purple-400/40 scale-110 drop-shadow-[0_0_12px_rgba(168,85,247,0.5)] drop-shadow-[0_0_35px_rgba(168,85,247,0.25)]'
                            : 'text-purple-500/20 group-hover:text-purple-400/40 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]',
                      )}
                    />
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-12">
        <button
          onClick={() => goTo(activeIndex - 1)}
          className="flex size-10 items-center justify-center rounded-full bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Anterior"
          disabled={activeIndex === 0}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => goTo(activeIndex + 1)}
          className="flex size-10 items-center justify-center rounded-full bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Próximo"
          disabled={activeIndex === modules.length - 1}
        >
          <ChevronRight size={20} />
        </button>
      </div>

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
