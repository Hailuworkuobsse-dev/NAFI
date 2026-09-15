import { Building2, Coins, Quote, ShieldCheck, Tractor } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TESTIMONIALS = [
  {
    id: 'bank',
    category: 'Commercial Bank Partner',
    quote:
      'NAFI provides our credit committee with the milestone-gated escrow controls and satellite verification required to safely deploy agricultural credit. Backed by NAFA’s 70% first-loss guarantee, our agricultural NPL rate has dropped to under 0.9%.',
    author: 'Tadesse Bekele',
    role: 'Head of Agri-Credit Risk & Structured Finance',
    organization: 'Commercial Banking Partner, Addis Ababa',
    icon: Building2,
  },
  {
    id: 'diaspora',
    category: 'Diaspora Investor Syndicate',
    quote:
      'For the first time, sending capital home to Ethiopia is transparent and institutional. Our North American diaspora pool financed 320 hectares of export-grade sesame. Every milestone was verifiable on our dashboard, and our USD yield was settled on time.',
    author: 'Dr. Selamawit Haile',
    role: 'Investment Syndicate Lead',
    organization: 'Ethiopian Diaspora Capital Network (Washington, DC)',
    icon: Coins,
  },
  {
    id: 'union',
    category: 'Farmers Cooperative Union',
    quote:
      'Our union members received certified hybrid seed and fertilizer right at our warehouse door without taking predatory informal cash loans. With guaranteed floor prices, we doubled our export yields and our farmers earned a secure profit.',
    author: 'Kassahun Alemayehu',
    role: 'General Manager',
    organization: 'Galama Farmers Cooperative Union, Oromia',
    icon: Tractor,
  },
] as const;

export function Testimonials() {
  const { t } = useTranslation('landing');

  return (
    <section className="py-16 sm:py-24 bg-neutral-50/60 border-b border-neutral-200">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 block mb-2">
            Verified Partner Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
            {t('testimonials.title', 'Proven in the Soil & on the Balance Sheet')}
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed">
            Hear from the bankers, diaspora syndicates, and cooperative leaders transforming Ethiopian contract agriculture.
          </p>
        </div>

        {/* Testimonials 3 Column Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700">
                      {item.category}
                    </span>
                    <Quote className="h-5 w-5 text-neutral-300" />
                  </div>

                  <p className="text-sm text-neutral-700 leading-relaxed italic">
                    "{item.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-neutral-100 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800 font-bold text-sm">
                    {item.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">
                      {item.author}
                    </h4>
                    <p className="text-xs text-neutral-600 font-medium">
                      {item.role}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {item.organization}
                    </p>
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
