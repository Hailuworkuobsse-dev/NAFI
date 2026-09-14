import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LOCALE_LABELS, SUPPORTED_LOCALES, type SupportedLocale } from '@nafi/i18n';
import { cn } from '@nafi/ui-react';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();

  const change = (locale: SupportedLocale) => {
    void i18n.changeLanguage(locale);
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white/80 px-1 py-1 backdrop-blur',
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <Globe className="ml-1.5 h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => change(locale)}
          aria-pressed={i18n.resolvedLanguage === locale}
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
            i18n.resolvedLanguage === locale
              ? 'bg-brand-500 text-white'
              : 'text-neutral-600 hover:bg-neutral-100',
          )}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
