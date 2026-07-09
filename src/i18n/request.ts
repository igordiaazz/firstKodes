import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ locale: rawLocale }) => {
  const locale = rawLocale ?? 'pt';
  if (!routing.locales.includes(locale as 'pt' | 'en')) {
    throw new Error(`Locale ${locale} not found`);
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
