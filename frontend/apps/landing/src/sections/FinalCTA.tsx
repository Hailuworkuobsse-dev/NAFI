import { ArrowRight, Building2, Coins, ShieldCheck, Tractor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '@nafi/ui-react';

import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function FinalCTA() {
  const { t } = useTranslation('landing');
  const sectionRef = useScrollAnimation();

  return (
    <section className="py-20 sm:py-28 bg-neutral-900 text-white relative overflow-hidden">
      <div
        ref={sectionRef}
        className="container-narrow relative z-10 flex flex-col items-center text-center animate-on-scroll"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-neutral-800 border border-neutral-700 px-3 py-1 text-xs font-semibold text-brand-300 mb-4">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
          <span>Licensed NBE Sandbox & Commercial Bank Custody</span>
        </div>

        <h2 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          {t('finalCta.title', "Join the Infrastructure of Ethiopia's Agricultural Renaissance")}
        </h2>
        <p className="mt-4 max-w-2xl text-base sm:text-lg text-neutral-300 leading-relaxed">
          {t(
            'finalCta.subtitle',
            'Whether you invest hard currency, cultivate commercial land, provide bank escrows, or regulate sovereign food security — NAFI is where institutional capital meets Ethiopian soil.',
          )}
        </p>

        {/* Action Pathways */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          <Link
            to="/register?role=DIASPORA_INVESTOR"
            className="group rounded-2xl border border-neutral-700 bg-neutral-800/80 p-5 text-left transition-all hover:border-brand-500 hover:bg-neutral-800"
          >
            <div className="flex items-center justify-between mb-3">
              <Coins className="h-5 w-5 text-brand-400" />
              <ArrowRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Diaspora Investor</h3>
            <p className="mt-1 text-xs text-neutral-400">
              Commit USD/EUR into audited contracts with guaranteed FX repatriation.
            </p>
          </Link>

          <Link
            to="/register?role=COMMERCIAL_FARMER"
            className="group rounded-2xl border border-neutral-700 bg-neutral-800/80 p-5 text-left transition-all hover:border-brand-500 hover:bg-neutral-800"
          >
            <div className="flex items-center justify-between mb-3">
              <Tractor className="h-5 w-5 text-brand-400" />
              <ArrowRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Farmer / Union</h3>
            <p className="mt-1 text-xs text-neutral-400">
              Receive zero-cash certified inputs and guaranteed floor price off-take.
            </p>
          </Link>

          <Link
            to="/register?role=COMMERCIAL_BANK"
            className="group rounded-2xl border border-neutral-700 bg-neutral-800/80 p-5 text-left transition-all hover:border-accent-500 hover:bg-neutral-800"
          >
            <div className="flex items-center justify-between mb-3">
              <Building2 className="h-5 w-5 text-accent-400" />
              <ArrowRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Commercial Bank</h3>
            <p className="mt-1 text-xs text-neutral-400">
              Deploy agricultural credit with 70% NAFA first-loss protection.
            </p>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-brand-500 text-white hover:bg-brand-600 px-8 font-bold">
            <Link to="/register">
              <span>{t('finalCta.cta', 'Create Verified Account')}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-white">
            <Link to="/opportunities">
              <span>Browse Active Pools</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
