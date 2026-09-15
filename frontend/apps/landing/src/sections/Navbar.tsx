import { ChevronDown, Globe, Menu, ShieldCheck, UserCircle2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, cn } from '@nafi/ui-react';

import { LanguageSwitcher } from '../components/LanguageSwitcher';

const NAV_LINKS = [
  { href: '#how', key: 'howItWorks', label: 'How It Works' },
  { href: '#opportunities', key: 'opportunities', label: 'Live Contracts' },
  { href: '#architecture', key: 'architecture', label: 'Architecture' },
  { href: '#calculator', key: 'calculator', label: 'Calculator' },
  { href: '#impact', key: 'impact', label: 'Impact' },
  { href: '#audience', key: 'audience', label: 'Stakeholders' },
  { href: '#faq', key: 'faq', label: 'FAQ' },
] as const;

export function Navbar() {
  const { t } = useTranslation('landing');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPortalDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Institutional Top Bar */}
      <div className="bg-neutral-900 text-neutral-300 text-[11px] py-2 hidden md:block border-b border-neutral-800">
        <div className="container-narrow flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              NBE Sandbox Directive #042/2024
            </span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">
              National Agrifinance Infrastructure & Sovereign Escrow Engine
            </span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-brand-400" />
              Regulated Commercial Bank Escrow
            </span>
            <span>·</span>
            <span>ECX-Integrated Ledger</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div
        className={cn(
          'w-full transition-all duration-300',
          scrolled
            ? 'border-b border-neutral-200 bg-white/95 backdrop-blur-md shadow-sm'
            : 'border-b border-neutral-100 bg-white/90 backdrop-blur-sm',
        )}
      >
        <div className="container-narrow flex h-16 lg:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none" aria-label="NAFI Home">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="font-bold text-lg font-mono">N</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-neutral-900 group-hover:text-brand-700 transition-colors">
                  NAFI
                </span>
                <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-800 uppercase tracking-wider">
                  Ethiopia
                </span>
              </div>
              <span className="hidden sm:block text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                National Agri-Finance Infrastructure
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 xl:gap-2 lg:flex" aria-label="Main Navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-colors rounded-lg hover:bg-neutral-100 hover:text-neutral-900 whitespace-nowrap"
              >
                {t(`nav.${link.key}`, link.label)}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* Portals Quick Launcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                aria-expanded={portalDropdownOpen}
              >
                <UserCircle2 className="h-4 w-4 text-brand-600" />
                <span>Portals</span>
                <ChevronDown className={cn('h-3.5 w-3.5 text-neutral-400 transition-transform duration-200', portalDropdownOpen && 'rotate-180')} />
              </button>

              {portalDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg z-50 animate-in fade-in-50 duration-150">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Direct Workspace Access
                  </div>
                  <Link
                    to="/register?role=DIASPORA_INVESTOR"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex flex-col rounded-lg px-2.5 py-2 text-xs hover:bg-brand-50 transition-colors"
                  >
                    <span className="font-semibold text-neutral-900">Diaspora Investor Desk</span>
                    <span className="text-[11px] text-neutral-500">Fund verified export contracts</span>
                  </Link>
                  <Link
                    to="/register?role=COMMERCIAL_FARMER"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex flex-col rounded-lg px-2.5 py-2 text-xs hover:bg-brand-50 transition-colors"
                  >
                    <span className="font-semibold text-neutral-900">Commercial Farmer Portal</span>
                    <span className="text-[11px] text-neutral-500">Input pre-financing & off-take</span>
                  </Link>
                  <Link
                    to="/register?role=COMMERCIAL_BANK"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex flex-col rounded-lg px-2.5 py-2 text-xs hover:bg-brand-50 transition-colors"
                  >
                    <span className="font-semibold text-neutral-900">Commercial Bank Escrow</span>
                    <span className="text-[11px] text-neutral-500">70% guaranteed credit matching</span>
                  </Link>
                  <Link
                    to="/register?role=GOVERNMENT_OFFICER"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex flex-col rounded-lg px-2.5 py-2 text-xs hover:bg-brand-50 transition-colors"
                  >
                    <span className="font-semibold text-neutral-900">Government & MoA Witness</span>
                    <span className="text-[11px] text-neutral-500">Macro oversight & digital witness</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-neutral-200 mx-1" />

            <LanguageSwitcher />

            <Button asChild variant="ghost" size="sm" className="px-3 text-xs font-semibold text-neutral-700">
              <Link to="/login">{t('nav.login', 'Log In')}</Link>
            </Button>

            <Button asChild size="sm" className="px-4 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm">
              <Link to="/register">{t('nav.getStarted', 'Get Started')}</Link>
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="border-t border-neutral-200 bg-white lg:hidden">
            <div className="container-narrow flex flex-col gap-1 py-4">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 rounded-lg mb-2">
                NBE Sandbox #042/2024 · National Agri-Finance
              </div>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  {t(`nav.${link.key}`, link.label)}
                </a>
              ))}
              <div className="my-2 border-t border-neutral-100" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button asChild variant="outline" size="sm" fullWidth>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>{t('nav.login', 'Log In')}</Link>
                </Button>
                <Button asChild size="sm" fullWidth className="bg-brand-600 text-white">
                  <Link to="/register" onClick={() => setMobileOpen(false)}>{t('nav.getStarted', 'Get Started')}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
