import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function Footer() {
  const { t } = useTranslation('landing');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-gradient-to-b from-white to-neutral-50">
      <div className="container-narrow py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md">
                <span className="font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900">NAFI</span>
            </Link>
            <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">{t('footer.tagline')}</p>
            <div className="mt-6">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
              {t('footer.platform.title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#how" className="text-sm text-neutral-600 hover:text-brand-600 transition-colors">
                  {t('footer.platform.howItWorks')}
                </a>
              </li>
              <li>
                <a href="#opportunities" className="text-sm text-neutral-600 hover:text-brand-600 transition-colors">
                  Opportunities
                </a>
              </li>
              <li>
                <a href="#security" className="text-sm text-neutral-600 hover:text-brand-600 transition-colors">
                  {t('footer.platform.security')}
                </a>
              </li>
              <li>
                <a href="#impact" className="text-sm text-neutral-600 hover:text-brand-600 transition-colors">
                  {t('footer.platform.impact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Audience Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
              {t('footer.audience.title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/register?role=DIASPORA_INVESTOR" className="text-sm text-neutral-600 hover:text-brand-600 transition-colors">
                  {t('footer.audience.investors')}
                </Link>
              </li>
              <li>
                <Link to="/register?role=COMMERCIAL_FARMER" className="text-sm text-neutral-600 hover:text-brand-600 transition-colors">
                  {t('footer.audience.farmers')}
                </Link>
              </li>
              <li>
                <Link to="/register?role=COMMERCIAL_BANK" className="text-sm text-neutral-600 hover:text-brand-600 transition-colors">
                  {t('footer.audience.banks')}
                </Link>
              </li>
              <li>
                <Link to="/register?role=GOVERNMENT_REGULATOR" className="text-sm text-neutral-600 hover:text-brand-600 transition-colors">
                  {t('footer.audience.government')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
              {t('footer.legal.title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-sm text-neutral-600 hover:text-brand-600 transition-colors">
                  {t('footer.legal.terms')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-neutral-600 hover:text-brand-600 transition-colors">
                  {t('footer.legal.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="text-sm text-neutral-600 hover:text-brand-600 transition-colors">
                  {t('footer.legal.compliance')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-neutral-500">
              {t('footer.rights', { year })}
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-neutral-400 hover:text-brand-600 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-brand-600 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
