'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Mascot from './Mascot';
import TermTooltip from './TermTooltip';

export default function PhaseContainer() {
  const [mascotStatus, setMascotStatus] = useState<
    'idle' | 'typing' | 'error' | 'success'
  >('idle');

  const simulateTyping = useCallback(() => {
    setMascotStatus('typing');
    setTimeout(() => setMascotStatus('idle'), 2000);
  }, []);

  const simulateError = useCallback(() => {
    setMascotStatus('error');
    setTimeout(() => setMascotStatus('idle'), 1500);
  }, []);

  const completePhase = useCallback(() => {
    setMascotStatus('success');
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#a855f7', '#c084fc', '#ffffff', '#1e1b4b'],
    });
    setTimeout(() => setMascotStatus('idle'), 2500);
  }, []);

  return (
    <div className="mx-auto flex min-h-[600px] w-full max-w-lg flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl backdrop-blur-sm"
      >
        <div className="mb-6 flex items-start gap-4">
          <Mascot status={mascotStatus} />
          <div className="relative flex-1 rounded-2xl rounded-tl-sm bg-zinc-900 px-5 py-4 shadow-lg">
            <div className="absolute -left-1.5 top-4 h-3 w-3 rotate-45 bg-zinc-900" />
            <p className="text-sm leading-relaxed text-zinc-300">
              Uma{' '}
              <TermTooltip
                term="variável"
                definition="Espaço na memória que guarda um valor que pode mudar."
              />{' '}
              é como uma caixinha com nome. Você pode guardar números, textos e
              até resultados de contas dentro dela.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-zinc-800 bg-black/40 p-5 font-mono text-sm text-zinc-100">
          <span className="text-purple-400">nome</span>
          {' = '}
          <span className="text-emerald-400">&quot;Ana&quot;</span>
          <br />
          <span className="text-purple-400">idade</span>
          {' = '}
          <span className="text-amber-400">25</span>
          <br />
          <span className="text-zinc-500">print</span>
          {'('}
          <span className="text-purple-400">nome</span>
          {')'}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={simulateTyping}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 active:scale-[0.98]"
          >
            Simular Digitação
          </button>

          <button
            onClick={simulateError}
            className="rounded-xl border border-red-900/40 bg-red-900/20 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/30 active:scale-[0.98]"
          >
            Simular Erro
          </button>

          <button
            onClick={completePhase}
            className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-colors hover:bg-purple-500 active:scale-[0.98]"
          >
            Concluir Fase
          </button>
        </div>
      </motion.div>
    </div>
  );
}
