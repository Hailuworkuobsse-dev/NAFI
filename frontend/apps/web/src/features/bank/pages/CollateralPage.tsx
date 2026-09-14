import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useCollateral } from '@/hooks';
import type { CollateralSummary } from '@/api/types/collateral';

export function BankCollateralPage() {
  const { data, isLoading, isError, error, refetch } = useCollateral({ pageSize: 100 });

  const columns: Column<CollateralSummary>[] = [
    {
      key: 'description',
      header: 'Collateral',
      render: (r) => (
        <div>
          <p className="font-medium text-neutral-900">{r.description}</p>
          <p className="text-xs text-neutral-500">{r.type.replace(/_/g, ' ')}</p>
        </div>
      ),
    },
    {
      key: 'value',
      header: 'Estimated value',
      align: 'right',
      render: (r) => formatMoney(r.estimatedValueEtb, 'ETB'),
    },
    {
      key: 'lien',
      header: 'Lien status',
      hideBelow: 'sm',
      render: (r) => (
        <Badge
          variant={r.lienStatus === 'LIEN_REGISTERED' ? 'warning' : 'success'}
          dot
        >
          {r.lienStatus.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'registered',
      header: 'Registered',
      align: 'right',
      hideBelow: 'md',
      render: (r) => formatDate(r.registeredAt),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Collateral Registry</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Warehouse receipts and movable property pledged as loan collateral.
        </p>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {data && (
          <DataTable columns={columns} rows={data.items} keyExtractor={(r) => r.id} />
        )}
      </QueryBoundary>
    </div>
  );
}
