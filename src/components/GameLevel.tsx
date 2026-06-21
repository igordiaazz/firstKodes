'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Heart, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import BossPhase from '@/components/BossPhase';
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
}

export default function GameLevel({
  levels: propLevels,
  moduleId,
  savedProgress = 0,
  practiceQuestions,
  onExit,
  onComplete,
  onModuleComplete,
}: GameLevelProps) {
  const levels = useMemo(() => {
    if (!practiceQuestions) return propLevels;
    return practiceQuestions.map((q, i) => {
      const snippet = q.codeSnippet ?? '';
      const parts = snippet.split('[ _____ ]');
      return {
        id: `practice-${i}`,
        clippyText: q.context,
        codePrefix: parts[0] ?? '',
        codeSuffix: parts[1] ?? '',
        options: q.options,
        answer: q.correctAnswer,
      };
    });
  }, [practiceQuestions, propLevels]);

  const [currentLevelIndex, setCurrentLevelIndex] = useState(
    practiceQuestions ? 0 : Math.min(savedProgress, levels.length),
  );
  const [moduleLives, setModuleLives] = useState(3);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const [mascotMessage, setMascotMessage] = useState<string | null>(null);
  const isBossPhase = !practiceQuestions && currentLevelIndex >= levels.length;
  const bossChallenge = practiceQuestions ? undefined : BOSS_CHALLENGES[moduleId];
  const level = levels[currentLevelIndex];
  const totalPhases = levels.length + (bossChallenge ? 1 : 0);
  const displayPhase = currentLevelIndex + 1;
  const progressPercent = ((currentLevelIndex + 1) / totalPhases) * 100;

  useEffect(() => {
    if (isBossPhase) return;
    setSelectedWord(null);
    setFeedback('idle');
    setMascotMessage(null);
  }, [currentLevelIndex, isBossPhase]);

  const handleChipClick = (word: string) => {
    setSelectedWord(word);
    setFeedback('idle');
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
      if (nextLives <= 0) {
        setTimeout(() => {
          onExit();
        }, 2000);
      }
      return;
    }

    setFeedback('success');
    setMascotMessage(null);
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
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-zinc-950 px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-purple-600/20">
            <Bot size={40} className="text-purple-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-zinc-50">
            Prática Concluída!
          </h2>
          <p className="mb-8 text-zinc-400">
            Você completou as 5 fases extras.
          </p>
          <button
            onClick={onExit}
            className="rounded-xl bg-purple-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-500 active:scale-[0.98]"
          >
            Voltar ao Início
          </button>
        </motion.div>
      </div>
    );
  }

  if (isBossPhase && bossChallenge) {
    return (
      <BossPhase
        moduleTitle={MODULE_TITLES[moduleId] ?? moduleId}
        question={bossChallenge.question}
        onComplete={() => {
          onComplete(moduleId, totalPhases);
          onModuleComplete?.(getModuleNumber(moduleId));
          setTimeout(() => onExit(), 1500);
        }}
        onExit={() => {
          onComplete(moduleId, totalPhases);
          onExit();
        }}
      />
    );
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col overflow-x-hidden bg-zinc-950 px-6">
      {/* Header */}
      <header className="flex items-center gap-2 pt-6 pb-4 md:gap-4">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Fase {displayPhase} de {totalPhases}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <Heart
                  key={i}
                  size={16}
                  className={
                    i <= moduleLives
                      ? 'text-red-400'
                      : 'text-zinc-700'
                  }
                  fill={i <= moduleLives ? 'currentColor' : 'none'}
                />
              ))}
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
          className="flex size-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-50"
          aria-label="Sair"
        >
          <X size={18} />
        </button>
      </header>

      {/* Tutor Area */}
      <motion.div
        key={level.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex items-start gap-3"
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-600/20">
          <Bot size={28} className="text-purple-400" />
        </div>
        <div className="relative rounded-2xl rounded-tl-sm bg-zinc-900 px-5 py-4 shadow-lg">
          <div className="absolute -left-1.5 top-4 h-3 w-3 rotate-45 bg-zinc-900" />
          <p className="text-sm leading-relaxed text-zinc-300">
            {mascotMessage ?? level.clippyText}
          </p>
        </div>
      </motion.div>

      {/* Code Zone */}
      <motion.div
        key={`code-${level.id}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-8 overflow-x-auto rounded-xl bg-zinc-900 p-5 font-mono text-base leading-relaxed"
      >
        <code className="whitespace-pre-wrap">
          {level.codePrefix}<AnimatePresence mode="wait">
            {selectedWord ? (
              <motion.span
                key={selectedWord}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="rounded-md bg-purple-600/20 px-2.5 py-0.5 font-semibold text-purple-400"
              >
                {selectedWord}
              </motion.span>
            ) : (
              <motion.span
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-md bg-zinc-800 px-2.5 py-0.5 text-zinc-500"
              >
                Espaço Vazio
              </motion.span>
            )}
          </AnimatePresence>{level.codeSuffix}
        </code>
      </motion.div>

      {/* Chip Bank */}
      <div className="mb-auto flex flex-wrap gap-2">
        {level.options.map((word, idx) => (
          <motion.button
            key={word}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.08 }}
            onClick={() => handleChipClick(word)}
            disabled={selectedWord === word || feedback === 'success' || moduleLives <= 0}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              selectedWord === word
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-purple-400'
            } disabled:opacity-100`}
          >
            {word}
          </motion.button>
        ))}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback !== 'idle' && (
          <motion.div
            key={feedback}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
              feedback === 'success'
                ? 'bg-emerald-900/50 text-emerald-400'
                : 'bg-red-900/50 text-red-400'
            }`}
          >
            {feedback === 'success'
              ? 'Correto!'
              : moduleLives > 0
                ? 'Oops! Tente novamente.'
                : 'Sem vidas! Voltando...'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verify Button */}
      <div className="pb-8">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleVerify}
          disabled={!selectedWord || feedback === 'success' || moduleLives <= 0}
          className={`w-full rounded-xl py-3.5 text-base font-bold transition-all ${
            !selectedWord || feedback === 'success' || moduleLives <= 0
              ? 'cursor-not-allowed bg-zinc-800 text-zinc-600'
              : 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 active:scale-[0.98]'
          }`}
        >
          Verificar
        </motion.button>
      </div>
    </div>
  );
}
