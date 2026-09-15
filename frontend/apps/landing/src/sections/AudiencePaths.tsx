import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Coins,
  Globe,
  Landmark,
  Scale,
  ShieldCheck,
  Tractor,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Badge, Button } from '@nafi/ui-react';

import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface AudienceDetail {
  key: 'diaspora' | 'farmers' | 'banks' | 'government';
  label: string;
  badge: string;
  headline: string;
  subheadline: string;
  description: string;
  icon: typeof Coins;
  points: string[];
  metrics: { label: string; value: string }[];
  ctaText: string;
  ctaUrl: string;
}

const AUDIENCE_DETAILS: AudienceDetail[] = [
  {
    key: 'diaspora',
    label: 'Diaspora Investors',
    badge: 'Foreign Exchange & Yield',
    headline: 'Invest in Verified Ethiopian Agriculture with Sovereign Protection',
    subheadline: 'Earn 13% – 17% APY in Foreign Currency with Escrow Safeguards',
    description:
      'Direct your remittances into productive agricultural asset pools. Your capital sits in NBE-monitored bank escrow, backed by 70% sovereign first-loss protection and automated smart contract waterfall distributions upon harvest export.',
    icon: Coins,
    points: [
      'Invest directly in USD, EUR, or GBP through licensed commercial banks',
      'Principal protected by 70% NAFA sovereign first-loss credit guarantee',
      'Full foreign currency repatriation rights for investment capital and profits',
      'Satellite NDVI health monitoring and harvest telemetry on your mobile device',
    ],
    metrics: [
      { label: 'Target Annual APY', value: '13.4% – 16.8%' },
      { label: 'Sovereign Guarantee', value: 'Up to 70%' },
      { label: 'Average Tenor', value: '6 – 10 Months' },
    ],
    ctaText: 'Open Diaspora Investor Account',
    ctaUrl: '/register?role=INVESTOR',
  },
  {
    key: 'farmers',
    label: 'Commercial Farmers & Unions',
    badge: 'Inputs & Guaranteed Off-Take',
    headline: 'Zero Upfront Cash for Certified Seeds & Fertilizer',
    subheadline: 'Eliminate Middleman Exploitation with Legally Binding Off-Take Floor Prices',
    description:
      'Access certified hybrid seeds, high-grade fertilizer, and mechanized services delivered straight to your farm gate with zero cash advance. Pay back only upon harvest delivery at guaranteed minimum floor prices.',
    icon: Tractor,
    points: [
      '100% in-kind financing for certified fertilizers, hybrid seeds, and tractor mechanization',
      'Guaranteed floor price contracts pegged to ECX 3-year historical medians',
      'Digital Electronic Warehouse Receipts (EWR) eliminate distress sales to brokers',
      'Agronomic support from certified Ministry of Agriculture extension officers',
    ],
    metrics: [
      { label: 'Upfront Cash Advance', value: '0 ETB' },
      { label: 'Average Yield Increase', value: '+42%' },
      { label: 'Floor Price Security', value: '100% Guaranteed' },
    ],
    ctaText: 'Register Farm or Cooperative',
    ctaUrl: '/register?role=FARMER',
  },
  {
    key: 'banks',
    label: 'Commercial Banks & MFIs',
    badge: 'De-Risked Agri-Lending',
    headline: 'Expand Agricultural Credit with 70% First-Loss Backstops',
    subheadline: 'Meet NBE Lending Directives with Zero Uncollateralized Risk',
    description:
      'Deploy lending facilities through automated tripartite escrow accounts. Every Birr lent is matched with diaspora foreign currency, monitored via milestone verification, and insured against systemic default.',
    icon: Building2,
    points: [
      '70% sovereign first-loss protection backed by NAFA and DBE RUFIP III facilities',
      'Tripartite escrow controls prevent diversion into unapproved cash withdrawals',
      'Automated priority loan recovery through ECX warehouse receipts and export revenues',
      'Real-time compliance reporting compliant with National Bank of Ethiopia prudential guidelines',
    ],
    metrics: [
      { label: 'Historical Default Rate', value: '< 0.9%' },
      { label: 'First-Loss Coverage', value: '70% NAFA' },
      { label: 'Capital Matching Ratio', value: '1 : 1.5' },
    ],
    ctaText: 'Integrate Bank Escrow Portal',
    ctaUrl: '/register?role=BANK',
  },
  {
    key: 'government',
    label: 'Regulators & Government',
    badge: 'Sovereign Macro Impact',
    headline: 'Channel Remittances into Food Security & Foreign Exchange',
    subheadline: 'Real-Time Oversight Under National Bank of Ethiopia Sandbox Directives',
    description:
      'Transform remittance inflows from immediate consumption into productive agricultural infrastructure. Monitor foreign exchange allocations, crop yields, and export settlement waterflows in real-time.',
    icon: Landmark,
    points: [
      'Real-time regulatory dashboard for NBE, Ministry of Agriculture, and DBE',
      'Formalizes contract farming under Book V of the Ethiopian Commercial Code',
      'Accelerates national food security goals and hard currency export generation',
      '100% auditable digital ledger with cryptographic transaction timestamps',
    ],
    metrics: [
      { label: 'Regulatory Framework', value: 'NBE Directive #042' },
      { label: 'Tax Neutrality Status', value: 'Article 12 Exempt' },
      { label: 'Audit Trail', value: 'Cryptographically Immutable' },
    ],
    ctaText: 'Access Regulatory Oversight Portal',
    ctaUrl: '/register?role=GOVERNMENT',
  },
];

