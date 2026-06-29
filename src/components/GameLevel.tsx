'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Loader2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import BossPhase from '@/components/BossPhase';
import Mascot from '@/components/Mascot';
import TermTooltip from '@/components/TermTooltip';
import { TERMS } from '@/data/termsDictionary';
import { cn } from '@/lib/utils';
import { getModuleNumber } from '@/hooks/useProgress';
import type { LevelData } from '@/data/moduleOneLevels';
import type { PracticeQuestion } from '@/app/api/generate-practice/route';

const MODULE_TITLES: Record<string, string> = {
  fundamentos: 'Fundamentos',
  decisoes: 'Decisões',
  repeticoes: 'Repetições',
  funcoes: 'Funções e Listas',
};

export const BOSS_CHALLENGES: Record<string, { question: string; answer: string }> = {
  fundamentos: {
    question:
      'Sua missão final: Escreva um comando em Python que exiba a frase "Eu venci!" na tela.',
    answer: 'print("Eu venci!")',
  },
  decisoes: {
    question:
      'Sua missão final: Escreva uma estrutura condicional que verifique se a variável "temperatura" é maior que 30.',
    answer: 'if temperatura > 30:',
  },
  repeticoes: {
    question:
      'Sua missão final: Escreva um loop while que repita enquanto "contador" for menor que 5.',
    answer: 'while contador < 5:',
  },
  funcoes: {
    question:
      'Sua missão final: Escreva a definição de uma função chamada "dobro" que recebe um parâmetro "x".',
    answer: 'def dobro(x):',
  },
};

interface GameLevelProps {
  levels: LevelData[];
  moduleId: string;
  savedProgress?: number;
  practiceQuestions?: PracticeQuestion[] | null;
  onExit: () => void;
  onComplete: (moduleId: string, phasesCompleted: number) => void;
  onModuleComplete?: (moduleId: number) => void;
  onModuleCompleted?: () => void;
}

