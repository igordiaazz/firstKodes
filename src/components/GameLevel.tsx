'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Heart, Loader2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import BossPhase from '@/components/BossPhase';
import Mascot from '@/components/Mascot';
import TermTooltip from '@/components/TermTooltip';
import { TERMS } from '@/data/termsDictionary';
import { TERMS_EN } from '@/data/termsDictionary.en';
import { BOSS_CHALLENGES_EN } from '@/components/GameLevelEn';
import { cn } from '@/lib/utils';
import { getModuleNumber, MODULE_BASE_POINTS } from '@/hooks/useProgress';
import type { LevelData } from '@/data/moduleOneLevels';
import type { PracticeQuestion } from '@/app/api/generate-practice/route';

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
  onAddKodeScore?: (points: number) => void;
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
  onAddKodeScore,
}: GameLevelProps) {
  const locale = useLocale();
  const t = useTranslations('game');
  const tm = useTranslations('modules');
  const isEn = locale === 'en';
  const terms = isEn ? TERMS_EN : TERMS;
  const bossChallenges = isEn ? BOSS_CHALLENGES_EN : BOSS_CHALLENGES;

  const MODULE_TITLES: Record<string, string> = {
    fundamentos: tm('fundamentos.title'),
    decisoes: tm('decisoes.title'),
    repeticoes: tm('repeticoes.title'),
    funcoes: tm('funcoes.title'),
  };

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
        options: [...q.options],
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
  const isBossPhase = !practiceQuestions && currentLevelIndex >= levels.length;
  const bossChallenge = practiceQuestions ? undefined : bossChallenges[moduleId];
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
    setEarnedPoints(null);
    clearTimeout(errorTimerRef.current);
    containerRef.current?.focus();
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
      <div className="mb-4 flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 animate-pulse rounded-lg bg-zinc-800" />
          ))}
        </div>
      <div className="pb-4 sm:pb-8">
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
    containerRef.current?.focus();
  };

  const handleVerify = () => {
    if (selectedWord !== level.answer) {
      const nextLives = moduleLives - 1;
      setModuleLives(nextLives);
      setFeedback('error');
      setMascotStatus('error');
      clearTimeout(errorTimerRef.current);
      if (nextLives <= 0) {
        setMascotMessage(t('noLivesMascot'));
      } else {
        setMascotMessage(t('oopsMascot'));
        errorTimerRef.current = setTimeout(() => {
          setMascotStatus('idle');
        }, 1500);
      }
      return;
    }

    const pts = MODULE_BASE_POINTS[moduleId] ?? 15;
    setFeedback('success');
    setMascotMessage(null);
    setMascotStatus('success');
    setEarnedPoints(pts);
    onAddKodeScore?.(pts);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#a855f7', '#c084fc', '#ffffff', '#1e1b4b'],
    });

    if (!practiceQuestions) {
      onComplete(moduleId, Math.min(currentLevelIndex + 1, levels.length));
    }
  };

  const handleNextPhase = () => {
    const nextIndex = currentLevelIndex + 1;
    setCurrentLevelIndex(nextIndex);
    setSelectedWord(null);
    setFeedback('idle');
    setMascotMessage(null);
    setMascotStatus('idle');
    setEarnedPoints(null);
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
        basePoints={MODULE_BASE_POINTS[moduleId] ?? 15}
        onAddKodeScore={onAddKodeScore}
        locale={locale}
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
    <div
      ref={containerRef}
      className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-x-hidden bg-black px-6 outline-none"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (moduleLives <= 0) return;
          if (feedback === 'success') {
            handleNextPhase();
          } else if (selectedWord) {
            handleVerify();
          }
        }
      }}
      tabIndex={-1}
    >
      <header className="flex items-center gap-2 pt-6 pb-4 md:gap-4">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500">
            <span>
              {t('phaseLabel', { current: displayPhase, total: totalPhases })}
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
          aria-label={t('exit')}
        >
          <X size={18} />
        </button>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={level.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6 flex items-start gap-3">
            <Mascot status={mascotStatus} />
            <div className="relative rounded-2xl rounded-tl-sm bg-zinc-900 px-5 py-4 shadow-lg">
              <div className="absolute -left-1.5 top-4 h-3 w-3 rotate-45 bg-zinc-900" />
              <p className="text-sm leading-relaxed text-zinc-300">
                {mascotMessage ?? level.clippyText}
              </p>
            </div>
          </div>

          {level.lessonText && (
            <p className="mb-6 text-sm leading-relaxed text-zinc-400">
              {level.lessonText.split(/(\[[^\]]+\])/).map((part, i) => {
                const match = part.match(/^\[([^\]]+)\]$/);
                if (match) {
                  const term = match[1];
                  return (
                    <TermTooltip
                      key={i}
                      term={term}
                      definition={terms[term] ?? term}
                    />
                  );
                }
                return part;
              })}
            </p>
          )}

          {level.type === 'output' ? (
            <div className="mb-6 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 font-mono text-sm leading-relaxed">
              <code className="whitespace-pre-wrap text-zinc-200">{level.codePrefix}</code>
            </div>
          ) : (
            <div className="mb-8 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 font-mono text-base leading-relaxed">
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
            </div>
          )}

          {level.type === 'output' && (
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {t('outputLabel')}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mb-6 sm:mb-16">
            {level.options.map((word, idx) => (
              <motion.button
                key={`${level.id}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.08 }}
                onClick={() => handleChipClick(word)}
                disabled={selectedWord === word || feedback === 'success' || moduleLives <= 0}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
                  selectedWord === word
                    ? 'bg-purple-600 text-white animate-ping-once'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-purple-400',
                )}
              >
                {word}
              </motion.button>
            ))}
          </div>

          <div className="sm:mt-auto">
            <AnimatePresence mode="wait">
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
                  {feedback === 'success' ? (
                    <span>{t('correct')} <span className="font-bold text-emerald-300">+{earnedPoints}</span></span>
                  ) : moduleLives > 0 ? (
                    t('wrong')
                  ) : (
                    t('noLives')
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {moduleLives > 0 ? (
              <div className="pb-8">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={feedback === 'success' ? handleNextPhase : handleVerify}
                  disabled={!selectedWord && feedback !== 'success'}
                  className={cn(
                    'w-full rounded-xl py-3.5 text-base font-bold transition-all',
                    !selectedWord && feedback !== 'success'
                      ? 'cursor-not-allowed bg-zinc-800 text-zinc-600'
                      : feedback === 'success'
                      ? 'bg-purple-600/20 text-purple-300 shadow-lg hover:bg-purple-600/30 active:scale-[0.98]'
                      : 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 active:scale-[0.98]',
                  )}
                >
                  {feedback === 'success' ? (
                    <span className="flex items-center justify-center gap-2">
                      {t('nextPhase')}
                      <ArrowRight size={18} />
                    </span>
                  ) : (
                    t('verify')
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="pb-8">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleExit}
                  className="w-full rounded-xl bg-purple-600 py-3.5 text-base font-bold text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 active:scale-[0.98]"
                >
                  {t('backToMenu')}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
