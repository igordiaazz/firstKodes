'use client';

import { motion } from 'framer-motion';
import { Braces, Code, Flame, GitBranch, Loader2, Repeat, Settings, Star, Terminal, X } from 'lucide-react';
import { BlurReveal } from '@/components/BlurReveal';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Carousel from '@/components/Carousel';
import Footer from '@/components/Footer';
import GameLevel, { BOSS_CHALLENGES } from '@/components/GameLevel';
import Module5Game from '@/components/Module5Game';
import StreakCelebration from '@/components/StreakCelebration';
import ModuleComplete from '@/components/ModuleComplete';
import { moduleOneLevels } from '@/data/moduleOneLevels';
import {
  moduleTwoLevels,
  moduleThreeLevels,
  moduleFourLevels,
} from '@/data/modulesConfig';
import { useProgress, getModuleNumber } from '@/hooks/useProgress';
import type { LevelData } from '@/data/moduleOneLevels';
import type { ModuleData } from '@/components/Carousel';
import type { PracticeQuestion } from '@/app/api/generate-practice/route';

type View = 'home' | 'game';

const MODULES_META = [
  {
    id: 'fundamentos',
    title: 'Fundamentos',
    description: 'Variáveis, tipos de dados e operadores básicos',
    icon: Code,
  },
  {
    id: 'decisoes',
    title: 'Decisões',
    description: 'Estruturas condicionais (if/else, switch)',
    icon: GitBranch,
  },
  {
    id: 'repeticoes',
    title: 'Repetições',
    description: 'Loops (for, while, do-while)',
    icon: Repeat,
  },
  {
    id: 'funcoes',
    title: 'Funções e Listas',
    description: 'Funções, arrays e listas encadeadas',
    icon: Braces,
  },
  {
    id: 'modulo5',
    title: 'Desafios Finais',
    description: 'Desafios de digitação com Python do zero',
    icon: Star,
  },
];

const LEVELS_MAP: Record<string, LevelData[]> = {
  fundamentos: moduleOneLevels,
  decisoes: moduleTwoLevels,
  repeticoes: moduleThreeLevels,
  funcoes: moduleFourLevels,
  modulo5: [],
};

