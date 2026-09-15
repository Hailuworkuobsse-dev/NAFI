import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Coins,
  Cpu,
  Landmark,
  Layers,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  Tractor,
  Truck,
  Warehouse,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Button } from '@nafi/ui-react';

import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface EcosystemNode {
  id: string;
  number: string;
  title: string;
  entity: string;
  roleDescription: string;
  currency: 'USD' | 'ETB' | 'PHYSICAL_INPUTS' | 'COMMODITY';
  guarantee: string;
  verificationTrigger: string;
  icon: typeof Coins;
  colorClass: string;
  activeBorder: string;
}

const ECOSYSTEM_NODES: EcosystemNode[] = [
  {
    id: 'diaspora',
    number: '01',
    title: 'Diaspora Investor',
    entity: 'Individual & Institutional Diaspora',
    roleDescription:
      'Commits foreign currency (USD/EUR) into an NBE-monitored escrow account. Secures fixed APY (13-17%) or profit-share rights tied to specific crop cycles.',
    currency: 'USD',
    guarantee: 'Principal protected by 70% NAFA First-Loss Sovereign Backstop',
    verificationTrigger: 'Digital Signature & NBE Inward FX Remittance Ticket',
    icon: Coins,
    colorClass: 'bg-brand-50 text-brand-800 border-brand-200',
    activeBorder: 'border-brand-600 bg-brand-50/70',
  },
  {
    id: 'banks',
    number: '02',
    title: 'Commercial Bank Escrow',
    entity: 'CBE, Awash, Dashen & Co-op Banks',
    roleDescription:
      'Holds foreign exchange in escrow and issues low-interest ETB working credit (1:1.5 matching ratio). Credit cannot be withdrawn as cash; locked exclusively for certified inputs.',
    currency: 'ETB',
    guarantee: 'De-risked via tripartite contract with export buyer & NAFA',
    verificationTrigger: 'Tripartite Escrow Agreement & DBE RUFIP Facility',
    icon: Landmark,
    colorClass: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    activeBorder: 'border-neutral-700 bg-neutral-100',
  },
  {
    id: 'suppliers',
    number: '03',
    title: 'Certified Input Supplier',
    entity: 'MoA-Licensed Fertilizer & Seed Unions',
    roleDescription:
      'Dispatches high-yield hybrid seed, fertilizer, and tractor services directly to the farmer. Supplier is only paid once delivery is geo-confirmed at the farm gate.',
    currency: 'PHYSICAL_INPUTS',
    guarantee: 'Payment automatically released from bank escrow upon GPS/QR check',
    verificationTrigger: 'GPS Geofenced Delivery + Farmer Mobile Confirmation OTP',
    icon: Truck,
    colorClass: 'bg-accent-50 text-accent-800 border-accent-200',
    activeBorder: 'border-accent-600 bg-accent-50/70',
  },
  {
    id: 'farmers',
    number: '04',
    title: 'Commercial Farmer & Union',
    entity: 'Registered Commercial Farms & Co-ops',
    roleDescription:
      'Receives verified inputs with zero upfront cash advance. Cultivates crops under digital extension monitoring and agrees to delivery at guaranteed floor prices.',
    currency: 'COMMODITY',
    guarantee: 'Guaranteed floor price prevents distress sales to predatory brokers',
    verificationTrigger: 'Satellite NDVI Crop Monitoring & Agronomy Logs',
    icon: Tractor,
    colorClass: 'bg-brand-50 text-brand-800 border-brand-200',
    activeBorder: 'border-brand-600 bg-brand-50/70',
  },
  {
    id: 'offtakers',
    number: '05',
    title: 'ECX & Export Off-Taker',
    entity: 'Ethiopian Commodity Exchange & Buyers',
    roleDescription:
      'Receives harvest at bonded warehouse, conducts moisture and grade inspection, issues Electronic Warehouse Receipt (EWR), and pays export proceeds directly into escrow.',
    currency: 'USD',
    guarantee: 'Collateral legally enforceable under Book V Commercial Code',
    verificationTrigger: 'Electronic Warehouse Receipt (EWR) Generation',
    icon: Warehouse,
    colorClass: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    activeBorder: 'border-neutral-700 bg-neutral-100',
  },
  {
    id: 'settlement',
    number: '06',
    title: 'NAFI Settlement Waterfall',
    entity: 'Autonomous Smart Contract Engine',
    roleDescription:
      'Executes multi-party priority distribution: (1) Bank loan principal cleared, (2) Input supplier balance finalized, (3) Investor USD yield returned, (4) Farmer surplus credited.',
    currency: 'USD',
    guarantee: 'Mathematical execution with zero human leakage or diversion',
    verificationTrigger: 'NBE Approved Bank Export Settlement API Call',
    icon: Cpu,
    colorClass: 'bg-brand-100 text-brand-900 border-brand-300',
    activeBorder: 'border-brand-700 bg-brand-50/90',
  },
];

