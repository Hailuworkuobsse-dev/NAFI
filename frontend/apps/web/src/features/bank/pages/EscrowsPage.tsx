import { useNavigate } from 'react-router-dom';

import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge, Pagination } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useEscrows, useTableState } from '@/hooks';
import type { EscrowSummary } from '@/api/types/escrow';

export function BankEscrowsPage() {
  const navigate = useNavigate();
  const table = useTableState();
  const { data, isLoading, isError, error, refetch } = useEscrows({
    page: table.page,
    pageSize: table.pageSize,
    q: table.q,
  });

  const columns: Column<EscrowSummary>[] = [
    {
      key: 'contract',
      header: 'Contract',
      render: (row) => (
        <div>
          <p className="font-medium text-neutral-900">{row.contractCrop}</p>
          <p className="text-xs text-neutral-500">{row.contractId.slice(0, 8)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      hideBelow: 'sm',
      render: (row) => (
        <Badge
          variant={
            row.status === 'FROZEN'
              ? 'danger'
              : row.status === 'RELEASED' || row.status === 'CLOSED'
                ? 'success'
                : 'info'
          }
          dot
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      align: 'right',
      render: (row) => {
        const etb = row.balances.find((b) => b.currency === 'ETB');
        return (
          <span className="font-mono tabular-nums text-neutral-900">
            {etb ? formatMoney(etb.amount, 'ETB') : '—'}
          </span>
        );
      },
    },
    {
      key: 'usd',
      header: 'USD',
      align: 'right',
      hideBelow: 'md',
      render: (row) => {
        const usd = row.balances.find((b) => b.currency === 'USD');
        return (
          <span className="font-mono tabular-nums text-neutral-700">
            {usd ? formatMoney(usd.amount, 'USD') : '—'}
          </span>
        );
      },
    },
    {
      key: 'created',
      header: 'Opened',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => (
        <span className="text-xs text-neutral-500">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Escrows</h1>
        <p className="mt-1 text-sm text-neutral-500">
          All agricultural escrow accounts managed by your institution.
        </p>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {data && (
          <>
            <DataTable
              columns={columns}
              rows={data.items}
              keyExtractor={(r) => r.id}
              onRowClick={(r) => navigate(`/bank/escrows/${r.id}`)}
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
