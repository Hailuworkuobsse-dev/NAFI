import { ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_LOCALE, LOCALE_LABELS, SUPPORTED_LOCALES, type SupportedLocale } from '@nafi/i18n';
import { cn } from '@nafi/ui-react';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const activeLocale =
    SUPPORTED_LOCALES.find((locale) => locale === i18n.resolvedLanguage?.split('-')[0]) ??
    DEFAULT_LOCALE;

  const change = (locale: SupportedLocale) => {
    void i18n.changeLanguage(locale);
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white/90 px-2.5 py-1.5 shadow-sm transition-colors hover:border-neutral-300',
        className,
      )}
    >
      <Globe className="h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden="true" />
      <select
        aria-label="Language"
        value={activeLocale}
        onChange={(event) => change(event.target.value as SupportedLocale)}
        className="cursor-pointer appearance-none bg-transparent py-0.5 pr-5 text-xs font-semibold text-neutral-700 outline-none"
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {LOCALE_LABELS[locale]}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-neutral-400"
        aria-hidden="true"
      />
    </div>
  );
}
