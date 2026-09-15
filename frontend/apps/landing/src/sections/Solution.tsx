import { ArrowRight, CheckCircle2, Lock, Shield, Sparkles, SplitSquareVertical, Warehouse } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '@nafi/ui-react';

import { useScrollAnimation } from '../hooks/useScrollAnimation';

const PILLARS = [
  {
    id: 'escrow',
    number: '01',
    title: 'Tripartite Bank Escrow Custody',
    subtitle: 'Zero Unverified Capital Disbursement',
    description:
      'Investor hard currency and commercial bank matching funds sit in regulated escrow accounts at CBE and partner banks. Capital is disbursed exclusively against GPS-tagged agronomic checkpoints and verified input deliveries.',
    icon: Lock,
    benefits: ['Regulated commercial bank escrow', 'Milestone-gated capital release', 'Zero misappropriation risk'],
  },
  {
    id: 'guarantee',
    number: '02',
    title: '70% Sovereign First-Loss Protection',
    subtitle: 'De-Risking Commercial Bank Lending',
    description:
      'The National Agricultural Finance Agency (NAFA) and the Development Bank of Ethiopia provide up to 70% sovereign credit backstops, transforming high-risk commercial farming into an institutional-grade asset class.',
    icon: Shield,
    benefits: ['Up to 70% principal backstop', 'DBE RUFIP III co-financing', 'Sovereign risk-sharing framework'],
  },
  {
    id: 'receipts',
    number: '03',
    title: 'Electronic Warehouse Receipts (EWR)',
    subtitle: 'Liquid Collateral Backed by Harvest',
    description:
      'Harvested commodities deposited into ECX-certified bonded warehouses receive digital warehouse receipts. These act as liquid, legally enforceable collateral under Book V of the Ethiopian Commercial Code.',
    icon: Warehouse,
    benefits: ['ECX certified quality grading', 'Instant digital collateral lien', 'Eliminates side-selling disputes'],
  },
  {
    id: 'waterfall',
    number: '04',
    title: 'Automated FX Waterfall Settlement',
    subtitle: 'Direct Algorithmic Payouts',
    description:
      'Upon export sale, buyer hard currency flows into escrow and is automatically split by smart ledger rules: input suppliers paid first, bank loans serviced, diaspora returns wired in forex, and farmer profits credited.',
    icon: SplitSquareVertical,
    benefits: ['Priority-ordered algorithmic splits', 'Forex repatriation compliant', 'Full immutable audit trail'],
  },
] as const;

export function Solution() {
  const { t } = useTranslation('landing');
  const sectionRef = useScrollAnimation();

  return (
    <section id="solution" className="py-16 sm:py-24 bg-white border-b border-neutral-200">
      <div ref={sectionRef} className="container-narrow animate-on-scroll">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-900 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-brand-700" />
              <span>The NAFI Solution Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
              {t('solution.title', 'Four Pillars of Institutional Agrifinance')}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
              {t(
                'solution.subtitle',
                'By combining digital smart contracts with sovereign risk-sharing and commercial bank escrows, NAFI replaces informal trust with automated financial certainty.',
              )}
            </p>
          </div>

          <div className="shrink-0">
            <Button asChild variant="outline" size="md">
              <a href="#architecture">Explore Interactive Architecture</a>
            </Button>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6 sm:p-8 flex flex-col justify-between transition-colors hover:border-brand-300 hover:bg-white"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                      PILLAR {pillar.number}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-neutral-200 shadow-2xs text-brand-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                    {pillar.title}
                  </h3>
                  <span className="block text-xs font-semibold text-brand-700 mt-1 mb-3">
                    {pillar.subtitle}
                  </span>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-neutral-200/80">
                  <div className="space-y-1.5">
                    {pillar.benefits.map((b) => (
                      <div key={b} className="flex items-center gap-2 text-xs text-neutral-700 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
