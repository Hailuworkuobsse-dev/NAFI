export const SUPPORTED_LOCALES = ['en', 'am', 'om', 'ti'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  am: 'አማርኛ',
  om: 'Afaan Oromoo',
  ti: 'ትግርኛ',
};

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const I18N_NAMESPACES = ['common', 'auth', 'nav', 'landing'] as const;
export type I18nNamespace = (typeof I18N_NAMESPACES)[number];
