import { AlertTriangle, Banknote, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

import { formatCompactMoney, formatPercent } from '@nafi/formatters';
import { DashboardGrid, StatCard } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';

export function BankNplPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({ pageSize: 500 });

  const summary = useMemo(() => {
    const items = data?.items ?? [];
    const total = items.length;
    const defaulted = items.filter((c) => c.status === 'DEFAULTED').length;
    const disputed = items.filter((c) => c.status === 'DISPUTED').length;
    const nplRatio = total > 0 ? (defaulted + disputed) / total : 0;
    const totalValue = items.reduce((s, c) => s + Number(c.contractValueEtb), 0);

    return { total, defaulted, disputed, nplRatio, totalValue };
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">NPL Monitor</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Non-performing loan exposure across the agricultural portfolio.
        </p>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <DashboardGrid>
          <StatCard
            label="Total contracts"
            value={String(summary.total)}
            icon={<Banknote className="h-5 w-5" />}
            hint={formatCompactMoney(summary.totalValue, 'ETB')}
          />
          <StatCard
            label="NPL ratio"
            value={formatPercent(summary.nplRatio, 2)}
            delta={{
              value: 'target < 5%',
              direction: summary.nplRatio < 0.05 ? 'down' : 'up',
            }}
            icon={<TrendingDown className="h-5 w-5" />}
          />
          <StatCard
            label="Defaulted"
            value={String(summary.defaulted)}
            icon={<AlertTriangle className="h-5 w-5" />}
            hint={`${summary.disputed} disputed`}
          />
        </DashboardGrid>
      </QueryBoundary>
    </div>
  );
}
