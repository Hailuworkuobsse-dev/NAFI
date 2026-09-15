import { Coins, Globe2, Sprout, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatCompactMoney, formatNumber } from '@nafi/formatters';
import { StatCard } from '@nafi/ui-react';

import { usePublicStats } from '../hooks/usePublicStats';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function ImpactDashboard() {
  const { t } = useTranslation('landing');
  const { stats } = usePublicStats();
  const sectionRef = useScrollAnimation();

  return (
    <section id="impact" className="section-py bg-gradient-to-b from-white to-brand-50/50">
      <div ref={sectionRef} className="container-narrow flex flex-col gap-10 animate-on-scroll">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {t('impact.eyebrow')}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl">
            {t('impact.title')}
          </h2>
          <p className="mt-3 text-lg text-neutral-600">{t('impact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label={t('impact.metrics.capital')}
            value={formatCompactMoney(stats.totalFundedUsd, 'USD')}
            icon={<Coins className="h-6 w-6" />}
            className="group hover:shadow-xl transition-all hover:-translate-y-2 rounded-2xl border-neutral-200 bg-white"
          />
          <StatCard
            label={t('impact.metrics.hectares')}
            value={formatNumber(stats.hectaresUnderContract)}
            icon={<Globe2 className="h-6 w-6" />}
            className="group hover:shadow-xl transition-all hover:-translate-y-2 rounded-2xl border-neutral-200 bg-white"
          />
          <StatCard
            label={t('impact.metrics.farmers')}
            value={formatNumber(stats.farmersReached)}
            icon={<Users className="h-6 w-6" />}
            className="group hover:shadow-xl transition-all hover:-translate-y-2 rounded-2xl border-neutral-200 bg-white"
          />
          <StatCard
            label={t('impact.metrics.forex')}
            value={formatCompactMoney(stats.forexGeneratedUsd, 'USD')}
            icon={<TrendingUp className="h-6 w-6" />}
            className="group hover:shadow-xl transition-all hover:-translate-y-2 rounded-2xl border-neutral-200 bg-white"
          />
          <StatCard
            label={t('impact.metrics.jobs')}
            value={formatNumber(stats.jobsCreated)}
            icon={<Sprout className="h-6 w-6" />}
            className="group hover:shadow-xl transition-all hover:-translate-y-2 rounded-2xl border-neutral-200 bg-white"
          />
        </div>
      </div>
    </section>
  );
}
