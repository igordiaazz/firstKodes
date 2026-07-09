'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Braces,
  Code,
  Flame,
  GitBranch,
  Globe,
  Hexagon,
  Loader2,
  LogOut,
  Repeat,
  Settings,
  Star,
  User,
  X,
} from 'lucide-react';
import User3DCard from '@/components/User3DCard';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Carousel from '@/components/Carousel';
import Footer from '@/components/Footer';
import GameLevel, { BOSS_CHALLENGES } from '@/components/GameLevel';
import { BOSS_CHALLENGES_EN } from '@/components/GameLevelEn';
import Module5Game from '@/components/Module5Game';
import StreakPending from '@/components/StreakPending';
import StreakLost from '@/components/StreakLost';
import ModuleComplete from '@/components/ModuleComplete';
import { moduleOneLevels } from '@/data/moduleOneLevels';
import { moduleOneLevelsEn } from '@/data/moduleOneLevels.en';
import {
  moduleTwoLevels,
  moduleThreeLevels,
  moduleFourLevels,
} from '@/data/modulesConfig';
import {
  moduleTwoLevelsEn,
  moduleThreeLevelsEn,
  moduleFourLevelsEn,
} from '@/data/modulesConfig.en';
import { useProgress, getModuleNumber } from '@/hooks/useProgress';
import { useSound } from '@/hooks/useSound';
import { NumberTicker } from '@/components/ui/number-ticker';
import type { LevelData } from '@/data/moduleOneLevels';
import type { ModuleData } from '@/components/Carousel';
import type { PracticeQuestion } from '@/app/api/generate-practice/route';

const NAME_STORAGE_KEY = 'firstkodes_display_name';

const PARTICLES = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function formatName(name: string, maxWords: number = 0): string {
  const words = name.trim().split(/\s+/);
  const selected = maxWords > 0 ? words.slice(0, maxWords) : words;
  return selected
    .map(w => w.toLowerCase())
    .map(w => PARTICLES.has(w) ? w : capitalize(w))
    .join(' ');
}

function getProfileDisplayName(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return '';
  const first = capitalize(words[0].toLowerCase());
  if (words.length < 2) return first;
  const second = words[1].toLowerCase();
  if (PARTICLES.has(second)) return first;
  return `${first} ${capitalize(second)}`;
}

function Greeting({ userName }: { userName: string }) {
  const t = useTranslations('home');
  const [greeting] = useState(() => {
    const list = [
      t('greetings.0'),
      t('greetings.1'),
      t('greetings.2'),
    ];
    return list[Math.floor(Math.random() * list.length)];
  });

  const fullText = userName ? `${greeting}, ${userName}!` : greeting;
  const [chars, setChars] = useState(0);
  const done = chars >= fullText.length;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setChars((c) => c + 1), 80);
    return () => clearTimeout(t);
  }, [chars, done]);

  return (
    <span className="text-base font-bold text-zinc-50">
      {fullText.slice(0, chars)}
      {!done && <span className="ml-0.5 animate-blink-cursor text-purple-400">|</span>}
    </span>
  );
}

type View = 'home' | 'game';