export default function GameLevel({
  levels: propLevels,
  moduleId,
  savedProgress = 0,
  practiceQuestions,
  onExit,
  onComplete,
  onModuleComplete,
  onModuleCompleted,
}: GameLevelProps) {
  const levels = useMemo(() => {
    if (!practiceQuestions) return propLevels;
    return practiceQuestions.map((q, i) => {
      const snippet = q.codeSnippet ?? '';
      const parts = snippet.split('[ _____ ]');
      const data: LevelData = {
        id: `practice-${i}`,
        type: q.type,
        clippyText: q.context,
        codePrefix: parts[0] ?? '',
        codeSuffix: snippet.includes('[ _____ ]') ? (parts[1] ?? '') : '',
        options: q.options,
        answer: q.correctAnswer,
      };
      return data;
    });
  }, [practiceQuestions, propLevels]);

  const [currentLevelIndex, setCurrentLevelIndex] = useState(
    practiceQuestions ? 0 : Math.min(savedProgress, levels.length),
  );
  const [moduleLives, setModuleLives] = useState(3);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const [mascotMessage, setMascotMessage] = useState<string | null>(null);
  const [mascotStatus, setMascotStatus] = useState<'idle' | 'typing' | 'error' | 'success'>('idle');
  const errorTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [isMounted, setIsMounted] = useState(false);
  const isBossPhase = !practiceQuestions && currentLevelIndex >= levels.length;
  const bossChallenge = practiceQuestions ? undefined : BOSS_CHALLENGES[moduleId];
  const level = levels[currentLevelIndex];
  const totalPhases = levels.length + (bossChallenge ? 1 : 0);
  const displayPhase = currentLevelIndex + 1;
  const progressPercent = ((currentLevelIndex + 1) / totalPhases) * 100;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isBossPhase) return;
    setSelectedWord(null);
    setFeedback('idle');
    setMascotMessage(null);
    setMascotStatus('idle');
    clearTimeout(errorTimerRef.current);
  }, [currentLevelIndex, isBossPhase]);

  const hasCalledPracticeRef = useRef(false);

  useLayoutEffect(() => {
    if (practiceQuestions && currentLevelIndex >= levels.length && !hasCalledPracticeRef.current) {
      hasCalledPracticeRef.current = true;
      onModuleCompleted?.();
    }
  }, [practiceQuestions, currentLevelIndex, levels.length, onModuleCompleted]);

  if (!isMounted) {
    return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col bg-black px-6">
        <header className="flex items-center gap-2 pt-6 pb-4 md:gap-4">
          <div className="flex-1">
            <div className="mb-1.5">
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-800" />
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-0 rounded-full bg-purple-500" />
            </div>
          </div>
          <div className="flex size-8 items-center justify-center rounded-full bg-zinc-800" />
        </header>
        <div className="mb-6 flex items-start gap-3">
          <div className="size-12 shrink-0 animate-pulse rounded-xl bg-zinc-800" />
          <div className="h-16 flex-1 animate-pulse rounded-2xl rounded-tl-sm bg-zinc-800" />
        </div>
        <div className="mb-8 h-24 animate-pulse rounded-xl bg-zinc-900" />
        <div className="mb-auto flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 animate-pulse rounded-lg bg-zinc-800" />
          ))}
        </div>
        <div className="pb-8">
          <div className="h-14 w-full animate-pulse rounded-xl bg-zinc-800" />
        </div>
      </div>
    );
  }

  const handleChipClick = (word: string) => {
    setSelectedWord(word);
    setFeedback('idle');
    setMascotStatus('typing');
    if (feedback === 'error') {
      setMascotMessage(null);
    }
  };

  const handleVerify = () => {
    if (selectedWord !== level.answer) {
      const nextLives = moduleLives - 1;
      setModuleLives(nextLives);
      setFeedback('error');
      setMascotMessage('Oops!');
      setMascotStatus('error');
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => {
        setMascotStatus('idle');
      }, 1500);
      if (nextLives <= 0) {
        setTimeout(() => {
          onExit();
        }, 2000);
      }
      return;
    }

    setFeedback('success');
    setMascotMessage(null);
    setMascotStatus('success');
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#a855f7', '#c084fc', '#ffffff', '#1e1b4b'],
    });
    const nextIndex = currentLevelIndex + 1;

    if (!practiceQuestions) {
      onComplete(moduleId, Math.min(nextIndex, levels.length));
    }
    setTimeout(() => {
      setCurrentLevelIndex(nextIndex);
    }, 1500);
  };

  const handleExit = () => {
    if (!practiceQuestions) {
      onComplete(moduleId, currentLevelIndex);
    }
    onExit();
  };

  if (practiceQuestions && currentLevelIndex >= levels.length) {
    return null;
  }

  if (isBossPhase && bossChallenge) {
    return (
      <BossPhase
        moduleTitle={MODULE_TITLES[moduleId] ?? moduleId}
        question={bossChallenge.question}
        onComplete={() => {
          onComplete(moduleId, totalPhases);
          onModuleComplete?.(getModuleNumber(moduleId));
          onModuleCompleted?.();
        }}
        onExit={() => {
          onExit();
        }}
      />
    );
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col overflow-x-hidden bg-black px-6">
      <header className="flex items-center gap-2 pt-6 pb-4 md:gap-4">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Fase {displayPhase} de {totalPhases}
            </span>
            <div className="flex items-center gap-1">
              <AnimatePresence mode="wait">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={i > moduleLives ? { scale: 1, opacity: 1 } : false}
                    animate={
                      i > moduleLives
                        ? { scale: 0, opacity: 0 }
                        : { scale: 1, opacity: 1 }
                    }
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <Heart
                      size={16}
                      className={
                        i <= moduleLives
                          ? 'text-red-400'
                          : 'text-zinc-700'
                      }
                      fill={i <= moduleLives ? 'currentColor' : 'none'}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-purple-500"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
        <button
          onClick={handleExit}
          className="flex size-9 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-50"
          aria-label="Sair"
        >
          <X size={18} />
        </button>
      </header>

      <motion.div
        key={level.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex items-start gap-3"
      >
        <Mascot status={mascotStatus} />
        <div className="relative rounded-2xl rounded-tl-sm bg-zinc-900 px-5 py-4 shadow-lg">
          <div className="absolute -left-1.5 top-4 h-3 w-3 rotate-45 bg-zinc-900" />
          <p className="text-sm leading-relaxed text-zinc-300">
            {mascotMessage ?? level.clippyText}
          </p>
        </div>
      </motion.div>

      {level.lessonText && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mb-6 text-sm leading-relaxed text-zinc-400"
        >
          {level.lessonText.split(/(\[[^\]]+\])/).map((part, i) => {
            const match = part.match(/^\[([^\]]+)\]$/);
            if (match) {
              const term = match[1];
              return (
                <TermTooltip
                  key={i}
                  term={term}
                  definition={TERMS[term] ?? term}
                />
              );
            }
            return part;
          })}
        </motion.p>
      )}

      {level.type === 'output' ? (
        <motion.div
          key={`code-${level.id}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 font-mono text-sm leading-relaxed"
        >
          <code className="whitespace-pre-wrap text-zinc-200">{level.codePrefix}</code>
        </motion.div>
      ) : (
        <motion.div
          key={`code-${level.id}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 font-mono text-base leading-relaxed"
        >
          <code className="whitespace-pre-wrap text-zinc-200">
            {level.codePrefix}<AnimatePresence mode="wait">
              {selectedWord ? (
                <motion.span
                  key={selectedWord}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-block rounded-md bg-purple-600/20 px-2 py-0.5 font-semibold text-purple-400"
                >
                  {selectedWord}
                </motion.span>
              ) : (
                <motion.span
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-block rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-zinc-500"
                >
                  _____
                </motion.span>
              )}
            </AnimatePresence>{level.codeSuffix}
          </code>
        </motion.div>
      )}

      {level.type === 'output' && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Saída:
        </div>
      )}

      <div className="mb-auto flex flex-wrap gap-2">
        {level.options.map((word, idx) => (
          <motion.button
            key={word}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.08 }}
            onClick={() => handleChipClick(word)}
            disabled={selectedWord === word || feedback === 'success' || moduleLives <= 0}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all min-h-[44px]',
              selectedWord === word
                ? 'bg-purple-600 text-white animate-ping-once'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-purple-400',
            )}
          >
            {word}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback !== 'idle' && (
          <motion.div
            key={feedback}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'mb-4 rounded-lg px-4 py-3 text-sm font-medium',
              feedback === 'success'
                ? 'bg-emerald-900/50 text-emerald-400'
                : 'bg-red-900/50 text-red-400',
            )}
          >
            {feedback === 'success'
              ? 'Correto!'
              : moduleLives > 0
                ? 'Oops! Tente novamente.'
                : 'Sem vidas! Voltando...'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pb-8">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleVerify}
          disabled={!selectedWord || feedback === 'success' || moduleLives <= 0}
          className={cn(
            'w-full rounded-xl py-3.5 text-base font-bold transition-all',
            !selectedWord || feedback === 'success' || moduleLives <= 0
              ? 'cursor-not-allowed bg-zinc-800 text-zinc-600'
              : 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 active:scale-[0.98]',
          )}
        >
          Verificar
        </motion.button>
      </div>
    </div>
  );
}