export function AudiencePaths() {
  const { t } = useTranslation('landing');
  const sectionRef = useScrollAnimation();
  const [activeTab, setActiveTab] = useState<'diaspora' | 'farmers' | 'banks' | 'government'>('diaspora');

  const selectedAudience = AUDIENCE_DETAILS.find((a) => a.key === activeTab)!;
  const ActiveIcon = selectedAudience.icon;

  return (
    <section id="audience" className="py-16 sm:py-24 bg-neutral-50/70 border-b border-neutral-200">
      <div ref={sectionRef} className="container-narrow animate-on-scroll">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md bg-neutral-200/80 px-2.5 py-1 text-xs font-semibold text-neutral-800 mb-3">
            <Users className="h-3.5 w-3.5 text-neutral-700" />
            <span>Multi-Stakeholder Value</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
            {t('audience.title', 'Tailored Portals for Every Stakeholder')}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
            {t(
              'audience.subtitle',
              'Whether you are investing foreign currency, cultivating hectares, issuing credit, or governing national food reserves, NAFI aligns your incentives.',
            )}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
          {AUDIENCE_DETAILS.map((item) => {
            const Icon = item.icon;
            const isSelected = item.key === activeTab;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Detailed Workspace Card */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left 7 Cols */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 border border-brand-200 mb-3">
                  <ActiveIcon className="h-3.5 w-3.5" />
                  <span>{selectedAudience.badge}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                  {selectedAudience.headline}
                </h3>
                <p className="mt-1 text-sm font-semibold text-brand-700">
                  {selectedAudience.subheadline}
                </p>

                <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed">
                  {selectedAudience.description}
                </p>

                <div className="mt-6 space-y-3">
                  {selectedAudience.points.map((point) => (
                    <div key={point} className="flex items-start gap-3 text-sm text-neutral-800">
                      <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-wrap items-center gap-4">
                <Button asChild variant="solid" size="lg">
                  <Link to={selectedAudience.ctaUrl} className="gap-2">
                    <span>{selectedAudience.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <span className="text-xs text-neutral-500 font-medium">
                  Instant digital onboarding with Ethiopian ID, Fayda or Foreign Passport
                </span>
              </div>
            </div>

            {/* Right 5 Cols: Institutional Metrics & Compliance Card */}
            <div className="lg:col-span-5 rounded-xl border border-neutral-200/90 bg-neutral-50 p-6">
              <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3 mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Stakeholder Safeguards & KPIs
                </span>
                <span className="h-2 w-2 rounded-full bg-brand-500" />
              </div>

              <div className="space-y-4">
                {selectedAudience.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-lg bg-white p-3.5 border border-neutral-200/80 shadow-2xs">
                    <span className="text-[11px] font-medium text-neutral-500 block uppercase tracking-wide">
                      {metric.label}
                    </span>
                    <span className="text-lg font-mono font-bold text-neutral-900 mt-0.5 block">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-neutral-200/80 bg-white p-4 text-xs text-neutral-600 space-y-2">
                <div className="flex items-center gap-2 text-neutral-900 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-brand-600" />
                  <span>Sovereign Enforceability</span>
                </div>
                <p className="text-[11px] leading-relaxed text-neutral-500">
                  All contracts issued via this portal are legally registered under Ethiopian Commercial Code Book V and monitored under the National Bank of Ethiopia Fintech Sandbox.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