function LanguageToggle({ locale, compact }: { locale: string; compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('settings');
  const [open, setOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;
    router.push(pathname, { locale: newLocale });
    setOpen(false);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex size-9 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-400 backdrop-blur-sm transition-colors hover:text-zinc-50"
          aria-label={t('languageLabel')}
        >
          <Globe size={16} className="sm:size-5" />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl z-50"
            >
              <button
                onClick={() => switchLocale('pt')}
                className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-zinc-800 ${locale === 'pt' ? 'text-purple-400' : 'text-zinc-400'}`}
              >
                <span className="text-base leading-none">🇧🇷</span>
                {t('portuguese')}
              </button>
              <button
                onClick={() => switchLocale('en')}
                className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-zinc-800 ${locale === 'en' ? 'text-purple-400' : 'text-zinc-400'}`}
              >
                <span className="text-base leading-none">🇺🇸</span>
                {t('english')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-50"
      >
        <span className="text-base leading-none">{locale === 'pt' ? '🇧🇷' : '🇺🇸'}</span>
        <span>{locale === 'pt' ? 'PT' : 'EN'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl z-50"
          >
            <button
              onClick={() => switchLocale('pt')}
              className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-zinc-800 ${locale === 'pt' ? 'text-purple-400' : 'text-zinc-400'}`}
            >
              <span className="text-base leading-none">🇧🇷</span>
              {t('portuguese')}
            </button>
            <button
              onClick={() => switchLocale('en')}
              className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-zinc-800 ${locale === 'en' ? 'text-purple-400' : 'text-zinc-400'}`}
            >
              <span className="text-base leading-none">🇺🇸</span>
              {t('english')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const { user, loading: authLoading, isConfigured, signOut } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const homePathname = usePathname();
  const tm = useTranslations('modules');
  const ts = useTranslations('settings');
  const tp = useTranslations('practice');
  const tn = useTranslations('nameModal');
  const tpr = useTranslations('profile');

  const isEn = locale === 'en';

  const [view, setView] = useState<View>('home');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showStreakLost, setShowStreakLost] = useState(false);
  const [lostStreakCount, setLostStreakCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[] | null>(null);
  const [sessionKodeScore, setSessionKodeScore] = useState(0);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const {
    progress,
    hydrated,
    pendingStreak,
    completePhase,
    completeModule,
    confirmStreak,
    checkStreakLost,
    addKodeScore,
    setModuleStartTime,
    resetProgress,
    adminCompleteAll,
  } = useProgress();
  const { play } = useSound();

  const MODULES_META = useMemo(() => [
    {
      id: 'fundamentos',
      title: tm('fundamentos.title'),
      description: tm('fundamentos.description'),
      icon: Code,
    },
    {
      id: 'decisoes',
      title: tm('decisoes.title'),
      description: tm('decisoes.description'),
      icon: GitBranch,
    },
    {
      id: 'repeticoes',
      title: tm('repeticoes.title'),
      description: tm('repeticoes.description'),
      icon: Repeat,
    },
    {
      id: 'funcoes',
      title: tm('funcoes.title'),
      description: tm('funcoes.description'),
      icon: Braces,
    },
    {
      id: 'modulo5',
      title: tm('modulo5.title'),
      description: tm('modulo5.description'),
      icon: Star,
    },
  ], [tm]);

  const LEVELS_MAP: Record<string, LevelData[]> = useMemo(() => ({
    fundamentos: isEn ? moduleOneLevelsEn : moduleOneLevels,
    decisoes: isEn ? moduleTwoLevelsEn : moduleTwoLevels,
    repeticoes: isEn ? moduleThreeLevelsEn : moduleThreeLevels,
    funcoes: isEn ? moduleFourLevelsEn : moduleFourLevels,
    modulo5: [],
  }), [isEn]);

  const BOSS_MAP = isEn ? BOSS_CHALLENGES_EN : BOSS_CHALLENGES;

  const MODULE_NAMES: Record<string, string> = useMemo(() => ({
    fundamentos: tm('fundamentos.title'),
    decisoes: tm('decisoes.title'),
    repeticoes: tm('repeticoes.title'),
    funcoes: tm('funcoes.title'),
    modulo5: tm('modulo5.title'),
  }), [tm]);

  useEffect(() => {
    if (!user && isConfigured && !authLoading) {
      router.push(`/${locale}/login`);
    }
  }, [user, isConfigured, authLoading, router, locale]);

  useEffect(() => {
    if (!hydrated) return;
    const result = checkStreakLost();
    if (result.lost) {
      setLostStreakCount(result.count);
      setShowStreakLost(true);
    }
  }, [hydrated, checkStreakLost]);

  const modules: ModuleData[] = useMemo(
    () =>
      MODULES_META.map((meta) => {
        const num = getModuleNumber(meta.id);
        const levels = LEVELS_MAP[meta.id] ?? [];
        return {
          ...meta,
          totalPhases: meta.id === 'modulo5' ? 5 : levels.length + (BOSS_MAP[meta.id] ? 1 : 0),
          phasesCompleted: progress.phasesCompleted[meta.id] ?? 0,
          unlocked: progress.unlockedModules.includes(num),
        };
      }),
    [progress, MODULES_META, LEVELS_MAP, BOSS_MAP],
  );

  const handleStartModule = useCallback(
    (moduleId: string) => {
      setActiveModuleId(moduleId);
      setPracticeQuestions(null);
      setSessionKodeScore(0);
      setView('game');
      setModuleStartTime(Date.now());
    },
    [setModuleStartTime],
  );

  const handleModuleCompleted = useCallback(() => {
    if (progress.moduleStartTime > 0) {
      setElapsedTime(Date.now() - progress.moduleStartTime);
    }
    play('moduleComplete');
  }, [progress.moduleStartTime, play]);

  const handlePracticeModule = useCallback(
    async (moduleId: string) => {
      setActiveModuleId(moduleId);
      setPracticeQuestions(null);
      setPracticeError(null);
      setSessionKodeScore(0);
      setPracticeLoading(true);
      setView('game');
      setModuleStartTime(Date.now());

      try {
        const res = await fetch('/api/generate-practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleName: MODULE_NAMES[moduleId] ?? moduleId, locale }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: tp('errorDefault') }));
          setPracticeError(err.error ?? tp('errorDefault'));
          return;
        }
        const data = await res.json();
        setPracticeQuestions(data.questions);
      } catch {
        setPracticeError(tp('errorConnection'));
      } finally {
        setPracticeLoading(false);
      }
    },
    [setModuleStartTime, MODULE_NAMES, locale, tp],
  );

  const handleAddKodeScore = useCallback((points: number) => {
    addKodeScore(points);
    setSessionKodeScore(prev => prev + points);
  }, [addKodeScore]);

  const handleExitGame = useCallback(() => {
    setActiveModuleId(null);
    setPracticeQuestions(null);
    setPracticeError(null);
    setView('home');
  }, []);

  const handleComplete = useCallback(
    (moduleId: string, phasesCompleted: number) => {
      completePhase(moduleId, phasesCompleted);
      play('levelComplete');
    },
    [completePhase, play],
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push(`/${locale}/login`);
  }, [signOut, router, locale]);

  const [customName, setCustomName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    if (!user || !hydrated) return;
    const hasOAuthName = !!(
      user.user_metadata?.name ??
      user.user_metadata?.full_name ??
      user.user_metadata?.user_name ??
      user.user_metadata?.display_name
    );
    const savedName = localStorage.getItem(NAME_STORAGE_KEY);

    if (!hasOAuthName && !savedName) {
      setShowNameModal(true);
    }

    if (savedName) {
      setCustomName(savedName);
    }
  }, [user, hydrated]);

  const tHome = useTranslations('home');
  const rawName =
    customName ??
    user?.user_metadata?.name ??
    user?.user_metadata?.full_name ??
    user?.user_metadata?.user_name ??
    user?.user_metadata?.display_name ??
    user?.email?.split('@')[0] ??
    tHome('fallbackName');

  const userName = rawName ? formatName(rawName, 1) : '';
  const profileDisplayName = rawName ? getProfileDisplayName(rawName) : '';

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 size={32} className="animate-spin text-purple-400" />
      </div>
    );
  }

  if (isConfigured && !user) {
    return null;
  }

  if (view === 'game' && activeModuleId === 'modulo5') {
    return (
      <>
        <Module5Game
          onComplete={(phasesCompleted) => {
              completePhase('modulo5', phasesCompleted);
              play('levelComplete');
            }}
          onModuleComplete={() => completeModule(5)}
          onModuleCompleted={handleModuleCompleted}
          onExit={handleExitGame}
          onAddKodeScore={handleAddKodeScore}
        />
        {elapsedTime !== null && (
          <ModuleComplete
            elapsedMs={elapsedTime}
            moduleTitle={MODULE_NAMES['modulo5']}
            kodeScore={sessionKodeScore}
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
        <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-black px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Loader2 size={48} className="mx-auto mb-6 animate-spin text-purple-400" />
            <h2 className="mb-2 text-xl font-bold text-zinc-50">
              {tp('generating')}
            </h2>
            <p className="text-zinc-400">
              {tp('creatingPhases', { moduleName: MODULE_NAMES[activeModuleId] })}
            </p>
          </motion.div>
        </div>
      );
    }

    if (practiceError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-black px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <h2 className="mb-2 text-xl font-bold text-red-400">{tp('error')}</h2>
            <p className="mb-8 text-zinc-400">{practiceError}</p>
            <button
              onClick={handleExitGame}
              className="rounded-xl bg-purple-600 px-8 py-3 text-base font-bold text-white transition-all hover:bg-purple-500"
            >
              {tp('back')}
            </button>
          </motion.div>
        </div>
      );
    }

    const moduleTitle = MODULES_META.find((m) => m.id === activeModuleId)?.title ?? '';
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
          onAddKodeScore={handleAddKodeScore}
        />
        {elapsedTime !== null && (
          <ModuleComplete
            elapsedMs={elapsedTime}
            moduleTitle={moduleTitle}
            isPractice={!!practiceQuestions}
            kodeScore={sessionKodeScore}
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
    <main className="flex min-h-screen w-full flex-col px-5 md:px-8 lg:px-16">
      <header className="flex items-center justify-between pt-6 pb-2">
        <Greeting userName={userName} />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-2.5 py-1 backdrop-blur-sm sm:px-3 sm:py-1.5">
            <Hexagon size={16} className="text-purple-400 sm:size-[18px]" />
            <NumberTicker value={progress.kodeScore} className="text-xs font-semibold text-zinc-50 sm:text-sm tabular-nums" />
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-2.5 py-1 backdrop-blur-sm sm:px-3 sm:py-1.5">
            <Flame size={16} className="text-orange-500 sm:size-[18px]" />
            <span className="text-xs font-semibold text-zinc-50 sm:text-sm">
              {progress.streak}
            </span>
          </div>
          <LanguageToggle locale={locale} compact />
          <button
            onClick={() => setShowSettings(true)}
            className="flex size-9 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-400 backdrop-blur-sm transition-colors hover:text-zinc-50 sm:size-10"
            aria-label={ts('title')}
          >
            <Settings size={16} className="sm:size-5" />
          </button>
          {user && (
            <button
              onClick={() => setShowProfileCard(true)}
              className="flex size-9 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-400 backdrop-blur-sm transition-colors hover:text-zinc-50 sm:size-10"
              aria-label={tpr('title')}
            >
              <User size={16} className="sm:size-5" />
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center -mt-8">
        <Carousel
          modules={modules}
          onStartModule={handleStartModule}
          onPracticeModule={handlePracticeModule}
          onAdminUnlock={adminCompleteAll}
        />

        {pendingStreak > 0 && (
            <StreakPending
              pendingStreak={pendingStreak}
              onConfirm={confirmStreak}
            />
        )}

        <StreakLost
          show={showStreakLost}
          lostStreak={lostStreakCount}
          onClose={() => setShowStreakLost(false)}
        />
      </div>

      <footer>
        <Footer />
      </footer>

      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mx-4 w-full max-w-sm sm:w-80 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
          >
            <h2 className="mb-2 text-lg font-bold text-zinc-50">{tn('title')}</h2>
            <p className="mb-6 text-sm text-zinc-500">
              {tn('subtitle')}
            </p>
            <input
              type="text"
              id="nameInput"
              placeholder={tn('placeholder')}
              autoFocus
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                  const name = formatName((e.target as HTMLInputElement).value.trim());
                  localStorage.setItem(NAME_STORAGE_KEY, name);
                  setCustomName(name);
                  setShowNameModal(false);
                }
              }}
              className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800"
              >
                {tn('skip')}
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('nameInput') as HTMLInputElement;
                  if (input.value.trim()) {
                    const name = formatName(input.value.trim());
                    localStorage.setItem(NAME_STORAGE_KEY, name);
                    setCustomName(name);
                    setShowNameModal(false);
                  }
                }}
                className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
              >
                {tn('save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showProfileCard && user && (
        <User3DCard
          displayName={userName}
          fullName={profileDisplayName}
          email={user.email ?? undefined}
          provider={user.identities?.[0]?.provider ?? user.app_metadata?.provider}
          onClose={() => setShowProfileCard(false)}
        />
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mx-4 w-full max-w-sm sm:w-80 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
          >
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label={ts('close')}
            >
              <X size={18} />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-600/20">
                <Settings size={20} className="text-purple-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-50">{ts('title')}</h2>
            </div>

            <div className="mb-4 border-t border-zinc-800" />
            <p className="mb-4 text-sm text-zinc-400">
              {ts('warning')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                {ts('cancel')}
              </button>
              <button
                onClick={() => {
                    resetProgress();
                    setShowStreakLost(false);
                    setShowSettings(false);
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500"
              >
                {ts('reset')}
              </button>
            </div>

            {user && (
              <>
                <div className="mt-4 border-t border-zinc-800" />
                <button
                  onClick={handleSignOut}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
                >
                  <LogOut size={16} />
                  {ts('signOut')}
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}

    </main>
  );
}