export function EcosystemDiagram() {
  const { t } = useTranslation('landing');
  const sectionRef = useScrollAnimation();
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setActiveNodeIndex((prev) => {
        if (prev >= ECOSYSTEM_NODES.length - 1) {
          setIsSimulating(false);
          return 0;
        }
        return prev + 1;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [isSimulating]);

  const activeNode = ECOSYSTEM_NODES[activeNodeIndex];
  const ActiveIcon = activeNode.icon;

  return (
    <section id="architecture" className="py-16 sm:py-24 bg-neutral-50/50 border-b border-neutral-200">
      <div ref={sectionRef} className="container-narrow animate-on-scroll">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md bg-neutral-200/80 px-2.5 py-1 text-xs font-semibold text-neutral-800 mb-3">
              <Cpu className="h-3.5 w-3.5 text-neutral-700" />
              <span>Smart Contract Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
              The Multi-Stakeholder Settlement Engine
            </h2>
            <p className="mt-3 text-base text-neutral-600 leading-relaxed">
              Explore how foreign exchange, commercial credit, agricultural inputs, and commodities flow through NAFI's immutable tripartite ledger.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Button
              type="button"
              variant={isSimulating ? 'outline' : 'solid'}
              size="md"
              onClick={() => setIsSimulating(!isSimulating)}
              className="gap-2"
            >
              {isSimulating ? (
                <>
                  <RotateCcw className="h-4 w-4" />
                  <span>Pause Simulation</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Simulate Contract Lifecycle</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Interactive Node Flow Bar */}
        <div className="mt-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ECOSYSTEM_NODES.map((node, index) => {
              const Icon = node.icon;
              const isSelected = index === activeNodeIndex;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    setIsSimulating(false);
                    setActiveNodeIndex(index);
                  }}
                  className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? `${node.activeBorder} shadow-sm ring-2 ring-neutral-900/10`
                      : 'border-neutral-200/90 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex w-full items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-neutral-400">
                      STEP {node.number}
                    </span>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${node.colorClass}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                    {node.title}
                  </h4>
                  <span className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                    {node.entity.split('&')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Node Telemetry & Escrow Deep-Dive */}
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Detail narrative */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${activeNode.colorClass}`}
                  >
                    <ActiveIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-neutral-500">
                      STAGE {activeNode.number} OF 06
                    </span>
                    <h3 className="text-xl font-bold text-neutral-900">
                      {activeNode.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mt-4">
                  {activeNode.roleDescription}
                </p>

                <div className="mt-6 space-y-3">
                  <div className="rounded-xl border border-neutral-200/90 bg-neutral-50 p-4">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">
                      Sovereign & Legal Protection
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-neutral-900 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0" />
                      <span>{activeNode.guarantee}</span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-200/90 bg-neutral-50 p-4">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">
                      Execution Trigger Condition
                    </span>
                    <p className="text-xs sm:text-sm font-mono font-medium text-neutral-800 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                      <span>{activeNode.verificationTrigger}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Simulated Ledger Entry */}
            <div className="lg:col-span-5 rounded-xl border border-neutral-900 bg-neutral-950 p-5 text-neutral-200 shadow-md font-mono text-xs">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
                  <span className="font-bold text-neutral-100 uppercase text-[11px]">
                    NAFI Sovereign Ledger v1.4
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500">NBE SANDBOX</span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Contract ID:</span>
                  <span className="text-neutral-300">ET-2026-COF-0914</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Active State:</span>
                  <span className="text-brand-400 font-bold uppercase">{activeNode.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Escrow Entity:</span>
                  <span className="text-neutral-300 truncate max-w-[200px]">{activeNode.entity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Currency Unit:</span>
                  <span className="text-amber-400 font-bold">{activeNode.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Verification Hash:</span>
                  <span className="text-neutral-400 text-[10px]">0x8f2a...91bc</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
                <p className="leading-relaxed">
                  ✓ Event verified against NBE Directive #042 requirements. Tripartite signature validated.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActiveNodeIndex((prev) => (prev > 0 ? prev - 1 : ECOSYSTEM_NODES.length - 1));
                  }}
                  className="text-[11px] text-neutral-400 hover:text-white transition-colors"
                >
                  ← Prev Phase
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveNodeIndex((prev) => (prev < ECOSYSTEM_NODES.length - 1 ? prev + 1 : 0));
                  }}
                  className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Next Phase</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
