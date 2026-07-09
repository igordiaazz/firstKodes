'use client';

import { Loader2, Github } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function Typewriter({ words }: { words: string[] }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex];

    if (!deleting && charIndex >= word.length) {
      const t = setTimeout(() => setDeleting(true), 1500);
      return () => clearTimeout(t);
    }

    if (deleting && charIndex <= 0) {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
      return;
    }

    const timeout = setTimeout(
      () => setCharIndex((i) => (deleting ? i - 1 : i + 1)),
      deleting ? 40 : 80,
    );

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words]);

  return (
    <span>
      {words[wordIndex].slice(0, charIndex)}
      <span className="animate-pulse text-purple-400">|</span>
    </span>
  );
}

export default function LoginPage() {
  const { user, loading, isConfigured, signInWithGoogle, signInWithGitHub } =
    useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('login');

  const typewriterWords = [
    t('typewriterWords.0'),
    t('typewriterWords.1'),
    t('typewriterWords.2'),
  ];

  useEffect(() => {
    if (user) router.push(`/${locale}`);
  }, [user, router, locale]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 size={32} className="animate-spin text-purple-400" />
      </div>
    );
  }

  if (user) return null;

  if (!isConfigured) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
        <div className="max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-xl">
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-50">
            first<span className="text-purple-400">Kodes</span>
          </h1>
          <p className="mb-4 text-sm text-zinc-400">
            {t('unconfiguredDesc')}{' '}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-purple-400">.env.local</code>:
          </p>
          <pre className="mb-6 rounded-lg bg-zinc-950 p-3 text-left text-xs text-zinc-300">
            NEXT_PUBLIC_SUPABASE_URL=your_url{'\n'}
            NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
          </pre>
          <a
            href={`/${locale}`}
            className="inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            {t('continueWithoutAccount')}
          </a>
        </div>
      </main>
    );
  }

  return (
    <>
    <main className="relative grid min-h-screen lg:grid-cols-2">
      {/* Top-right language toggle */}
      <div className="absolute top-8 right-6 lg:top-12 lg:right-12 z-50">
        <LanguageToggle locale={locale} />
      </div>

      {/* Left — Brand */}
      <div className="relative overflow-hidden flex flex-col bg-[#050505] px-6 pt-8 lg:p-12">
        <div className="text-base font-bold text-purple-400">
          firstKodes
        </div>

        <div className="flex flex-1 items-center justify-center lg:-mt-5">
          <div className="max-w-lg">
            <p className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t('hero')}{' '}
              <span className="text-purple-400">
                <Typewriter words={typewriterWords} />
              </span>
            </p>
            <p className="mt-4 text-sm text-zinc-600">
              {t('description')}
            </p>
          </div>
        </div>

      </div>

      {/* Right — Form */}
      <div className="flex flex-col bg-[#050505] px-4 md:px-8">
        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-2 text-sm font-medium text-zinc-500">{t('brand')}</div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">
              {t('formTitle')}
            </h1>
            <p className="mb-10 text-sm text-zinc-500">
              {t('formSubtitle')}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={signInWithGoogle}
                className="flex items-center justify-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                <svg viewBox="0 0 24 24" className="size-5 text-zinc-400" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t('google')}
              </button>
              <button
                onClick={signInWithGitHub}
                className="flex items-center justify-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                <Github size={20} className="text-zinc-400" />
                {t('github')}
              </button>
            </div>

          </div>
        </div>
        <footer className="pb-4 md:pb-6 text-center">
          <p className="text-sm text-zinc-600 flex items-center justify-center gap-1">
            {t('footer')}{' '}
            <a
              href="https://github.com/igordiaazz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-purple-400"
            >
              {t('author')}
              <FontAwesomeIcon icon={faGithub} className="text-zinc-600" />
            </a>
          </p>
        </footer>
      </div>
    </main>
    </>
  );
}

function LanguageToggle({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('settings');
  const [open, setOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;
    router.push(pathname, { locale: newLocale });
    setOpen(false);
  };

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
