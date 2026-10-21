import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  FileCheck2,
  Lock,
  PackageCheck,
  ShieldCheck,
  Sprout,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Badge, Button } from '@nafi/ui-react';

import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface LifecycleStage {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  duration: string;
  partiesInvolved: string[];
  description: string;
  actionDetails: string[];
  verificationArtifact: string;
  icon: typeof UserCheck;
}

const LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    id: 'onboard',
    stepNumber: '01',
    title: 'Digital KYC & Tripartite Contract Witness',
    subtitle: 'Legal Establishment of the Agricultural Pool',
    duration: 'Day 1 - 5',
    partiesInvolved: ['Commercial Farmer', 'Commercial Bank', 'Government Digital Witness'],
    description:
      'Farmer or cooperative unions complete land mapping via GPS polygon titling. A tripartite smart contract is digitally signed and witnessed under Book V of the Ethiopian Commercial Code.',
    actionDetails: [
      'GPS farm polygon boundary verified with Ministry of Agriculture registry',
      'Guaranteed floor price locked pegged to ECX 3-year historical median',
      'Government officer digital signature acts as legal sovereign witness',
    ],
    verificationArtifact: 'Contract Hash #NAFI-ET-2026-WITNESSED',
    icon: FileCheck2,
  },
  {
    id: 'fund',
    stepNumber: '02',
    title: 'Capital Mobilization & Bank Escrow Lock',
    subtitle: 'Diaspora FX and Commercial Bank Matching',
    duration: 'Day 6 - 15',
    partiesInvolved: ['Diaspora Investors', 'Commercial Bank', 'NAFA First-Loss Fund'],
    description:
      'Diaspora investors commit hard currency (USD/EUR) into an NBE regulated account. The partner commercial bank matches the pool with low-cost ETB credit facilities backed by 70% NAFA guarantee.',
    actionDetails: [
      'Foreign currency deposited into NBE-regulated commercial bank custody',
      'Bank unlocks matching ETB working capital facility at concessional rate',
      'Zero funds can be withdrawn as unverified physical cash',
    ],
    verificationArtifact: 'Tripartite Escrow Ledger Balance: $100,000 + 15M ETB',
    icon: Coins,
  },
  {
    id: 'deploy',
    stepNumber: '03',
    title: 'Geo-Verified Input Delivery',
    subtitle: 'Certified Fertilizer & Hybrid Seed Hand-off',
    duration: 'Planting Window (Week 3 - 4)',
    partiesInvolved: ['Certified Input Supplier', 'Commercial Farmer', 'Agronomy Inspector'],
    description:
      'Suppliers dispatch certified inputs directly to the farm gate. Payment from the bank escrow is only released upon simultaneous GPS timestamp match and farmer biometric/OTP confirmation.',
    actionDetails: [
      'Physical QR-code scanning at farm gate with GPS coordinate check',
      'Farmer inputs mobile OTP authorization on delivery',
      'Automated partial escrow release directly to supplier account',
    ],
    verificationArtifact: 'Delivery Verification: 450 Qtl Certified Seed Confirmed',
    icon: PackageCheck,
  },
  {
    id: 'produce',
    stepNumber: '04',
    title: 'Agronomic Monitoring & ECX Warehouse Receipt',
    subtitle: 'Harvest Deposition & Collateral Tokenization',
    duration: 'Growing & Harvest (Months 2 - 8)',
    partiesInvolved: ['Commercial Farmer', 'ECX Warehouse', 'MoA Extension Officer'],
    description:
      'Crops are monitored via satellite NDVI health checks. Upon harvest, produce is deposited into an ECX-certified bonded warehouse, generating an Electronic Warehouse Receipt (EWR) as liquid collateral.',
    actionDetails: [
      'Bi-weekly satellite vegetative index (NDVI) alerts to protect harvest yield',
      'Warehouse grading for moisture, purity, and export quality standardization',
      'EWR issued on the NAFI ledger as liquid, enforceable collateral',
    ],
    verificationArtifact: 'ECX Electronic Warehouse Receipt #EWR-AA-90823',
    icon: Sprout,
  },
  {
    id: 'settle',
    stepNumber: '05',
    title: 'Export Sale & Automated Waterfall Distribution',
    subtitle: 'Transparent Priority Multi-Party Settlement',
    duration: 'Settlement Window (Within 48h of Export Sale)',
    partiesInvolved: ['Export Buyer', 'Diaspora Investor', 'Commercial Bank', 'Farmer'],
    description:
      'The international off-taker deposits hard currency directly into the tripartite escrow. The smart ledger distributes proceeds strictly by algorithmic priority with 100% auditability.',
    actionDetails: [
      'Priority 1: Commercial bank loan principal and interest cleared',
      'Priority 2: Input supplier accounts receivable finalized',
      'Priority 3: Diaspora investor principal returned with agreed FX yield (13-17%)',
      'Priority 4: Farmer receives remaining surplus directly to commercial bank account',
    ],
    verificationArtifact: 'NBE Approved FX Settlement Batch #SETTLE-88910',
    icon: BadgeCheck,
  },
];

