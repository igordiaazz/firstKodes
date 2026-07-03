'use client';

import { motion } from 'framer-motion';
import { Crown, Heart, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { MODULE_BASE_POINTS } from '@/hooks/useProgress';
import type { TypingChallenge } from '@/app/api/generate-module5/route';

interface Module5GameProps {
  onComplete: (phasesCompleted: number) => void;
  onModuleComplete: () => void;
  onModuleCompleted: () => void;
  onExit: () => void;
  onAddKodeScore?: (points: number) => void;
}

export default function Module5Game({
  onComplete,
  onModuleComplete,
  onModuleCompleted,
  onExit,
  onAddKodeScore,
}: Module5GameProps) {
  const [challenges, setChallenges] = useState<TypingChallenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/generate-module5', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Erro ao gerar desafios.' }));
          setError(err.error ?? 'Erro ao gerar desafios.');
          return;
        }
        const data = await res.json();
        setChallenges(data.challenges);
      } catch {
        setError('Erro de conexão ao gerar desafios.');
      } finally {
        setFetching(false);
      }
    }
    load();
  }, []);

  const challenge = challenges[currentIndex];
  const total = challenges.length;

  const handleSubmit = async () => {
    if (lives === 0 || isLoading || isCorrect || !challenge) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/check-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge: challenge.question, code, lives }),
      });

      if (!res.ok) {
        setFeedback('Erro de conexão com o tutor.');
        return;
      }

      const data = await res.json();

      if (data.isCorrect) {
        setIsCorrect(true);
        setFeedback(data.feedback);
        const pts = MODULE_BASE_POINTS.modulo5 * 2;
        setEarnedPoints(pts);
        setTimeout(() => setEarnedPoints(null), 1000);
        onAddKodeScore?.(pts);
        onComplete(currentIndex + 1);

        if (currentIndex + 1 >= total) {
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onModuleComplete();
            onModuleCompleted();
          }
          return;
        }

        setTimeout(() => {
          setCurrentIndex((i) => i + 1);
          setCode('');
          setIsCorrect(null);
          setFeedback(null);
        }, 2000);
      } else {
        const nextLives = lives - 1;
        setLives(nextLives);
        setFeedback(data.feedback);

        if (nextLives <= 0) {
          setTimeout(() => onExit(), 3000);
        }
      }
    } catch {
      setFeedback('Erro de conexão com o tutor.');
    } finally {
      setIsLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Loader2 size={48} className="mx-auto mb-6 animate-spin text-purple-400" />
          <h2 className="mb-2 text-xl font-bold text-zinc-50">Gerando desafios...</h2>
          <p className="text-zinc-400">Criando 5 fases de digitação personalizadas</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h2 className="mb-2 text-xl font-bold text-red-400">Erro</h2>
          <p className="mb-8 text-zinc-400">{error}</p>
          <button
            onClick={onExit}
            className="rounded-xl bg-purple-600 px-8 py-3 text-base font-bold text-white transition-all hover:bg-purple-500"
          >
            Voltar
          </button>
        </motion.div>
      </div>
    );
  }

  if (!challenge) return null;

  const progressPercent = ((currentIndex + 1) / total) * 100;
  const displayPhase = currentIndex + 1;
  const isLocked = lives === 0 || isCorrect === true;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col bg-black px-6">
      <header className="flex items-center gap-2 pt-6 pb-4 md:gap-4">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500">
            <span>Fase {displayPhase} de {total}</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <Heart
                  key={i}
                  size={16}
                  className={i <= lives ? 'text-red-400' : 'text-zinc-700'}
                  fill={i <= lives ? 'currentColor' : 'none'}
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
          onClick={onExit}
          className="flex size-9 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-50"
          aria-label="Sair"
        >
          <X size={18} />
        </button>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-600/20">
          <Crown size={18} className="text-amber-400" />
        </div>
        <span className="text-sm font-medium text-zinc-400">Desafio {displayPhase}</span>
      </div>

      <motion.div
        key={challenge.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
      >
        <p className="mb-2 text-sm font-medium text-zinc-400">{challenge.clippyText}</p>
        <p className="text-sm leading-relaxed text-zinc-200">{challenge.question}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6 flex-1"
      >
        <div className="mb-1.5 flex items-center gap-2 px-1">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-red-500/60" />
            <div className="size-2.5 rounded-full bg-yellow-500/60" />
            <div className="size-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-xs text-zinc-600">desafio.py</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const ta = e.currentTarget;
              const start = ta.selectionStart;
              const end = ta.selectionEnd;
              setCode(code.substring(0, start) + '  ' + code.substring(end));
              requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = start + 2;
              });
            }
          }}
          disabled={isLocked}
          placeholder="Digite seu código aqui..."
          rows={6}
          className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 font-mono text-base text-zinc-100 placeholder-zinc-600 caret-purple-400 transition-colors focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50 scrollbar-thin"
        />
      </motion.div>

      {earnedPoints !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: -10, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="mb-2 text-center text-sm font-bold text-emerald-400"
        >
          +{earnedPoints}
        </motion.div>
      )}

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mb-4 rounded-xl border-2 bg-zinc-900/80 px-5 py-4',
            isCorrect
              ? 'border-emerald-500'
              : lives === 2
                ? 'border-yellow-500'
                : lives === 1
                  ? 'border-orange-500'
                  : 'border-red-500',
          )}
        >
          <p className="text-sm leading-relaxed text-zinc-200">{feedback}</p>
        </motion.div>
      )}

      <div className="pb-8">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleSubmit}
          disabled={!code.trim() || isLocked || isLoading}
          className={cn(
            'w-full rounded-xl py-3.5 text-base font-bold transition-all',
            !code.trim() || isLocked || isLoading
              ? 'cursor-not-allowed bg-zinc-800 text-zinc-600'
              : 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 active:scale-[0.98]',
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Analisando...
            </span>
          ) : (
            'Testar Código'
          )}
        </motion.button>
      </div>
    </div>
  );
}
