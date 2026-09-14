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

import { usePublicOpportunities } from '@/hooks/usePublicOpportunities';

export function LiveOpportunities() {
  const { t } = useTranslation('landing');
  const { opportunities, isLoading } = usePublicOpportunities();

  return (
    <section id="opportunities" className="section-py bg-neutral-50">
      <div className="container-narrow flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              {t('opportunities.title')}
            </h2>
            <p className="mt-2 text-lg text-neutral-600">{t('opportunities.subtitle')}</p>
          </div>
          <Button asChild variant="ghost" size="sm" trailingIcon={<ArrowRight className="h-4 w-4" />}>
            <Link to="/opportunities">{t('opportunities.viewAll')}</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <CardBody>
                  <Skeleton className="h-48 w-full" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <EmptyState title={t('opportunities.empty')} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.slice(0, 6).map((opp) => (
              <Card key={opp.id} className="flex flex-col">
                <CardBody className="flex flex-1 flex-col gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">{opp.targetCrop}</h3>
                    <p className="text-xs text-neutral-500">{opp.region}</p>
                  </div>

                  <InvestmentPoolProgress
                    targetAmountEtb={opp.targetAmountEtb}
                    committedAmountEtb={opp.committedAmountEtb}
                    investorCount={opp.investorCount}
                  />

                  <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-xs">
                    <div>
                      <span className="text-neutral-500">{t('opportunities.targetYield')}</span>
                      <p className="mt-0.5 font-medium text-neutral-900">
                        {formatWeight(opp.targetYieldKg)}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">{t('opportunities.floorPrice')}</span>
                      <p className="mt-0.5 font-medium text-neutral-900">
                        {formatMoney(opp.floorPriceEtb, 'ETB')}/kg
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">{t('opportunities.maturity')}</span>
                      <p className="mt-0.5 font-medium text-neutral-900">
                        {new Date(opp.maturityDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
