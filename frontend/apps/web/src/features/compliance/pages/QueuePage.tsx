import { useNavigate } from 'react-router-dom';

import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts, useTableState } from '@/hooks';
import type { ContractSummary } from '@/api/types/contract';

export function ComplianceQueuePage() {
  const navigate = useNavigate();
  const table = useTableState();
  const { data, isLoading, isError, error, refetch } = useContracts({
    status: 'DRAFT',
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
          <p className="text-xs text-neutral-500">{r.region}</p>
        </div>
      ),
    },
    { key: 'farmer', header: 'Farmer', render: (r) => r.farmerName, hideBelow: 'sm' },
    {
      key: 'value',
      header: 'Value',
      align: 'right',
      render: (r) => formatMoney(r.contractValueEtb, 'ETB'),
    },
    {
      key: 'created',
      header: 'Submitted',
      align: 'right',
      hideBelow: 'md',
      render: (r) => formatDate(r.createdAt),
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: () => <Badge variant="warning">Pending review</Badge>,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Compliance Queue</h1>
        <p className="mt-1 text-sm text-neutral-500">Contracts awaiting compliance review.</p>
      </header>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {data && (
          <DataTable
            columns={columns}
            rows={data.items}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => navigate(`/compliance/queue/${r.id}`)}
          />
        )}
      </QueryBoundary>
    </div>
  );
}
