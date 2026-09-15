import {
  ArrowRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Filter,
  MapPin,
  ShieldCheck,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { formatMoney, formatWeight } from '@nafi/formatters';
import { Badge, Button, EmptyState, InvestmentPoolProgress, Skeleton } from '@nafi/ui-react';

import { usePublicOpportunities } from '../hooks/usePublicOpportunities';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const CROP_FILTERS = [
  'ALL',
  'Coffee',
  'Sesame',
  'Soybean',
  'Wheat',
] as const;

export function LiveOpportunities() {
  const { t } = useTranslation('landing');
  const { opportunities, isLoading } = usePublicOpportunities();
  const sectionRef = useScrollAnimation();
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');

  const filteredOpportunities = opportunities.filter((opp: any) => {
    if (selectedCrop === 'ALL') return true;
    return opp.targetCrop?.toLowerCase().includes(selectedCrop.toLowerCase());
  });

  return (
    <section id="opportunities" className="py-16 sm:py-24 bg-white border-b border-neutral-200">
      <div ref={sectionRef} className="container-narrow animate-on-scroll">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-900 mb-3">
              <Sprout className="h-3.5 w-3.5 text-brand-700" />
              <span>Institutional Primary Market</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
              {t('opportunities.title', 'Active Tripartite Agricultural Pools')}
            </h2>
            <p className="mt-3 text-base text-neutral-600 leading-relaxed">
              {t(
                'opportunities.subtitle',
                'Pre-vetted, commercial-scale production contracts with verified land titling, guaranteed export off-take, and regulated escrow custody.',
              )}
            </p>
          </div>

          <div className="shrink-0">
            <Button asChild variant="outline" size="md" className="gap-2">
              <Link to="/opportunities">
                <span>{t('opportunities.viewAll', 'View All Opportunities')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Commodity Filter Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mr-2">
            <Filter className="h-3.5 w-3.5 text-neutral-400" />
            <span>Filter Commodity:</span>
          </div>
          {CROP_FILTERS.map((crop) => {
            const isSelected = selectedCrop === crop;
            return (
              <button
                key={crop}
                type="button"
                onClick={() => setSelectedCrop(crop)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {crop === 'ALL' ? 'All Active Pools' : crop}
              </button>
            );
          })}
        </div>

        {/* Opportunities Grid */}
        {isLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-neutral-200 p-6">
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title={t('opportunities.empty', 'No opportunities found in this category')}
              description="New agricultural pools are being audited under NBE sandbox protocols. Check back soon."
            />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOpportunities.slice(0, 6).map((opp: any) => {
              const committed = opp.committedAmountEtb || 0;
              const target = opp.targetAmountEtb || 1;
              const percent = Math.min(100, Math.round((committed / target) * 100));

              return (
                <div
                  key={opp.id}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs transition-colors hover:border-brand-300"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                        <span className="truncate">{opp.region || 'Oromia, Ethiopia'}</span>
                      </div>
                      <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-800 border border-brand-200">
                        70% NAFA Backstop
                      </span>
                    </div>

                    {/* Title & Pool Target */}
                    <h3 className="text-lg font-bold text-neutral-900 line-clamp-1">
                      {opp.targetCrop} Commercial Pool
                    </h3>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-mono text-xl font-extrabold text-neutral-900">
                        {formatMoney(opp.targetAmountEtb, 'ETB')}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">
                        (~${Math.round(opp.targetAmountEtb / 145).toLocaleString()} USD)
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mt-5">
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-neutral-600">Funded: {percent}%</span>
                        <span className="text-brand-700">{opp.investorCount || 12} Backers</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-600 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Termsheet Data Points */}
                    <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-neutral-50 p-3 text-center border border-neutral-100">
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                          {t('opportunities.targetYield', 'Yield')}
                        </span>
                        <span className="font-mono text-xs font-bold text-neutral-800">
                          {formatWeight(opp.targetYieldKg)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                          {t('opportunities.floorPrice', 'Floor')}
                        </span>
                        <span className="font-mono text-xs font-bold text-neutral-800">
                          {formatMoney(opp.floorPriceEtb, 'ETB')}/kg
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                          {t('opportunities.maturity', 'Tenor')}
                        </span>
                        <span className="font-mono text-xs font-bold text-neutral-800">
                          {new Date(opp.maturityDate).toLocaleDateString(undefined, {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Escrow badge */}
                  <div className="mt-6 pt-4 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-neutral-400" />
                        <span>Escrow: CBE / Awash</span>
                      </span>
                      <span className="flex items-center gap-1 text-brand-700 font-semibold">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Book V Enforceable</span>
                      </span>
                    </div>

                    <Button asChild variant="outline" size="sm" fullWidth className="hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors">
                      <Link to={`/opportunities/${opp.id}`}>
                        <span>{t('opportunities.learnMore', 'Inspect Termsheet')}</span>
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
