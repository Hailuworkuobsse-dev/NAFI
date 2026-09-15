import {
  CheckCircle2,
  Database,
  FileCheck2,
  Fingerprint,
  Landmark,
  Lock,
  Scale,
  Server,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@nafi/ui-react';

const SECURITY_PILLARS = [
  {
    key: 'sandbox',
    title: 'NBE Regulatory Sandbox',
    tag: 'Directive #042 Authorized',
    description:
      "Operating under the National Bank of Ethiopia's fintech regulatory sandbox, with audited inward foreign currency remittance channels and approved capital repatriation guarantees.",
    icon: Landmark,
  },
  {
    key: 'escrow',
    title: 'Regulated Commercial Escrow',
    tag: 'Licensed Bank Custody',
    description:
      'Capital is never held by intermediaries. Funds reside in tripartite escrow accounts at Commercial Bank of Ethiopia and Tier-1 private banks, released strictly against verified milestones.',
    icon: Lock,
  },
  {
    key: 'audit',
    title: 'Audit-Grade Cryptographic Ledger',
    tag: 'Zero-Tamper Records',
    description:
      'Every milestone trigger, GPS coordinate check, input release, and waterfall payout is cryptographically hashed and dual-signed, providing an immutable audit trail for courts and regulators.',
    icon: FileCheck2,
  },
  {
    key: 'data',
    title: 'Ethiopian Sovereign Data Residency',
    tag: 'INSA Tier-III Compliant',
    description:
      'Farmer biometrics, national ID/Fayda credentials, and transaction metadata are hosted on sovereign servers within Ethiopian borders in full compliance with INSA data protection mandates.',
    icon: Server,
  },
] as const;

const COMPLIANCE_STANDARDS = [
  'Ethiopian Commercial Code Book V (Contract Farming Enforceability)',
  'National Bank of Ethiopia Directive #042 (Fintech Sandbox)',
  'ECX Electronic Warehouse Receipt Proclamation',
  'INSA National Cybersecurity Level-3 Compliance',
] as const;

export function Security() {
  const { t } = useTranslation('landing');

  return (
    <section id="security" className="py-16 sm:py-24 bg-white border-b border-neutral-200">
      <div className="container-narrow">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-800 mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-neutral-700" />
            <span>Institutional Governance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
            {t('security.title', 'Security, Sovereign Compliance & Legal Enforceability')}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
            Agricultural capital demands the highest institutional safeguards. NAFI operates within statutory Ethiopian financial regulations, commercial arbitration frameworks, and secure banking rails.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SECURITY_PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-neutral-50/60 p-6 transition-colors hover:border-neutral-300 hover:bg-white"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-neutral-200 shadow-2xs text-neutral-800">
                      <Icon className="h-5 w-5 text-brand-700" />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-neutral-500 bg-neutral-200/70 px-2 py-0.5 rounded">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900">
                    {t(`security.items.${item.key}.title`, item.title)}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {t(`security.items.${item.key}.description`, item.description)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compliance Footer Bar */}
        <div className="mt-8 rounded-2xl border border-neutral-200/80 bg-neutral-900 p-6 text-neutral-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 block mb-1">
                Legal Framework & Jurisdiction
              </span>
              <p className="text-sm font-semibold text-white">
                Legally binding smart contracts enforceable in the Federal High Court of Ethiopia
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {COMPLIANCE_STANDARDS.map((std) => (
                <span
                  key={std}
                  className="rounded-lg bg-neutral-800 border border-neutral-700/80 px-2.5 py-1 text-[11px] font-medium text-neutral-300"
                >
                  {std}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
