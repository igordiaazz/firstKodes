'use client';

import { motion } from 'framer-motion';
import { Braces, Code, GitBranch, Loader2, Repeat, Settings, Terminal, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Carousel from '@/components/Carousel';
import Footer from '@/components/Footer';
import GameLevel, { BOSS_CHALLENGES } from '@/components/GameLevel';
import StreakCelebration from '@/components/StreakCelebration';
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
];

const LEVELS_MAP: Record<string, LevelData[]> = {
  fundamentos: moduleOneLevels,
  decisoes: moduleTwoLevels,
  repeticoes: moduleThreeLevels,
  funcoes: moduleFourLevels,
};

const MODULE_NAMES: Record<string, string> = {
  fundamentos: 'Fundamentos',
  decisoes: 'Decisões',
  repeticoes: 'Repetições',
  funcoes: 'Funções e Listas',
};

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[] | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const prevStreakRef = useRef<number | null>(null);
  const {
    progress,
    hydrated,
    completePhase,
    completeModule,
    resetProgress,
  } = useProgress();

  useEffect(() => {
    if (!hydrated) return;
    if (prevStreakRef.current === null) {
      prevStreakRef.current = progress.streak;
      return;
    }
    if (prevStreakRef.current === 0 && progress.streak === 1) {
      setShowStreakCelebration(true);
    }
    prevStreakRef.current = progress.streak;
  }, [progress.streak, hydrated]);

  const modules: ModuleData[] = useMemo(
    () =>
      MODULES_META.map((meta) => {
        const num = getModuleNumber(meta.id);
        const levels = LEVELS_MAP[meta.id] ?? [];
        return {
          ...meta,
          totalPhases: levels.length + (BOSS_CHALLENGES[meta.id] ? 1 : 0),
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
  }, []);

  const handlePracticeModule = useCallback(async (moduleId: string) => {
    setActiveModuleId(moduleId);
    setPracticeQuestions(null);
    setPracticeError(null);
    setPracticeLoading(true);
    setView('game');

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
  }, []);

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

    return (
      <GameLevel
        levels={levels}
        moduleId={activeModuleId}
        savedProgress={saved}
        practiceQuestions={practiceQuestions}
        onExit={handleExitGame}
        onComplete={handleComplete}
        onModuleComplete={completeModule}
      />
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col overflow-x-hidden px-4 md:px-8 lg:px-16">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-purple-600/20">
              <Terminal size={28} className="text-purple-400" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50 sm:text-4xl">
              first<span className="text-purple-400">Kodes</span>
            </h1>
          </div>
          <p className="text-base text-zinc-400 sm:text-lg">
            Sua jornada na programação começa aqui
          </p>
        </div>

        <Carousel
          modules={modules}
          streak={progress.streak}
          onStartModule={handleStartModule}
          onPracticeModule={handlePracticeModule}
        />

        <StreakCelebration
          show={showStreakCelebration}
          onClose={() => setShowStreakCelebration(false)}
        />
      </div>

      <Footer />

      {/* Settings gear */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-6 right-6 z-50 flex size-10 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-400 backdrop-blur-sm transition-colors hover:text-zinc-50"
        aria-label="Configurações"
      >
        <Settings size={20} />
      </button>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-80 rounded-xl bg-zinc-900 p-6 shadow-xl"
          >
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:text-zinc-50"
            >
              <X size={16} />
            </button>
            <h2 className="mb-6 text-lg font-bold text-zinc-50">Configurações</h2>
            <button
              onClick={() => {
                resetProgress();
                setShowStreakCelebration(false);
                setShowSettings(false);
              }}
              className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500"
            >
              Resetar Progresso
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
}
