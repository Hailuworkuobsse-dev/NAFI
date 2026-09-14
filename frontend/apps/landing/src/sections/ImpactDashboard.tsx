import { Coins, Globe2, Sprout, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatCompactMoney, formatNumber } from '@nafi/formatters';
import { StatCard } from '@nafi/ui-react';

import { usePublicStats } from '../hooks/usePublicStats';

export function ImpactDashboard() {
  const { t } = useTranslation('landing');
  const { stats } = usePublicStats();

  return (
    <section id="impact" className="section-py bg-white">
      <div className="container-narrow flex flex-col gap-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{t('impact.title')}</h2>
          <p className="mt-3 text-lg text-neutral-600">{t('impact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label={t('impact.metrics.capital')}
            value={formatCompactMoney(stats.totalFundedUsd, 'USD')}
            icon={<Coins className="h-5 w-5" />}
          />
          <StatCard
            label={t('impact.metrics.hectares')}
            value={formatNumber(stats.hectaresUnderContract)}
            icon={<Globe2 className="h-5 w-5" />}
          />
          <StatCard
            label={t('impact.metrics.farmers')}
            value={formatNumber(stats.farmersReached)}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label={t('impact.metrics.forex')}
            value={formatCompactMoney(stats.forexGeneratedUsd, 'USD')}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            label={t('impact.metrics.jobs')}
            value={formatNumber(stats.jobsCreated)}
            icon={<Sprout className="h-5 w-5" />}
          />
        </div>
      </div>
    </section>
  );
}
