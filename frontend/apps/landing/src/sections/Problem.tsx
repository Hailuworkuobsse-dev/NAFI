import { AlertTriangle, ArrowUpRight, Ban, Coins, FileWarning, Layers, PackageX, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useScrollAnimation } from '../hooks/useScrollAnimation';

const PROBLEMS = [
  {
    key: 'credit',
    metric: '<10%',
    metricLabel: 'Bank Credit Allocation',
    comparison: 'vs 64% of national workforce',
    title: 'The Agricultural Credit Ceiling',
    description:
      'Despite generating over 34% of GDP and employing 64% of Ethiopians, commercial banks allocate less than a tenth of lending to agriculture due to strict immovable collateral mandates.',
    icon: TrendingDown,
    tag: 'Financing Bottleneck',
  },
  {
    key: 'diaspora',
    metric: '$5.1B',
    metricLabel: 'Annual Remittance Inflow',
    comparison: '88% spent on consumable imports',
    title: 'The Remittance Paradox',
    description:
      'Billions in diaspora hard currency flow into Ethiopia every year, but virtually none is mobilized into productive agricultural assets due to currency risk, lack of transparency, and zero institutional channels.',
    icon: Coins,
    tag: 'Capital Mismatch',
  },
  {
    key: 'enforcement',
    metric: '35%+',
    metricLabel: 'Contract Dispute Rate',
    comparison: 'Unenforceable informal agreements',
    title: 'Side-Selling & Contract Breach',
    description:
      'Paper agreements collapse whenever market prices fluctuate. Farmers side-sell to predatory brokers, while off-takers renege on floor prices with zero judicial or digital recourse.',
    icon: FileWarning,
    tag: 'Execution Risk',
  },
  {
    key: 'leakage',
    metric: '22%',
    metricLabel: 'Input Value Leakage',
    comparison: 'Untracked supply chain divergence',
    title: 'Subsidized Input Divergence',
    description:
      'Subsidized fertilizer and certified hybrid seeds frequently fail to reach commercial farms on time. Without geo-verified handoffs, agricultural capital is lost before planting even begins.',
    icon: PackageX,
    tag: 'Operational Friction',
  },
] as const;

export function Problem() {
  const { t } = useTranslation('landing');
  const sectionRef = useScrollAnimation();

  return (
    <section id="problem" className="py-16 sm:py-20 bg-neutral-50/70 border-b border-neutral-200">
      <div ref={sectionRef} className="container-narrow animate-on-scroll">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 mb-3">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
            <span>The Agricultural Financing Bottleneck</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
            {t('problem.title', 'Why Traditional Agri-Finance Fails in Ethiopia')}
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed">
            Conventional banking models treat agriculture as an uninsurable risk. A broken financial architecture separates abundant global capital from Ethiopia's most productive soils.
          </p>
        </div>

        {/* Analytical Bento Cards Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROBLEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs transition-colors hover:border-neutral-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Metric Bar */}
                  <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-5 mb-5">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-3xl sm:text-4xl font-extrabold text-neutral-900">
                          {item.metric}
                        </span>
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                          {item.metricLabel}
                        </span>
                      </div>
                      <span className="mt-1 block text-xs font-medium text-amber-700">
                        {item.comparison}
                      </span>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                      <Icon className="h-5 w-5 text-neutral-800" />
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                    {t(`problem.items.${item.key}.title`, item.title)}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                    {t(`problem.items.${item.key}.description`, item.description)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
