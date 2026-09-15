import { ArrowRight, Calculator, CheckCircle2, ChevronRight, Coins, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Badge, Button } from '@nafi/ui-react';

import { StatCounter } from '../components/StatCounter';
import { usePublicStats } from '../hooks/usePublicStats';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const HERO_CROPS = [
  {
    id: 'coffee',
    name: 'Sidama Arabica Grade 1',
    region: 'Sidama Region',
    tenor: '9 months',
    apy: 14.8,
    bankMatch: '1:1.5 ETB Escrow',
    risk: 'AA Sovereign (NAFA)',
    type: 'Export Coffee Pool',
  },
  {
    id: 'sesame',
    name: 'Humera White Sesame',
    region: 'Western Tigray',
    tenor: '6 months',
    apy: 16.2,
    bankMatch: '1:1.2 ETB Escrow',
    risk: 'AA- Bank Escrow',
    type: 'Export Oilseed Pool',
  },
  {
    id: 'wheat',
    name: 'Bale Lowland Durum Wheat',
    region: 'Oromia (Bale)',
    tenor: '8 months',
    apy: 13.5,
    bankMatch: '1:2.0 DBE Credit',
    risk: 'AAA (DBE Backstop)',
    type: 'Food Security Pool',
  },
];

export function Hero() {
  const { t } = useTranslation('landing');
  const { stats } = usePublicStats();
  const heroRef = useScrollAnimation();

  // Interactive Live Contract Simulator state
  const [selectedCropIndex, setSelectedCropIndex] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(2500);

  const activeCrop = HERO_CROPS[selectedCropIndex];
  const netEstimatedReturn = Math.round(investmentAmount * (1 + activeCrop.apy / 100));
  const estimatedProfit = netEstimatedReturn - investmentAmount;
  const hectaresFinanced = (investmentAmount / 650).toFixed(1);

  return (
    <section className="relative overflow-hidden bg-white border-b border-neutral-200">
      {/* Subtle institutional background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-0 -z-10 h-[550px] w-[550px] rounded-full bg-brand-50/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 -z-10 h-[450px] w-[450px] rounded-full bg-accent-50/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
      />

      <div ref={heroRef} className="container-narrow py-12 lg:py-20 animate-on-scroll">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Core Narrative & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Regulatory Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1.5 text-xs font-semibold text-brand-800 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
              <span>{t('hero.badge', 'NBE Sandbox Directive #042 · Live Infrastructure')}</span>
            </div>

            {/* Authoritative Display Headline */}
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-5xl lg:text-[52px]">
              {t('hero.title', "The Digital Backbone of Ethiopia's Agricultural Transformation")}
            </h1>

            {/* Clear Value Proposition */}
            <p className="mt-5 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl">
              {t(
                'hero.subtitle',
                'Mobilizing diaspora capital and commercial banks to finance commercial agriculture. Protected by regulated bank escrows, 70% sovereign first-loss guarantees, and geo-verified farm-to-export execution.',
              )}
            </p>

            {/* Proof Points Strip */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-2xl">
              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs font-medium text-neutral-800">
                <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0" />
                <span className="truncate">Bank Escrow</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs font-medium text-neutral-800">
                <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                <span className="truncate">70% NAFA Backstop</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs font-medium text-neutral-800">
                <TrendingUp className="h-4 w-4 text-brand-600 shrink-0" />
                <span className="truncate">ECX Receipts</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs font-medium text-neutral-800">
                <Sparkles className="h-4 w-4 text-brand-600 shrink-0" />
                <span className="truncate">Zero FX Leakage</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm px-6">
                <a href="#opportunities">
                  <span>Explore Live Contracts</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-neutral-300 hover:bg-neutral-50 px-6">
                <a href="#calculator">
                  <Calculator className="mr-2 h-4 w-4 text-neutral-600" />
                  <span>Yield Calculator</span>
                </a>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-neutral-700 hover:text-brand-700">
                <Link to="/register?role=COMMERCIAL_FARMER">
                  <span>Farmer Pre-Financing</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Interactive Live Contract Simulator */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                    Live Contract Simulator
                  </span>
                  <h3 className="text-base font-bold text-neutral-900">
                    Diaspora Agrifinance Pool
                  </h3>
                </div>
                <Badge variant="brand" size="sm">
                  {activeCrop.risk}
                </Badge>
              </div>

              {/* Crop Selector Tabs */}
              <div className="mt-4">
                <label className="text-xs font-semibold text-neutral-600 block mb-2">
                  Select Certified Commodity Pool
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-neutral-100">
                  {HERO_CROPS.map((crop, idx) => (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => setSelectedCropIndex(idx)}
                      className={`rounded-lg py-2 px-2 text-xs font-medium transition-all ${
                        selectedCropIndex === idx
                          ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {crop.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Commodity Details */}
              <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3 text-xs">
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Active Pool:</span>
                  <span className="font-semibold text-neutral-900">{activeCrop.name}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600 mt-1">
                  <span>Production Region:</span>
                  <span className="font-medium text-neutral-800">{activeCrop.region}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600 mt-1">
                  <span>Harvest Maturity:</span>
                  <span className="font-medium text-neutral-800">{activeCrop.tenor}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600 mt-1">
                  <span>Bank Matching Ratio:</span>
                  <span className="font-medium text-brand-700">{activeCrop.bankMatch}</span>
                </div>
              </div>

              {/* Investment Amount Slider & Presets */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="hero-sim-amount" className="text-xs font-semibold text-neutral-700">
                    Your Commitment (USD)
                  </label>
                  <span className="font-mono text-sm font-bold text-neutral-900">
                    ${investmentAmount.toLocaleString()}
                  </span>
                </div>
                <input
                  id="hero-sim-amount"
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer h-2 bg-neutral-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
                  <span>$500 min</span>
                  <span>$10,000 max</span>
                </div>

                {/* Preset Chips */}
                <div className="flex gap-2 mt-2">
                  {[1000, 2500, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setInvestmentAmount(preset)}
                      className={`flex-1 rounded-md border py-1 text-xs font-medium transition-colors ${
                        investmentAmount === preset
                          ? 'border-brand-600 bg-brand-50 text-brand-800 font-semibold'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      ${(preset / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-Time Outcome Calculation Box */}
              <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/50 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-medium text-neutral-600">Projected APY</span>
                    <p className="text-lg font-bold text-brand-700">+{activeCrop.apy}%</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-neutral-600">Estimated Net Payout</span>
                    <p className="text-lg font-bold text-neutral-900 font-mono">
                      ${netEstimatedReturn.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-brand-200/60 flex items-center justify-between text-xs text-neutral-600">
                  <span>Farmland Financed:</span>
                  <span className="font-semibold text-neutral-800">{hectaresFinanced} Hectares</span>
                </div>
              </div>

              {/* Card Action */}
              <div className="mt-5">
                <Button asChild fullWidth className="bg-brand-600 hover:bg-brand-700 text-white shadow-xs">
                  <Link to={`/register?role=DIASPORA_INVESTOR&amount=${investmentAmount}`}>
                    <span>Commit Capital to this Pool</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="mt-2 text-center text-[11px] text-neutral-500">
                  Regulated under NBE Sandbox Directive #042 · Escrow locked until verified input delivery
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Macro Real-Time Telemetry Bar */}
        <div className="mt-14 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4 flex items-center justify-between">
            <span>National Infrastructure Verification Metrics</span>
            <span className="text-brand-700 font-medium">● Updated Daily</span>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <StatCounter
              value={stats.totalFundedUsd}
              prefix="$"
              label={t('hero.statFunded', 'Diaspora Capital Mobilized')}
              className="text-left"
            />
            <StatCounter
              value={stats.activeContracts}
              label={t('hero.statContracts', 'Active Commercial Contracts')}
              className="text-left"
            />
            <StatCounter
              value={stats.hectaresUnderContract || 68200}
              label="Hectares Under Smart Contract"
              className="text-left"
            />
            <StatCounter
              value={stats.farmersReached}
              label={t('hero.statFarmers', 'Smallholders & Commercial Farmers')}
              className="text-left"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
