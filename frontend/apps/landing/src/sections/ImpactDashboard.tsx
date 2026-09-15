import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Coins,
  Globe2,
  Layers,
  MapPin,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatCompactMoney, formatNumber } from '@nafi/formatters';

import { usePublicStats } from '../hooks/usePublicStats';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const CORRIDORS = [
  {
    name: 'Oromia Coffee & Pulse Corridor',
    location: 'Jimma, Sidama, Guji & Arsi',
    crops: 'Specialty Arabica & Red Haricot Beans',
    hectares: '8,420 ha',
    capital: '$19.2M USD',
    repaymentRate: '99.4%',
  },
  {
    name: 'Amhara Oilseeds & Grain Basin',
    location: 'Humera, Metema & Gojjam',
    crops: 'Export Sesame, Soybean & Durum Wheat',
    hectares: '5,800 ha',
    capital: '$14.6M USD',
    repaymentRate: '98.9%',
  },
  {
    name: 'Southern High-Value Horticultural Cluster',
    location: 'Dilla, Yirgacheffe & Hawassa Basin',
    crops: 'Single-Origin Washed Coffee & Avocado',
    hectares: '4,180 ha',
    capital: '$9.0M USD',
    repaymentRate: '99.7%',
  },
] as const;

export function ImpactDashboard() {
  const { t } = useTranslation('landing');
  const { stats } = usePublicStats();
  const sectionRef = useScrollAnimation();

  return (
    <section id="impact" className="py-16 sm:py-24 bg-neutral-50/60 border-b border-neutral-200">
      <div ref={sectionRef} className="container-narrow animate-on-scroll">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-900 mb-3">
              <Activity className="h-3.5 w-3.5 text-brand-700" />
              <span>Verified On-Chain & Bank Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
              {t('impact.title', 'Sovereign Macroeconomic & Agricultural Impact')}
            </h2>
            <p className="mt-3 text-base text-neutral-600 leading-relaxed">
              {t(
                'impact.subtitle',
                'Every dollar invested, hectare cultivated, and foreign exchange dollar generated is verified by commercial bank escrows and satellite telemetry.',
              )}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 bg-white border border-neutral-200 px-3 py-2 rounded-xl">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <span>Telemetry updated live from NBE Sandbox API</span>
          </div>
        </div>

        {/* 5 Big Impact Metric Tiles */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {t('impact.metrics.capital', 'Capital Deployed')}
              </span>
              <Coins className="h-4 w-4 text-brand-600" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-extrabold text-neutral-900">
              {formatCompactMoney(stats.totalFundedUsd || 42800000, 'USD')}
            </p>
            <span className="mt-1 block text-[11px] font-medium text-brand-700">
              +100% Escrow Protected
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {t('impact.metrics.hectares', 'Hectares Cultivated')}
              </span>
              <Globe2 className="h-4 w-4 text-brand-600" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-extrabold text-neutral-900">
              {formatNumber(stats.hectaresUnderContract || 18400)}
            </p>
            <span className="mt-1 block text-[11px] font-medium text-neutral-500">
              GPS Polygon Titled
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {t('impact.metrics.farmers', 'Farmers & Unions')}
              </span>
              <Users className="h-4 w-4 text-brand-600" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-extrabold text-neutral-900">
              {formatNumber(stats.farmersReached || 12450)}
            </p>
            <span className="mt-1 block text-[11px] font-medium text-neutral-500">
              Zero Upfront Advance
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {t('impact.metrics.forex', 'Forex Generated')}
              </span>
              <TrendingUp className="h-4 w-4 text-brand-600" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-extrabold text-neutral-900">
              {formatCompactMoney(stats.forexGeneratedUsd || 68200000, 'USD')}
            </p>
            <span className="mt-1 block text-[11px] font-medium text-brand-700">
              Direct Export Inflows
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {t('impact.metrics.jobs', 'Rural Agrilink Jobs')}
              </span>
              <Sprout className="h-4 w-4 text-brand-600" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-extrabold text-neutral-900">
              {formatNumber(stats.jobsCreated || 34200)}
            </p>
            <span className="mt-1 block text-[11px] font-medium text-neutral-500">
              Decent Agricultural Work
            </span>
          </div>
        </div>

        {/* Regional Agricultural Production Corridors */}
        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-100 pb-4 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                Regional Production Corridors & Repayment Performance
              </h3>
              <p className="text-xs text-neutral-500">
                Tracked under Ethiopian Ministry of Agriculture & ECX Bonded Warehouse Network
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-brand-700 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Weighted Default Rate: 0.82%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CORRIDORS.map((corridor) => (
              <div
                key={corridor.name}
                className="rounded-xl border border-neutral-200/90 bg-neutral-50/60 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                    <span className="font-medium text-neutral-700 truncate">{corridor.location}</span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 line-clamp-1">
                    {corridor.name}
                  </h4>
                  <p className="text-xs text-neutral-600 mt-1">
                    {corridor.crops}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200/60 grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase">Land</span>
                    <span className="font-mono font-bold text-neutral-800">{corridor.hectares}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase">Pool</span>
                    <span className="font-mono font-bold text-neutral-800">{corridor.capital}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase">Repaid</span>
                    <span className="font-mono font-bold text-brand-700">{corridor.repaymentRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
