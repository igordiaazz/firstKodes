'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const messageLoaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  pt: () => import('@/messages/pt.json'),
  en: () => import('@/messages/en.json'),
};

export function DynamicLocaleProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const locale = (params.locale as string) ?? 'pt';
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    messageLoaders[locale]?.().then((mod) => setMessages(mod.default));
  }, [locale]);

  if (!messages) {
    return <>{children}</>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
