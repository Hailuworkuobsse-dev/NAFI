import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useSettlements } from '@/hooks';
import type { SettlementSummary } from '@/api/types/settlement';

export function NafaClaimsPage() {
  const { data, isLoading, isError, error, refetch } = useSettlements({ pageSize: 100 });

  const columns: Column<SettlementSummary>[] = [
    {
      key: 'contract',
      header: 'Contract',
      render: (r) => (
        <div>
          <p className="font-medium text-neutral-900">{r.contractCrop}</p>
          <p className="text-xs text-neutral-500">{r.contractId.slice(0, 8)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'REVERSED' ? 'danger' : 'warning'} dot>
          {r.status}
        </Badge>
      ),
    },
    {
      key: 'revenue',
      header: 'Gross revenue',
      align: 'right',
      render: (r) => formatMoney(r.grossRevenueEtb, 'ETB'),
    },
    {
      key: 'date',
      header: 'Filed',
      align: 'right',
      hideBelow: 'md',
      render: (r) => formatDate(r.createdAt),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Claims</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Guarantee claims triggered by contract defaults or disputes.
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
