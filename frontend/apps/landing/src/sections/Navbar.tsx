import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, cn } from '@nafi/ui-react';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const NAV_LINKS = [
  { href: '#solution', key: 'nav.platform' },
  { href: '#audience', key: 'nav.forInvestors' },
  { href: '#how', key: 'nav.platform' },
  { href: '#impact', key: 'nav.impact' },
  { href: '#faq', key: 'nav.about' },
] as const;

export function Navbar() {
  const { t } = useTranslation('landing');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-sticky w-full transition-colors',
        scrolled ? 'border-b border-neutral-200 bg-white/95 backdrop-blur' : 'bg-transparent',
      )}
    >
      <div className="container-narrow flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white">
            <span className="font-bold">N</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">NAFI</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {t(link.key)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">{t('nav.login')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/register">{t('nav.getStarted')}</Link>
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <div className="container-narrow flex flex-col gap-3 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm font-medium text-neutral-700"
              >
                {t(link.key)}
              </a>
            ))}
            <div className="flex items-center justify-between pt-2">
              <LanguageSwitcher />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild variant="outline" size="md" fullWidth>
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button asChild size="md" fullWidth>
                <Link to="/register">{t('nav.getStarted')}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