export function HowItWorks() {
  const { t } = useTranslation('landing');
  const sectionRef = useScrollAnimation();
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const activeStage = LIFECYCLE_STAGES[activeStageIndex]!;
  const ActiveIcon = activeStage.icon;

  return (
    <section id="how" className="py-16 sm:py-24 bg-white border-b border-neutral-200">
      <div ref={sectionRef} className="container-narrow animate-on-scroll">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-900 mb-3">
            <Clock className="h-3.5 w-3.5 text-brand-700" />
            <span>End-to-End Contract Lifecycle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
            {t('how.title', 'How the NAFI Smart Contract Lifecycle Works')}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
            {t(
              'how.subtitle',
              'A structured 5-stage pipeline connecting diaspora capital, commercial banks, inputs, and export markets with algorithmic certainty.',
            )}
          </p>
        </div>

        {/* Stepper Navigation Bar */}
        <div className="mt-12">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-neutral-200 pb-4">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = idx === activeStageIndex;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStageIndex(idx)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isActive ? 'bg-brand-500 text-white' : 'bg-white border border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold">{stage.stepNumber}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold truncate">
                      {stage.title.split('&')[0]}
                    </span>
                    <span className={`block text-[10px] truncate ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {stage.duration}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Detailed Breakdown & Visual Artifact */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Actionable Details */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
                  <ActiveIcon className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-brand-700 uppercase tracking-wider">
                    PHASE {activeStage.stepNumber} · {activeStage.duration}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
                    {activeStage.title}
                  </h3>
                </div>
              </div>

              <p className="text-base text-neutral-700 leading-relaxed mt-4 font-normal">
                {activeStage.description}
              </p>

              {/* Parties involved badges */}
              <div className="mt-5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">
                  Parties Involved in this Stage:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeStage.partiesInvolved.map((party) => (
                    <Badge key={party} variant="outline" size="sm" className="bg-white border border-neutral-200 text-neutral-800">
                      {party}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action verification checklist */}
              <div className="mt-6 space-y-2.5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">
                  Enforced Protocol Checkpoints:
                </span>
                {activeStage.actionDetails.map((action) => (
                  <div key={action} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-800">
                    <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 5 Columns: Verified Digital Ledger Artifact Preview */}
            <div className="lg:col-span-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-600" />
                  <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Digital Proof Artifact
                  </span>
                </div>
                <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                  VERIFIED
                </span>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 font-mono text-xs text-neutral-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Artifact:</span>
                  <span className="font-semibold text-neutral-900 truncate max-w-[180px]">
                    {activeStage.verificationArtifact}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Legal Governance:</span>
                  <span className="text-neutral-800">Ethiopian Commercial Code Book V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Escrow Custodian:</span>
                  <span className="text-neutral-800">CBE / Private Bank Escrow</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Risk Coverage:</span>
                  <span className="text-brand-700 font-bold">70% Sovereign NAFA Backstop</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStageIndex((prev) => (prev > 0 ? prev - 1 : LIFECYCLE_STAGES.length - 1));
                  }}
                  className="text-xs text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  ← Previous Phase
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStageIndex((prev) => (prev < LIFECYCLE_STAGES.length - 1 ? prev + 1 : 0));
                  }}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
                >
                  <span>Next Phase</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
