import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Badge, Button } from '@nafi/ui-react';

import { StatCounter } from '../components/StatCounter';
import { usePublicStats } from '../hooks/usePublicStats';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function Hero() {
  const { t } = useTranslation('landing');
  const { stats } = usePublicStats();
  const heroRef = useScrollAnimation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50">
      {/* Decorative background elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-brand-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-accent-200/30 blur-3xl"
      />
      {/* Grid pattern overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808004_1px,transparent_1px),linear-gradient(to_bottom,#80808004_1px,transparent_1px)] bg-[size:4rem_4rem]"
      />

      <div ref={heroRef} className="container-narrow min-h-[90vh] py-16 lg:py-24 animate-on-scroll">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="success" size="lg" dot className="mb-6 animate-bounce">
            {t('hero.badge')}
          </Badge>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl xl:text-7xl">
            {t('hero.title')}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 sm:text-xl">
            {t('hero.subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="px-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <Link to="/register?role=DIASPORA_INVESTOR">{t('hero.ctaInvest')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all hover:-translate-y-1">
              <Link to="/register?role=COMMERCIAL_FARMER">{t('hero.ctaFarmer')}</Link>
            </Button>
          </div>

          <div className="mt-16 grid w-full grid-cols-1 gap-6 border-t border-neutral-200 pt-10 sm:grid-cols-3">
            <StatCounter
              value={stats.totalFundedUsd}
              prefix="$"
              label={t('hero.statFunded')}
              className="text-center"
            />
            <StatCounter
              value={stats.activeContracts}
              label={t('hero.statContracts')}
              className="text-center"
            />
            <StatCounter
              value={stats.farmersReached}
              label={t('hero.statFarmers')}
              className="text-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
