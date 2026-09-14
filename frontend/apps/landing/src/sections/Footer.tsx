import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Footer() {
  const { t } = useTranslation('landing');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="container-narrow grid grid-cols-1 gap-10 py-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white">
              <span className="font-bold">N</span>
            </div>
            <span className="text-lg font-bold tracking-tight">NAFI</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-neutral-500">{t('footer.tagline')}</p>
          <div className="mt-5">
            <LanguageSwitcher />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t('footer.platform.title')}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <a href="#how" className="text-sm text-neutral-600 hover:text-neutral-900">
                {t('footer.platform.howItWorks')}
              </a>
            </li>
            <li>
              <a href="#security" className="text-sm text-neutral-600 hover:text-neutral-900">
                {t('footer.platform.security')}
              </a>
            </li>
            <li>
              <a href="#impact" className="text-sm text-neutral-600 hover:text-neutral-900">
                {t('footer.platform.impact')}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t('footer.audience.title')}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <Link
                to="/register?role=DIASPORA_INVESTOR"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                {t('footer.audience.investors')}
              </Link>
            </li>
            <li>
              <Link
                to="/register?role=COMMERCIAL_FARMER"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                {t('footer.audience.farmers')}
              </Link>
            </li>
            <li>
              <Link
                to="/register?role=COMMERCIAL_BANK"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                {t('footer.audience.banks')}
              </Link>
            </li>
            <li>
              <Link
                to="/register?role=GOVERNMENT_REGULATOR"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                {t('footer.audience.government')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t('footer.legal.title')}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <Link to="/terms" className="text-sm text-neutral-600 hover:text-neutral-900">
                {t('footer.legal.terms')}
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-sm text-neutral-600 hover:text-neutral-900">
                {t('footer.legal.privacy')}
              </Link>
            </li>
            <li>
              <Link to="/compliance" className="text-sm text-neutral-600 hover:text-neutral-900">
                {t('footer.legal.compliance')}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-100 py-6">
        <p className="container-narrow text-center text-xs text-neutral-500">
          {t('footer.rights', { year })}
        </p>
      </div>
    </footer>
  );
}
