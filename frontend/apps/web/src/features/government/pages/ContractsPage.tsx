import { formatDate, formatMoney } from '@nafi/formatters';
import { ContractStatusBadge } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts, useTableState } from '@/hooks';
import type { ContractSummary } from '@/api/types/contract';

export function GovContractsPage() {
  const table = useTableState();
  const { data, isLoading, isError, error, refetch } = useContracts({
    page: table.page,
    pageSize: table.pageSize,
    q: table.q,
  });

  const columns: Column<ContractSummary>[] = [
    {
      key: 'crop',
      header: 'Crop',
      render: (r) => <span className="font-medium">{r.targetCrop}</span>,
    },
    { key: 'region', header: 'Region', render: (r) => r.region, hideBelow: 'sm' },
    { key: 'farmer', header: 'Farmer', render: (r) => r.farmerName, hideBelow: 'md' },
    {
      key: 'value',
      header: 'Value',
      align: 'right',
      render: (r) => formatMoney(r.contractValueEtb, 'ETB'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <ContractStatusBadge status={r.status} />,
      hideBelow: 'sm',
    },
    {
      key: 'maturity',
      header: 'Maturity',
      align: 'right',
      render: (r) => formatDate(r.maturityDate),
      hideBelow: 'lg',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Contract Registry</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Full registry of agricultural production contracts.
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
