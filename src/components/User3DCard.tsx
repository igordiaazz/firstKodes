'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Github } from 'lucide-react';
import { GlareCard } from '@/components/ui/glare-card';

interface User3DCardProps {
  displayName: string;
  fullName: string;
  email?: string;
  provider?: string;
  onClose: () => void;
}

function GoogleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const PROVIDER_INFO: Record<string, { label: string; icon: typeof Github }> = {
  github: { label: 'Autenticado via GitHub', icon: Github },
  google: { label: 'Autenticado via Google', icon: Github },
};

function ProviderIcon({ provider }: { provider: string }) {
  if (provider === 'google') return <GoogleIcon size={12} />;
  const info = PROVIDER_INFO[provider];
  if (!info) return null;
  const Icon = info.icon;
  return <Icon size={12} />;
}

export default function User3DCard({
  displayName,
  fullName,
  email,
  provider,
  onClose,
}: User3DCardProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <GlareCard className="bg-zinc-900">
          <div className="relative flex flex-col h-full p-8 pb-6 text-white">
            <div className="flex-1 flex items-center justify-center">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">{fullName || displayName}</h2>
              <p className="text-base text-slate-300 mt-1">
                {email || 'Aprendendo a programar em C'}
              </p>

              {provider && (
                <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 mt-4 w-fit">
                  <ProviderIcon provider={provider} />
                  <span className="text-[11px] font-medium text-slate-300">
                    {PROVIDER_INFO[provider]?.label ?? provider}
                  </span>
                </div>
              )}
            </div>
          </div>
        </GlareCard>
      </div>
    </motion.div>
  );
}