const MODULE_NAMES: Record<string, string> = {
  fundamentos: 'Fundamentos',
  decisoes: 'Decisões',
  repeticoes: 'Repetições',
  funcoes: 'Funções e Listas',
  modulo5: 'Desafios Finais',
};

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[] | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const prevStreakRef = useRef<number | null>(null);
  const {
    progress,
    hydrated,
    completePhase,
    completeModule,
    setModuleStartTime,
    resetProgress,
    adminCompleteAll,
  } = useProgress();

  useEffect(() => {
    if (!hydrated) return;
    if (prevStreakRef.current === null) {
      prevStreakRef.current = progress.streak;
      return;
    }
    if (prevStreakRef.current === 0 && progress.streak === 1) {
      if (elapsedTime !== null) {
        return;
      }
      setShowStreakCelebration(true);
    }
    prevStreakRef.current = progress.streak;
  }, [progress.streak, hydrated, elapsedTime]);

  const modules: ModuleData[] = useMemo(
    () =>
      MODULES_META.map((meta) => {
        const num = getModuleNumber(meta.id);
        const levels = LEVELS_MAP[meta.id] ?? [];
        return {
          ...meta,
          totalPhases: meta.id === 'modulo5' ? 5 : levels.length + (BOSS_CHALLENGES[meta.id] ? 1 : 0),
          phasesCompleted: progress.phasesCompleted[meta.id] ?? 0,
          unlocked: progress.unlockedModules.includes(num),
        };
      }),
    [progress],
  );

  const handleStartModule = useCallback((moduleId: string) => {
    setActiveModuleId(moduleId);
    setPracticeQuestions(null);
    setView('game');
    setModuleStartTime(Date.now());
  }, [setModuleStartTime]);

  const handleModuleCompleted = useCallback(() => {
    if (progress.moduleStartTime > 0) {
      setElapsedTime(Date.now() - progress.moduleStartTime);
    }
  }, [progress.moduleStartTime]);

  const handlePracticeModule = useCallback(async (moduleId: string) => {
    setActiveModuleId(moduleId);
    setPracticeQuestions(null);
    setPracticeError(null);
    setPracticeLoading(true);
    setView('game');
    setModuleStartTime(Date.now());

    try {
      const res = await fetch('/api/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: MODULE_NAMES[moduleId] ?? moduleId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro ao gerar prática.' }));
        setPracticeError(err.error ?? 'Erro ao gerar prática.');
        return;
      }
      const data = await res.json();
      setPracticeQuestions(data.questions);
    } catch {
      setPracticeError('Erro de conexão ao gerar prática.');
    } finally {
      setPracticeLoading(false);
    }
  }, [setModuleStartTime]);

  const handleExitGame = useCallback(() => {
    setActiveModuleId(null);
    setPracticeQuestions(null);
    setPracticeError(null);
    setView('home');
  }, []);

  const handleComplete = useCallback(
    (moduleId: string, phasesCompleted: number) => {
      completePhase(moduleId, phasesCompleted);
    },
    [completePhase],
  );

  if (view === 'game' && activeModuleId === 'modulo5') {
    return (
      <>
        <Module5Game
          onComplete={(phasesCompleted) => completePhase('modulo5', phasesCompleted)}
          onModuleComplete={() => completeModule(5)}
          onModuleCompleted={handleModuleCompleted}
          onExit={handleExitGame}
        />
        {elapsedTime !== null && (
          <ModuleComplete
            elapsedMs={elapsedTime}
            moduleTitle="Desafios Finais"
            onClose={() => {
              setElapsedTime(null);
              handleExitGame();
            }}
          />
        )}
      </>
    );
  }

  if (view === 'game' && activeModuleId && LEVELS_MAP[activeModuleId]) {
    const levels = LEVELS_MAP[activeModuleId];
    const saved = progress.phasesCompleted[activeModuleId] ?? 0;

    if (practiceLoading) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-zinc-950 px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Loader2 size={48} className="mx-auto mb-6 animate-spin text-purple-400" />
            <h2 className="mb-2 text-xl font-bold text-zinc-50">
              Gerando prática...
            </h2>
            <p className="text-zinc-400">
              Criando 5 fases personalizadas para {MODULE_NAMES[activeModuleId]}
            </p>
          </motion.div>
        </div>
      );
    }

    if (practiceError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-zinc-950 px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <h2 className="mb-2 text-xl font-bold text-red-400">Erro</h2>
            <p className="mb-8 text-zinc-400">{practiceError}</p>
            <button
              onClick={handleExitGame}
              className="rounded-xl bg-purple-600 px-8 py-3 text-base font-bold text-white transition-all hover:bg-purple-500"
            >
              Voltar
            </button>
          </motion.div>
        </div>
      );
    }

    const moduleTitle = MODULES_META.find(m => m.id === activeModuleId)?.title ?? '';
    return (
      <>
        <GameLevel
          levels={levels}
          moduleId={activeModuleId}
          savedProgress={saved}
          practiceQuestions={practiceQuestions}
          onExit={handleExitGame}
          onComplete={handleComplete}
          onModuleComplete={completeModule}
          onModuleCompleted={handleModuleCompleted}
        />
        {elapsedTime !== null && (
          <ModuleComplete
            elapsedMs={elapsedTime}
            moduleTitle={moduleTitle}
            isPractice={!!practiceQuestions}
            onClose={() => {
              setElapsedTime(null);
              handleExitGame();
            }}
          />
        )}
      </>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col px-4 md:px-8 lg:px-16">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-purple-600/20">
              <Terminal size={28} className="text-purple-400" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50 sm:text-4xl">
              <BlurReveal as="span">first</BlurReveal>
              <BlurReveal as="span" delay={0.15} className="text-purple-400">Kodes</BlurReveal>
            </h1>
          </div>
          <p className="text-base text-zinc-600 sm:text-lg">
            <BlurReveal as="span" delay={0.3}>Sua jornada na programação começa aqui</BlurReveal>
          </p>
        </div>

        <div>
          <Carousel
            modules={modules}
            onStartModule={handleStartModule}
            onPracticeModule={handlePracticeModule}
            onAdminUnlock={adminCompleteAll}
          />
        </div>

        <StreakCelebration
          show={showStreakCelebration}
          onClose={() => setShowStreakCelebration(false)}
        />
      </div>

      <footer>
        <Footer />
      </footer>

      <div className="fixed top-4 right-4 z-50 sm:top-6 sm:right-8">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-2.5 py-1 backdrop-blur-sm sm:px-3 sm:py-1.5">
            <Flame size={16} className="text-orange-500 sm:size-[18px]" />
            <span className="text-xs font-semibold text-zinc-50 sm:text-sm">{progress.streak}</span>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="flex size-8 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-400 backdrop-blur-sm transition-colors hover:text-zinc-50 sm:size-10"
            aria-label="Configurações"
          >
            <Settings size={16} className="sm:size-5" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-80 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-600/20">
                <Settings size={20} className="text-purple-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-50">Configurações</h2>
            </div>
            <div className="mb-4 border-t border-zinc-800" />
            <p className="mb-4 text-sm text-zinc-400">
              Esta ação irá apagar todo o seu progresso, incluindo fases concluídas e streak.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetProgress();
                  setShowStreakCelebration(false);
                  setShowSettings(false);
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500"
              >
                Resetar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
