'use client';

import { motion } from 'framer-motion';
import { Crown, Heart, Loader2, X } from 'lucide-react';
import { useState } from 'react';

interface BossPhaseProps {
  moduleTitle: string;
  question: string;
  onComplete: () => void;
  onExit: () => void;
}

export default function BossPhase({
  moduleTitle,
  question,
  onComplete,
  onExit,
}: BossPhaseProps) {
  const [code, setCode] = useState('');
  const [lives, setLives] = useState(3);
  const [clippyFeedback, setClippyFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = async () => {
    if (lives === 0 || isLoading || isCorrect) return;

    setIsLoading(true);
    setClippyFeedback(null);

    try {
      const res = await fetch('/api/check-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge: question, code, lives }),
      });

      if (!res.ok) {
        setClippyFeedback('Erro de conexão com o tutor.');
        return;
      }

      const data = await res.json();

      if (data.isCorrect) {
        setIsCorrect(true);
        setClippyFeedback(data.feedback);
        setTimeout(() => onComplete(), 2000);
      } else {
        setLives((prev) => prev - 1);
        setClippyFeedback(data.feedback);
      }
    } catch {
      setClippyFeedback('Erro de conexão com o tutor.');
    } finally {
      setIsLoading(false);
    }
  };

  const feedbackBorderColor =
    isCorrect
      ? 'border-emerald-500'
      : lives === 3
        ? ''
        : lives === 2
          ? 'border-yellow-500'
          : lives === 1
            ? 'border-orange-500'
            : 'border-red-500';

  const isLocked = lives === 0 || isCorrect === true;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col overflow-x-hidden bg-zinc-950 px-6">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-2 pt-6 pb-4 md:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-600/20">
            <Crown size={22} className="text-amber-400" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-zinc-50 sm:text-lg">
              Desafio do Chefe
            </h1>
            <p className="truncate text-xs text-zinc-500">{moduleTitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {[1, 2, 3].map((i) => (
            <Heart
              key={i}
              size={i <= lives ? 18 : 16}
              className={
                i <= lives ? 'text-red-400' : 'text-zinc-700'
              }
              fill={i <= lives ? 'currentColor' : 'none'}
            />
          ))}
        </div>
        <button
          onClick={onExit}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-50"
          aria-label="Sair"
        >
          <X size={18} />
        </button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
      >
        <p className="text-sm leading-relaxed text-zinc-300">{question}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 flex-1"
      >
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isLocked}
          placeholder="Digite seu código aqui..."
          rows={6}
          className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 p-5 font-mono text-base text-zinc-100 placeholder-zinc-600 caret-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </motion.div>

      {clippyFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 rounded-xl border-2 bg-zinc-900/80 px-5 py-4 ${feedbackBorderColor}`}
        >
          <p className="text-sm leading-relaxed text-zinc-200">{clippyFeedback}</p>
        </motion.div>
      )}

      <div className="pb-8">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          onClick={handleSubmit}
          disabled={!code.trim() || isLocked || isLoading}
          className={`w-full rounded-xl py-3.5 text-base font-bold transition-all ${
            !code.trim() || isLocked || isLoading
              ? 'cursor-not-allowed bg-zinc-800 text-zinc-600'
              : 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 active:scale-[0.98]'
          }`}
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
