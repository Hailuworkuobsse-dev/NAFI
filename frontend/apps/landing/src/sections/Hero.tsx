import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Badge, Button } from '@nafi/ui-react';

import { StatCounter } from '../components/StatCounter';
import { usePublicStats } from '../hooks/usePublicStats';

import { EcosystemDiagram } from './EcosystemDiagram';

export function Hero() {
  const { t } = useTranslation('landing');
  const { stats } = usePublicStats();

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-accent-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-brand-200/40 blur-3xl"
      />

      <div className="container-narrow grid min-h-[90vh] grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="success" size="lg" dot>
            {t('hero.badge')}
          </Badge>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>

          <p className="max-w-xl text-lg text-neutral-600">{t('hero.subtitle')}</p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/register?role=DIASPORA_INVESTOR">{t('hero.ctaInvest')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/register?role=COMMERCIAL_FARMER">{t('hero.ctaFarmer')}</Link>
            </Button>
          </div>

          <div className="mt-6 grid w-full grid-cols-3 gap-6 border-t border-neutral-200 pt-6">
            <StatCounter
              value={stats.totalFundedUsd}
              prefix="$"
              label={t('hero.statFunded')}
            />
            <StatCounter value={stats.activeContracts} label={t('hero.statContracts')} />
            <StatCounter value={stats.farmersReached} label={t('hero.statFarmers')} />
          </div>
        </div>

        <div className="relative">
          <EcosystemDiagram />
        </div>
      </div>
    </section>
  );
}
