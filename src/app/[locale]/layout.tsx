import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { AuthProvider } from '@/contexts/AuthContext';
import { DynamicLocaleProvider } from '@/components/DynamicLocaleProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import '../globals.css';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Props) {
  const messages = await getMessages();

  return (
    <html lang={locale} className={GeistMono.variable}>
      <body className={`${GeistSans.className} overflow-x-hidden`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DynamicLocaleProvider>
            <AuthProvider>{children}</AuthProvider>
          </DynamicLocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
