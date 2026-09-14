import { formatMoney, formatPercent } from '@nafi/formatters';

import { ProgressBar } from '../../components/ProgressBar/ProgressBar';

export interface InvestmentPoolProgressProps {
  targetAmountEtb: string;
  committedAmountEtb: string;
  investorCount: number;
}

export function InvestmentPoolProgress({
  targetAmountEtb,
  committedAmountEtb,
  investorCount,
}: InvestmentPoolProgressProps) {
  const target = Number(targetAmountEtb);
  const committed = Number(committedAmountEtb);
  const pct = target > 0 ? committed / target : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-neutral-900">
          {formatMoney(committedAmountEtb, 'ETB')} committed
        </span>
        <span className="text-xs text-neutral-500">of {formatMoney(targetAmountEtb, 'ETB')}</span>
      </div>
      <ProgressBar value={committed} max={target} variant={pct >= 1 ? 'success' : 'brand'} />
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          <span className="font-medium text-neutral-700">{formatPercent(pct, 0)}</span> funded
        </span>
        <span>{investorCount} investors</span>
      </div>
    </div>
  );
}
