import { useTranslation } from 'react-i18next';

import { formatMoney, formatPercent } from '@nafi/formatters';
import { Badge, Pagination } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useMyInvestments, useTableState } from '@/hooks';
import type { InvestmentSummary } from '@/api/types/investment';

export function InvestorInvestmentsPage() {
  const { t } = useTranslation('nav');
  const table = useTableState();
  const { data, isLoading, isError, error, refetch } = useMyInvestments({
    page: table.page,
    pageSize: table.pageSize,
    q: table.q,
  });

  const columns: Column<InvestmentSummary>[] = [
    {
      key: 'crop',
      header: 'Crop',
      render: (row) => (
        <div>
          <p className="font-medium text-neutral-900">{row.contractCrop}</p>
          <p className="text-xs text-neutral-500">{row.contractRegion}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      hideBelow: 'sm',
      render: (row) => (
        <Badge variant={row.fundingType === 'DEBT_FIXED_RETURN' ? 'info' : 'brand'} size="sm">
          {row.fundingType === 'DEBT_FIXED_RETURN' ? 'Debt' : 'Equity'}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="font-mono tabular-nums text-neutral-900">
          {formatMoney(row.amountEtb, 'ETB')}
        </span>
      ),
    },
    {
      key: 'rate',
      header: 'Return',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <span className="font-mono tabular-nums text-neutral-700">
          {formatPercent(Number(row.agreedReturnRate), 2)}
        </span>
      ),
    },
    {
      key: 'expected',
      header: 'Expected',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => (
        <span className="font-mono tabular-nums text-neutral-700">
          {formatMoney(row.expectedReturnEtb, 'ETB')}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Invested',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <span className="text-xs text-neutral-500">
          {new Date(row.investedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">{t('portfolio.investments')}</h1>
        <p className="mt-1 text-sm text-neutral-500">All investments you have committed to.</p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">You haven&apos;t invested yet.</p>
          </div>
        }
      >
        {data && (
          <>
            <DataTable columns={columns} rows={data.items} keyExtractor={(r) => r.id} />
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
