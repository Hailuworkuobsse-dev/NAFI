import { Building2, Landmark, Scale, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const INSTITUTIONAL_PARTNERS = [
  {
    acronym: 'NBE',
    name: 'National Bank of Ethiopia',
    role: 'Regulatory Sandbox Oversight',
    icon: Landmark,
  },
  {
    acronym: 'DBE',
    name: 'Development Bank of Ethiopia',
    role: 'RUFIP III Co-Financing',
    icon: Building2,
  },
  {
    acronym: 'MoA',
    name: 'Ministry of Agriculture',
    role: 'Agronomic Certification',
    icon: Scale,
  },
  {
    acronym: 'NAFA',
    name: 'National Agri-Finance Agency',
    role: '70% Sovereign First-Loss Guarantee',
    icon: ShieldCheck,
  },
  {
    acronym: 'EIC',
    name: 'Ethiopian Investment Commission',
    role: 'Diaspora FDI Facilitation',
    icon: Building2,
  },
  {
    acronym: 'ECX',
    name: 'Ethiopian Commodity Exchange',
    role: 'Electronic Warehouse Receipts',
    icon: Landmark,
  },
  {
    acronym: 'COMMERCIAL BANKS',
    name: 'CBE, Awash, Dashen & Co.',
    role: 'Tripartite Escrow Custody',
    icon: Building2,
  },
  {
    acronym: 'IFAD / WORLD BANK',
    name: 'Multilateral Partners',
    role: 'Technical & Extension Support',
    icon: Scale,
  },
] as const;

export function TrustBar() {
  const { t } = useTranslation('landing');

  return (
    <section className="border-b border-neutral-200 bg-neutral-50/50 py-10">
      <div className="container-narrow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200/60 pb-6 mb-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
              Institutional Framework
            </span>
            <h3 className="text-sm font-bold text-neutral-800">
              {t('trustBar.title', 'Operating Under Sovereign Regulatory & Institutional Partnerships')}
            </h3>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            <span>Legally binding under Book V of the Ethiopian Commercial Code</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {INSTITUTIONAL_PARTNERS.map((partner) => {
            const Icon = partner.icon;
            return (
              <div
                key={partner.acronym}
                className="flex items-start gap-3 rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-2xs hover:border-brand-300 transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                  <Icon className="h-4 w-4 text-brand-700" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-neutral-900">
                      {partner.acronym}
                    </span>
                  </div>
                  <p className="truncate text-xs font-medium text-neutral-700">
                    {partner.name}
                  </p>
                  <p className="truncate text-[11px] text-neutral-500 font-normal">
                    {partner.role}
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
