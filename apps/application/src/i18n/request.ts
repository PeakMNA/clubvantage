import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, type Locale } from './config';

const localeMessages: Record<Locale, () => Promise<Record<string, unknown>>> = {
  en: () => import('@clubvantage/i18n/locales/en').then((m) => m.default),
  th: () => import('@clubvantage/i18n/locales/th').then((m) => m.default),
};

export default getRequestConfig(async () => {
  // For now, use default locale
  // Later can be enhanced with cookie/header-based detection
  const locale = defaultLocale;

  return {
    locale,
    messages: await localeMessages[locale](),
  };
});
