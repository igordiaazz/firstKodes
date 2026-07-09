'use client';

import { motion, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

interface WelcomeSplashProps {
  firstName: string;
  createdAt: Date;
  isNew?: boolean;
  onDone: () => void;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.25, delayChildren: 0.2 },
  },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function WelcomeSplash({ firstName, createdAt, isNew = false, onDone }: WelcomeSplashProps) {
  const t = useTranslations('welcome');
  const locale = useLocale();

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const id = setTimeout(onDone, 5000);
    return () => clearTimeout(id);
  }, [isDesktop, onDone]);

  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(createdAt);
  const year = createdAt.getFullYear();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 z-[100] flex flex-col bg-black px-8 py-10"
    >
      <div className="text-base font-bold text-purple-400">firstKodes</div>

      <div className="mt-auto flex w-full flex-col items-start gap-2 pb-8 text-left">
        {isNew ? (
          <>
            <motion.p variants={item} className="text-3xl font-bold text-white">
              {t('newLine1')}
            </motion.p>
            <motion.p variants={item} className="text-3xl font-bold text-white">
              {t('newLine2')}
            </motion.p>
          </>
        ) : (
          <>
            <motion.p variants={item} className="text-3xl font-bold text-white">
              {t('line1Prefix')}
              <span className="text-purple-400">{firstName}</span>
            </motion.p>
            <motion.p variants={item} className="text-3xl font-bold text-white">
              {t('line2')}
            </motion.p>
            <motion.p variants={item} className="text-lg font-medium text-zinc-400">
              {t('line3')}
            </motion.p>
            <motion.p variants={item} className="text-sm text-zinc-600">
              {t('memberSince', { month, year })}
            </motion.p>
          </>
        )}
        <button
          onClick={onDone}
          className="mt-4 w-full rounded-xl bg-purple-800 px-6 py-3 text-center text-base font-bold text-white shadow-lg shadow-purple-800/25 transition-all hover:bg-purple-700 active:scale-[0.98] sm:hidden"
        >
          {t('continue')}
        </button>
      </div>
    </motion.div>
  );
}
