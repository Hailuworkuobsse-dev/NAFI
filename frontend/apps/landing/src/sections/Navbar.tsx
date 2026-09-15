import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, cn } from '@nafi/ui-react';

import { LanguageSwitcher } from '../components/LanguageSwitcher';

const NAV_LINKS = [
  { href: '#how', key: 'nav.howItWorks' },
  { href: '#opportunities', key: 'nav.opportunities' },
  { href: '#impact', key: 'nav.impact' },
  { href: '#audience', key: 'nav.audience' },
  { href: '#faq', key: 'nav.faq' },
] as const;

export function Navbar() {
  const { t } = useTranslation('landing');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled 
          ? 'border-b border-neutral-200 bg-white/90 backdrop-blur-lg shadow-sm' 
          : 'bg-transparent',
      )}
    >
      <div className="container-narrow flex h-20 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
            <span className="font-bold text-lg">N</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-900 group-hover:text-brand-600 transition-colors">NAFI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-neutral-600 transition-all rounded-lg hover:bg-neutral-100 hover:text-neutral-900"
            >
              {t(link.key)}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm" className="px-4">
            <Link to="/login">{t('nav.login')}</Link>
          </Button>
          <Button asChild size="sm" className="px-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
            <Link to="/register">{t('nav.getStarted')}</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white lg:hidden animate-in slide-in-from-top-2">
          <div className="container-narrow flex flex-col gap-2 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                {t(link.key)}
              </a>
            ))}
            <div className="my-2 border-t border-neutral-100" />
            <div className="flex items-center justify-between px-4 py-2">
              <LanguageSwitcher />
            </div>
            <div className="flex flex-col gap-2 px-4 pt-2">
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
