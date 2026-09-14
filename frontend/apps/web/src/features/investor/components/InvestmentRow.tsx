import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatMoney, formatPercent } from '@nafi/formatters';
import { Badge } from '@nafi/ui-react';

import type { InvestmentSummary } from '@/api/types/investment';

export function InvestmentRow({ investment }: { investment: InvestmentSummary }) {
  const isDebt = investment.fundingType === 'DEBT_FIXED_RETURN';

  return (
    <Link
      to={`/portfolio/investments/${investment.id}`}
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-neutral-900">
            {investment.contractCrop}
          </span>
          <Badge variant={isDebt ? 'info' : 'brand'} size="sm">
            {isDebt ? 'Debt' : 'Equity'}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-500">
          {investment.contractRegion} · Invested{' '}
          {new Date(investment.investedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="font-mono text-sm font-semibold tabular-nums text-neutral-900">
          {formatMoney(investment.amountEtb, 'ETB')}
        </p>
        <p className="text-xs text-neutral-500">
          {formatPercent(Number(investment.agreedReturnRate), 2)} return
        </p>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
    </Link>
  );
}
