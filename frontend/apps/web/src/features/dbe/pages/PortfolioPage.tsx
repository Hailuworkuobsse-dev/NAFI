import { Banknote, Coins, TrendingUp } from 'lucide-react';

import { formatCompactMoney, formatPercent } from '@nafi/formatters';
import { Card, CardBody, CardHeader, DashboardGrid, StatCard } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';

export function DbePortfolioPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({ pageSize: 500 });

  const items = data?.items ?? [];
  const active = items.filter((c) => c.status === 'ACTIVE');
  const totalValue = items.reduce((s, c) => s + Number(c.contractValueEtb), 0);
  const totalCommitted = items.reduce((s, c) => s + Number(c.committedAmountEtb), 0);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">DBE Portfolio</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Development Bank co-financing portfolio across agricultural contracts.
        </p>
      </header>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <DashboardGrid>
          <StatCard
            label="Active contracts"
            value={String(active.length)}
            icon={<Banknote className="h-5 w-5" />}
            hint={`${items.length} total`}
          />
          <StatCard
            label="Portfolio value"
            value={formatCompactMoney(totalValue, 'ETB')}
            icon={<Coins className="h-5 w-5" />}
          />
          <StatCard
            label="Committed"
            value={formatCompactMoney(totalCommitted, 'ETB')}
            delta={{
              value: formatPercent(totalCommitted / Math.max(totalValue, 1), 0),
              direction: 'up',
            }}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </DashboardGrid>

        <Card>
          <CardHeader title="Co-financing summary" />
          <CardBody>
            <p className="text-sm text-neutral-600">
              DBE co-finances {active.length} contracts under the RUFIP III facility, matching
              diaspora capital at a ratio of 1:1. All contracts are monitored against warehouse
              receipt collateral.
            </p>
          </CardBody>
        </Card>
      </QueryBoundary>
    </div>
  );
}
