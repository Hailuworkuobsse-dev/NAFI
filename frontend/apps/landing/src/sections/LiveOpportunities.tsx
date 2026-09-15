import { ArrowRight, TrendingUp, MapPin, Sprout } from 'lucide-react';
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
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function LiveOpportunities() {
  const { t } = useTranslation('landing');
  const { opportunities, isLoading } = usePublicOpportunities();
  const sectionRef = useScrollAnimation();

  return (
    <section id="opportunities" className="section-py bg-gradient-to-b from-white to-brand-50/30">
      <div ref={sectionRef} className="container-narrow flex flex-col gap-10 animate-on-scroll">
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
            className="group hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all hover:-translate-y-1 shadow-md hover:shadow-lg"
          >
            <Link to="/opportunities">{t('opportunities.viewAll')}</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="overflow-hidden rounded-2xl">
                <CardBody>
                  <Skeleton className="h-64 w-full" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <EmptyState title={t('opportunities.empty')} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.slice(0, 6).map((opp: any) => (
              <Card key={opp.id} className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-neutral-200">
                {/* Card Header Image Placeholder */}
                <div className="relative h-40 bg-gradient-to-br from-brand-100 to-accent-100 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sprout className="h-16 w-16 text-brand-300 opacity-50" />
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-brand-700">
                    {formatMoney(opp.targetAmountEtb, 'ETB')}
                  </div>
                </div>
                
                <CardBody className="flex flex-1 flex-col gap-5 p-6">
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-neutral-400" />
                      <span className="text-xs text-neutral-500">{opp.region}</span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 group-hover:text-brand-600 transition-colors">
                      {opp.targetCrop}
                    </h3>
                  </div>

                  <InvestmentPoolProgress
                    targetAmountEtb={opp.targetAmountEtb}
                    committedAmountEtb={opp.committedAmountEtb}
                    investorCount={opp.investorCount}
                  />

                  <div className="grid grid-cols-3 gap-3 border-t border-neutral-100 pt-4">
                    <div className="text-center p-2 rounded-lg bg-neutral-50 group-hover:bg-brand-50 transition-colors">
                      <TrendingUp className="h-4 w-4 mx-auto mb-1 text-neutral-400" />
                      <span className="text-[10px] text-neutral-500 block">{t('opportunities.targetYield')}</span>
                      <p className="font-bold text-neutral-900 text-sm">
                        {formatWeight(opp.targetYieldKg)}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-neutral-50 group-hover:bg-brand-50 transition-colors">
                      <span className="text-[10px] text-neutral-500 block">{t('opportunities.floorPrice')}</span>
                      <p className="font-bold text-neutral-900 text-sm">
                        {formatMoney(opp.floorPriceEtb, 'ETB')}/kg
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-neutral-50 group-hover:bg-brand-50 transition-colors">
                      <span className="text-[10px] text-neutral-500 block">{t('opportunities.maturity')}</span>
                      <p className="font-bold text-neutral-900 text-sm">
                        {new Date(opp.maturityDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Button asChild variant="ghost" size="sm" fullWidth className="mt-auto group-hover:bg-gradient-to-r group-hover:from-brand-500 group-hover:to-brand-600 group-hover:text-white transition-all shadow-sm hover:shadow-md">
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
