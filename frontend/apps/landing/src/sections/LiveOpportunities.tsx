import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { formatMoney, formatWeight } from '@nafi/formatters';
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  InvestmentPoolProgress,
  Skeleton,
} from '@nafi/ui-react';

import { usePublicOpportunities } from '../hooks/usePublicOpportunities';

export function LiveOpportunities() {
  const { t } = useTranslation('landing');
  const { opportunities, isLoading } = usePublicOpportunities();

  return (
    <section id="opportunities" className="section-py bg-white">
      <div className="container-narrow flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {t('opportunities.eyebrow')}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl">
              {t('opportunities.title')}
            </h2>
            <p className="mt-2 text-lg text-neutral-600">{t('opportunities.subtitle')}</p>
          </div>
          <Button 
            asChild 
            variant="outline" 
            size="md" 
            trailingIcon={<ArrowRight className="h-4 w-4" />}
            className="group hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-colors"
          >
            <Link to="/opportunities">{t('opportunities.viewAll')}</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardBody>
                  <Skeleton className="h-56 w-full" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <EmptyState title={t('opportunities.empty')} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.slice(0, 6).map((opp: any) => (
              <Card key={opp.id} className="group flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-2">
                <CardBody className="flex flex-1 flex-col gap-5 p-6">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors">
                      {opp.targetCrop}
                    </h3>
                    <p className="text-sm text-neutral-500">{opp.region}</p>
                  </div>

                  <InvestmentPoolProgress
                    targetAmountEtb={opp.targetAmountEtb}
                    committedAmountEtb={opp.committedAmountEtb}
                    investorCount={opp.investorCount}
                  />

                  <div className="grid grid-cols-3 gap-3 border-t border-neutral-100 pt-4 text-xs">
                    <div>
                      <span className="text-neutral-500">{t('opportunities.targetYield')}</span>
                      <p className="mt-1 font-semibold text-neutral-900">
                        {formatWeight(opp.targetYieldKg)}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">{t('opportunities.floorPrice')}</span>
                      <p className="mt-1 font-semibold text-neutral-900">
                        {formatMoney(opp.floorPriceEtb, 'ETB')}/kg
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">{t('opportunities.maturity')}</span>
                      <p className="mt-1 font-semibold text-neutral-900">
                        {new Date(opp.maturityDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Button asChild variant="ghost" size="sm" fullWidth className="mt-auto group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <Link to={`/opportunities/${opp.id}`}>
                      {t('opportunities.learnMore')} <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
