import { AlertTriangle, PieChart, ShieldCheck, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

import { formatCompactMoney, formatPercent } from '@nafi/formatters';
import { DashboardGrid, StatCard } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';

export function NafaRiskSharingPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({ pageSize: 500 });

  const summary = useMemo(() => {
    const items = data?.items ?? [];
    const totalValue = items.reduce((s, c) => s + Number(c.contractValueEtb), 0);
    const exposure = totalValue * 0.7;
    const defaulted = items.filter((c) => c.status === 'DEFAULTED').length;
    const claimRate = items.length > 0 ? defaulted / items.length : 0;

    return { totalValue, exposure, defaulted, claimRate, count: items.length };
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Risk Sharing</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Guarantee exposure and portfolio health.
        </p>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <DashboardGrid>
          <StatCard
            label="Total exposure"
            value={formatCompactMoney(summary.exposure, 'ETB')}
            icon={<ShieldCheck className="h-5 w-5" />}
            hint={`${summary.count} guaranteed contracts`}
          />
          <StatCard
            label="Claim rate"
            value={formatPercent(summary.claimRate, 2)}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <StatCard
            label="Recovery rate"
            value="—"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </DashboardGrid>
      </QueryBoundary>
    </div>
  );
}
