import { useNavigate } from 'react-router-dom';

import { formatDate } from '@nafi/formatters';
import { Badge, Pagination } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useDisputes, useTableState } from '@/hooks';
import type { DisputeSummary } from '@/api/types/dispute';

export function ArbitrationCasesPage() {
  const navigate = useNavigate();
  const table = useTableState();
  const { data, isLoading, isError, error, refetch } = useDisputes({
    page: table.page,
    pageSize: table.pageSize,
  });

  const columns: Column<DisputeSummary>[] = [
    {
      key: 'case',
      header: 'Case',
      render: (r) => (
        <div>
          <p className="font-medium text-neutral-900">{r.contractCrop}</p>
          <p className="text-xs text-neutral-500">{r.id.slice(0, 8)}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      hideBelow: 'sm',
      render: (r) => (
        <span className="capitalize">
          {r.category.replace(/_/g, ' ').toLowerCase()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge
          variant={
            r.status === 'CLOSED' || r.status === 'DECIDED'
              ? 'success'
              : r.status === 'HEARING_SCHEDULED'
                ? 'info'
                : 'warning'
          }
          dot
        >
          {r.status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'filed',
      header: 'Filed',
      align: 'right',
      hideBelow: 'md',
      render: (r) => formatDate(r.filedAt),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Arbitration Cases</h1>
        <p className="mt-1 text-sm text-neutral-500">Disputes assigned to your docket.</p>
      </header>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {data && (
          <>
            <DataTable
              columns={columns}
              rows={data.items}
              keyExtractor={(r) => r.id}
              onRowClick={(r) => navigate(`/arbitration/cases/${r.id}`)}
            />
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              onPageChange={table.setPage}
            />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
