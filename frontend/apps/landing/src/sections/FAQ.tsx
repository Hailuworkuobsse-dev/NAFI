import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FAQ_ITEMS = [
  {
    id: 'what',
    category: 'Architecture',
    q: 'What is the National Agri-Finance Infrastructure (NAFI)?',
    a: "NAFI is Ethiopia's authorized digital execution framework connecting diaspora capital, commercial bank escrows, the Development Bank of Ethiopia (DBE), and the National Agri-Finance Agency (NAFA). It facilitates formal contract farming governed by Book V of the Ethiopian Commercial Code with milestone-gated escrow releases and automated waterfall settlements.",
  },
  {
    id: 'howInvest',
    category: 'Diaspora',
    q: 'How does a diaspora investor participate and earn returns?',
    a: 'Diaspora members register and complete remote KYC via passport, Fayda ID, or origin ID. Investors browse verified agricultural pools and commit hard currency (USD, EUR, GBP) starting from $500. Yields (13% to 17% annualized) and principal are wired back in foreign currency through NBE-authorized commercial bank channels upon export sale.',
  },
  {
    id: 'risk',
    category: 'Risk & Guarantees',
    q: 'What happens in the event of adverse weather, crop failure, or contract dispute?',
    a: 'Every approved pool is protected by a multi-tier safety net: (1) NAFA provides up to 70% sovereign first-loss principal backstops; (2) In-season satellite NDVI monitors crop health early to trigger agronomic interventions; (3) Harvested crops deposited in ECX warehouses receive Electronic Warehouse Receipts that serve as enforceable collateral. Disputes are subject to expedited arbitration under the Ethiopian Arbitration and Conciliation Proclamation.',
  },
  {
    id: 'forex',
    category: 'Regulatory',
    q: 'Are diaspora returns and principal guaranteed for foreign exchange repatriation?',
    a: "Yes. Operating under National Bank of Ethiopia Directive #042 and the Investment Commission framework, diaspora capital entering through NAFI's commercial bank escrows receives registered FX conversion certificates, entitling investors to full repatriation of principal and accrued yields in original currency.",
  },
  {
    id: 'farmer',
    category: 'Farmers',
    q: 'How do Ethiopian commercial farmers and cooperatives qualify for zero-cash inputs?',
    a: 'Farming enterprises and registered cooperative unions submit land-use rights certificates, which are verified via GPS polygon mapping against the Ministry of Agriculture cadastre. Once approved, farmers receive certified seed and fertilizers delivered directly to their farm gate, agreeing to delivery at guaranteed floor prices with zero upfront cash required.',
  },
  {
    id: 'banks',
    category: 'Banking',
    q: 'How does NAFI integrate with Ethiopian commercial banks?',
    a: 'Partner commercial banks (including CBE, Awash, Dashen, and Co-op Bank) host the tripartite escrow accounts and disburse matching ETB working capital lines. Banks benefit from 70% NAFA risk-sharing, automated recovery from export proceeds, and real-time compliance auditing, allowing them to meet NBE agricultural credit quotas with minimal risk.',
  },
] as const;

export function FAQ() {
  const { t } = useTranslation('landing');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Diaspora', 'Risk & Guarantees', 'Regulatory', 'Farmers', 'Banking'] as const;

  const filteredItems = FAQ_ITEMS.filter((item) => {
    if (activeCategory === 'ALL') return true;
    return item.category === activeCategory;
  });

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white border-b border-neutral-200">
      <div className="container-narrow">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-800 mb-3">
            <HelpCircle className="h-3.5 w-3.5 text-neutral-700" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
            {t('faq.title', 'Clear Answers on Legal, Escrow & Return Mechanics')}
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed">
            Everything you need to know about investing, farming, regulatory compliance, and risk mitigation under NAFI.
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat === 'ALL' ? 'All Questions' : cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="mt-8">
          <RadixAccordion.Root
            type="single"
            collapsible
            defaultValue="what"
            className="space-y-3"
          >
            {filteredItems.map((item) => (
              <RadixAccordion.Item
                key={item.id}
                value={item.id}
                className="group rounded-xl border border-neutral-200 bg-neutral-50/50 overflow-hidden transition-colors data-[state=open]:bg-white data-[state=open]:border-brand-300"
              >
                <RadixAccordion.Header>
                  <RadixAccordion.Trigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-neutral-900 hover:text-brand-700">
                    <span className="text-sm sm:text-base">{item.q}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </RadixAccordion.Trigger>
                </RadixAccordion.Header>
                <RadixAccordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="px-5 pb-5 pt-1 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100">
                    {item.a}
                  </div>
                </RadixAccordion.Content>
              </RadixAccordion.Item>
            ))}
          </RadixAccordion.Root>
        </div>
      </div>
    </section>
  );
}
