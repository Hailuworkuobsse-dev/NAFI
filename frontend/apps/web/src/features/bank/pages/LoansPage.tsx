import { formatDate, formatMoney } from '@nafi/formatters';
import { ContractStatusBadge } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts, useTableState } from '@/hooks';
import type { ContractSummary } from '@/api/types/contract';

export function BankLoansPage() {
  const table = useTableState();
  const { data, isLoading, isError, error, refetch } = useContracts({
    page: table.page,
    pageSize: table.pageSize,
  });

  const columns: Column<ContractSummary>[] = [
    {
      key: 'crop',
      header: 'Contract',
      render: (r) => (
        <div>
          <p className="font-medium text-neutral-900">{r.targetCrop}</p>
          <p className="text-xs text-neutral-500">{r.farmerName}</p>
        </div>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      hideBelow: 'sm',
      render: (r) => r.region,
    },
    {
      key: 'value',
      header: 'Value',
      align: 'right',
      render: (r) => formatMoney(r.contractValueEtb, 'ETB'),
    },
    {
      key: 'maturity',
      header: 'Maturity',
      align: 'right',
      hideBelow: 'md',
      render: (r) => formatDate(r.maturityDate),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <ContractStatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Loan Portfolio</h1>
        <p className="mt-1 text-sm text-neutral-500">
          All active loans backed by agricultural contracts.
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
