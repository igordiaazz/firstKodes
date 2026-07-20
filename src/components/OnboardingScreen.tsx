'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import Mascot from '@/components/Mascot';

export type OnboardingAnswers = Record<string, string>;

const QUESTION_KEYS = [
  'knowledge',
  'motivation',
  'time',
  'goal',
  'moment',
  'superpower',
] as const;

interface OnboardingScreenProps {
  open: boolean;
  onClose: () => void;
  onComplete: (answers: OnboardingAnswers) => void;
  saving?: boolean;
}

function TypedTitle({
  title,
  highlight,
  typed,
  typing,
}: {
  title: string;
  highlight: string;
  typed: number;
  typing: boolean;
}) {
  const idx = highlight ? title.toLowerCase().indexOf(highlight.toLowerCase()) : -1;
  const visible = title.slice(0, typed);

  let content: ReactNode;
  if (idx === -1 || idx >= visible.length) {
    content = visible;
  } else {
    const hlEnd = Math.min(idx + highlight.length, visible.length);
    content = (
      <>
        {visible.slice(0, idx)}
        <span className="text-purple-400">{visible.slice(idx, hlEnd)}</span>
        {visible.slice(hlEnd)}
      </>
    );
  }

  return (
    <>
      {content}
      {typing && <span className="ml-0.5 animate-pulse text-purple-400">|</span>}
    </>
  );
}

export default function OnboardingScreen({
  open,
  onClose,
  onComplete,
  saving = false,
}: OnboardingScreenProps) {
  const t = useTranslations('onboarding');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  const total = QUESTION_KEYS.length;
  const currentKey = QUESTION_KEYS[step];
  const title = t(`questions.${currentKey}.title`);
  const highlight = t(`questions.${currentKey}.highlight`);
  const options = Object.keys(
    (t.raw(`questions.${currentKey}.options`) as Record<string, string>) ?? {},
  );
  const selected = answers[currentKey];

  const [typed, setTyped] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setTyped(0);
    setIsTyping(true);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= title.length) {
        clearInterval(id);
        setIsTyping(false);
      }
    }, 22);
    return () => clearInterval(id);
  }, [title]);

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentKey]: value }));
  };

  const handleNext = () => {
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      onComplete(answers);
    }
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  if (!open) return null;

  const optionButtons = options.map((opt) => {
    const isSelected = selected === opt;
    return (
      <motion.button
        key={opt}
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => handleSelect(opt)}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all ${
          isSelected
            ? 'border-purple-500 bg-purple-600/10 text-zinc-50'
            : 'border-white/10 text-zinc-300 hover:bg-white/5 hover:text-purple-400'
        }`}
      >
        {t(`questions.${currentKey}.options.${opt}`)}
        {isSelected && <Check size={16} className="text-purple-400" />}
      </motion.button>
    );
  });

  const primaryButton = (
    <button
      type="button"
      onClick={handleNext}
      disabled={!selected || saving}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {saving ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          {t('saving')}
        </>
      ) : (
        <>
          {step === total - 1 ? t('finish') : t('next')}
          <ArrowRight size={18} />
        </>
      )}
    </button>
  );

  return (
    <main className="grid min-h-screen bg-black lg:grid-cols-2">
      {/* Top-right close (desktop) */}
      <button
        onClick={handleClose}
        disabled={saving}
        className="absolute top-8 right-6 z-50 flex size-9 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-400 backdrop-blur-sm transition-colors hover:text-zinc-50 lg:top-12 lg:right-12"
        aria-label={t('skip')}
      >
        <X size={18} />
      </button>

      {/* Left — Question (desktop hero only) */}
      <div className="relative hidden flex-col overflow-hidden bg-black px-6 pt-8 lg:flex lg:p-12">
        <div className="text-base font-bold text-purple-400">firstKodes</div>

        <div className="flex flex-1 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentKey}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg"
            >
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-tight">
                <TypedTitle title={title} highlight={highlight} typed={typed} typing={isTyping} />
              </h1>
              <p className="mt-3 text-sm text-zinc-600">{t('subtitle')}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right — Options (desktop) / Bottom sheet style on mobile */}
      <div className="flex flex-col bg-black px-4 pb-6 md:px-8 lg:px-12 lg:py-12">
        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile header: progress + back */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={t('back')}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={handleClose}
                disabled={saving}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-50 disabled:opacity-50"
                aria-label={t('skip')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile mascot + bubble */}
            <div className="mb-6 flex items-start gap-3 lg:hidden">
              <Mascot status="idle" />
              <div className="relative rounded-2xl rounded-tl-sm bg-zinc-900 px-5 py-4 shadow-lg">
                <div className="absolute -left-1.5 top-4 h-3 w-3 rotate-45 bg-zinc-900" />
                <p className="text-sm leading-relaxed text-zinc-300">
                  <TypedTitle title={title} highlight={highlight} typed={typed} typing={isTyping} />
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3"
              >
                {optionButtons}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 hidden lg:block">{primaryButton}</div>

            {/* Mobile primary button (sticky-ish at bottom) */}
            <div className="mt-6 lg:hidden">
              {primaryButton}
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={saving}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100 disabled:opacity-30"
                >
                  <ArrowLeft size={16} />
                  {t('back')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
