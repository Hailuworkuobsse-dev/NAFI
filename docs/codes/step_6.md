# 🚀 NAFI Frontend — Step 6 of 10

## Three Production Role Portals — Diaspora Investor · Commercial Farmer · Input Supplier

**Step Goal:** Replace the stubs from Step 4 with fully-implemented pages for the three most-used roles, wired end-to-end through the Step 5 data layer and the Step 2 composite components. Every action guarded by RBAC. Every list using `<QueryBoundary>` + `useTableState`. Farmer portal mobile-first.

**Duration Estimate:** 10–14 days
**Deliverable:** Three role portals that a real user can navigate, transact with, and complete their full workflow.

---

## 6.1 Folder Structure

```
apps/web/src/features/
├── investor/
│   ├── components/
│   │   ├── PortfolioSummaryCard.tsx
│   │   ├── ReturnBreakdownChart.tsx
│   │   ├── OpportunityDetailDrawer.tsx
│   │   ├── InvestFlowWizard.tsx
│   │   └── InvestmentRow.tsx
│   ├── pages/
│   │   ├── OverviewPage.tsx
│   │   ├── InvestmentsPage.tsx
│   │   ├── InvestmentDetailPage.tsx
│   │   ├── BondsPage.tsx
│   │   ├── ReturnsPage.tsx
│   │   ├── StatementsPage.tsx
│   │   ├── OpportunityBrowserPage.tsx
│   │   └── OpportunityInvestPage.tsx
│   └── hooks/
│       └── useInvestFlow.ts
│
├── farmer/
│   ├── components/
│   │   ├── FarmSummaryCard.tsx
│   │   ├── ContractSignDialog.tsx
│   │   ├── DeliveryVerifyDialog.tsx
│   │   ├── HarvestLogDialog.tsx
│   │   └── CollateralRegisterWizard.tsx
│   ├── pages/
│   │   ├── ContractsPage.tsx
│   │   ├── ContractDetailPage.tsx
│   │   ├── InputsPage.tsx
│   │   ├── EscrowPage.tsx
│   │   ├── HarvestPage.tsx
│   │   ├── CollateralPage.tsx
│   │   └── PaymentsPage.tsx
│   └── hooks/
│       └── useFarmerSummary.ts
│
└── supplier/
    ├── components/
    │   ├── SupplierSummaryCard.tsx
    │   ├── CreatePurchaseOrderDialog.tsx
    │   └── DeliveryTimeline.tsx
    ├── pages/
    │   ├── OrdersPage.tsx
    │   ├── OrderDetailPage.tsx
    │   ├── DeliveriesPage.tsx
    │   ├── PaymentsPage.tsx
    │   └── ProfilePage.tsx
    └── hooks/
        └── useSupplierSummary.ts
```

---

## 6.2 Shared List Page Pattern

Every list page follows this exact template. Introducing it once saves hundreds of lines.

### `apps/web/src/components/DataTable.tsx`

```tsx
import type { ReactNode } from 'react';

import { Card, cn } from '@nafi/ui-react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
  align?: 'left' | 'right' | 'center';
  hideBelow?: 'sm' | 'md' | 'lg';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

const HIDE_CLASS = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
} as const;

const ALIGN_CLASS = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const;

export function DataTable<T>({
  columns,
  rows,
  keyExtractor,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500',
                    ALIGN_CLASS[col.align ?? 'left'],
                    col.hideBelow && HIDE_CLASS[col.hideBelow],
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {rows.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-neutral-50',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-sm text-neutral-700',
                      ALIGN_CLASS[col.align ?? 'left'],
                      col.hideBelow && HIDE_CLASS[col.hideBelow],
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
```

---

# PART A — Diaspora Investor Portal

## 6.3 Investor Overview

### `apps/web/src/features/investor/hooks/useInvestorSummary.ts`

```ts
import { useMemo } from 'react';

import { useMyInvestments } from '@/hooks';

/**
 * Aggregates a portfolio summary from the investor's investments list.
 * Real backend may expose /investments/summary; this works today.
 */
export function useInvestorSummary() {
  const { data, isLoading } = useMyInvestments({ pageSize: 500 });

  return useMemo(() => {
    const items = data?.items ?? [];
    const totalInvestedEtb = items.reduce((s, i) => s + Number(i.amountEtb), 0);
    const totalExpectedReturnEtb = items.reduce((s, i) => s + Number(i.expectedReturnEtb), 0);
    const totalRealizedReturnEtb = items.reduce(
      (s, i) => s + Number(i.realizedReturnEtb ?? 0),
      0,
    );
    const activeCount = items.filter((i) => !i.settledAt).length;

    return {
      isLoading,
      summary: {
        totalInvestedEtb,
        totalExpectedReturnEtb,
        totalRealizedReturnEtb,
        activeCount,
        investmentCount: items.length,
      },
      investments: items,
    };
  }, [data, isLoading]);
}
```

### `apps/web/src/features/investor/pages/OverviewPage.tsx`

```tsx
import { ArrowUpRight, Coins, TrendingUp, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { formatCompactMoney, formatMoney, formatPercent } from '@nafi/formatters';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DashboardGrid,
  StatCard,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';

import { useInvestorSummary } from '../hooks/useInvestorSummary';
import { InvestmentRow } from '../components/InvestmentRow';

export function InvestorOverviewPage() {
  const { t } = useTranslation('common');
  const { summary, investments, isLoading } = useInvestorSummary();

  const recent = investments.slice(0, 5);
  const totalReturnPct =
    summary.totalInvestedEtb > 0
      ? summary.totalExpectedReturnEtb / summary.totalInvestedEtb
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{t('nav.portfolio.overview')}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Your agricultural investment portfolio at a glance.
          </p>
        </div>
        <Button asChild leadingIcon={<TrendingUp className="h-4 w-4" />}>
          <Link to="/opportunities">Browse opportunities</Link>
        </Button>
      </header>

      <QueryBoundary isLoading={isLoading} isError={false}>
        <DashboardGrid>
          <StatCard
            label="Total invested"
            value={formatCompactMoney(summary.totalInvestedEtb, 'ETB')}
            icon={<Coins className="h-5 w-5" />}
            hint={`${summary.investmentCount} investments`}
          />
          <StatCard
            label="Expected return"
            value={formatCompactMoney(summary.totalExpectedReturnEtb, 'ETB')}
            delta={{ value: formatPercent(totalReturnPct, 1), direction: 'up' }}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            label="Realized return"
            value={formatCompactMoney(summary.totalRealizedReturnEtb, 'ETB')}
            icon={<Wallet className="h-5 w-5" />}
            hint={`${summary.activeCount} active`}
          />
        </DashboardGrid>

        <Card>
          <CardHeader
            title="Recent investments"
            action={
              <Button asChild variant="ghost" size="sm" trailingIcon={<ArrowUpRight className="h-4 w-4" />}>
                <Link to="/portfolio/investments">View all</Link>
              </Button>
            }
          />
          <CardBody className="p-0">
            {recent.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-neutral-500">
                No investments yet. Start by browsing opportunities.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {recent.map((inv) => (
                  <InvestmentRow key={inv.id} investment={inv} />
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </QueryBoundary>
    </div>
  );
}
```

### `apps/web/src/features/investor/components/InvestmentRow.tsx`

```tsx
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatMoney, formatPercent } from '@nafi/formatters';
import { Badge } from '@nafi/ui-react';

import type { InvestmentSummary } from '@/api/types/investment';

export function InvestmentRow({ investment }: { investment: InvestmentSummary }) {
  const isDebt = investment.fundingType === 'DEBT_FIXED_RETURN';

  return (
    <Link
      to={`/portfolio/investments/${investment.id}`}
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-neutral-900">
            {investment.contractCrop}
          </span>
          <Badge variant={isDebt ? 'info' : 'brand'} size="sm">
            {isDebt ? 'Debt' : 'Equity'}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-500">
          {investment.contractRegion} · Invested {new Date(investment.investedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="font-mono text-sm font-semibold tabular-nums text-neutral-900">
          {formatMoney(investment.amountEtb, 'ETB')}
        </p>
        <p className="text-xs text-neutral-500">
          {formatPercent(Number(investment.agreedReturnRate), 2)} return
        </p>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
    </Link>
  );
}
```

## 6.4 Investments List

### `apps/web/src/features/investor/pages/InvestmentsPage.tsx`

```tsx
import { useTranslation } from 'react-i18next';

import { formatMoney, formatPercent } from '@nafi/formatters';
import { Badge, Can, Pagination } from '@nafi/ui-react';
import { PERMISSIONS } from '@nafi/rbac-core';

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
        <h1 className="text-2xl font-semibold text-neutral-900">{t('nav.portfolio.investments')}</h1>
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
```

## 6.5 Bonds, Returns, Statements

### `apps/web/src/features/investor/pages/BondsPage.tsx`

```tsx
import { useMemo } from 'react';

import { formatDate, formatMoney, formatPercent } from '@nafi/formatters';
import { Badge, Card, CardBody, CardHeader } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useMyInvestments } from '@/hooks';

export function InvestorBondsPage() {
  const { data, isLoading, isError, error, refetch } = useMyInvestments({ pageSize: 500 });

  const bonds = useMemo(
    () => (data?.items ?? []).filter((i) => i.fundingType === 'DEBT_FIXED_RETURN'),
    [data],
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">My Bonds</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Fixed-return agricultural bonds you hold.
        </p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={bonds.length === 0}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">You don&apos;t hold any bonds yet.</p>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {bonds.map((bond) => (
            <Card key={bond.id}>
              <CardHeader
                title={bond.contractCrop}
                description={bond.contractRegion}
                action={
                  <Badge variant={bond.settledAt ? 'success' : 'info'} dot>
                    {bond.settledAt ? 'Settled' : 'Active'}
                  </Badge>
                }
              />
              <CardBody className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-neutral-500">Principal</span>
                  <p className="font-mono font-medium tabular-nums text-neutral-900">
                    {formatMoney(bond.amountEtb, 'ETB')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Coupon</span>
                  <p className="font-medium text-neutral-900">
                    {formatPercent(Number(bond.agreedReturnRate), 2)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Invested</span>
                  <p className="text-neutral-900">{formatDate(bond.investedAt)}</p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Expected return</span>
                  <p className="font-mono font-medium tabular-nums text-success-dark">
                    +{formatMoney(bond.expectedReturnEtb, 'ETB')}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
```

### `apps/web/src/features/investor/pages/ReturnsPage.tsx`

```tsx
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCompactMoney, formatMoney } from '@nafi/formatters';
import { Card, CardBody, CardHeader, DataList } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useMyInvestments } from '@/hooks';

export function InvestorReturnsPage() {
  const { data, isLoading, isError, error, refetch } = useMyInvestments({ pageSize: 500 });

  const { chart, totals } = useMemo(() => {
    const items = data?.items ?? [];
    const chart = items.map((i) => ({
      name: i.contractCrop,
      expected: Number(i.expectedReturnEtb),
      realized: Number(i.realizedReturnEtb ?? 0),
    }));
    const totals = {
      expected: items.reduce((s, i) => s + Number(i.expectedReturnEtb), 0),
      realized: items.reduce((s, i) => s + Number(i.realizedReturnEtb ?? 0), 0),
    };
    return { chart, totals };
  }, [data]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Returns Tracker</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Expected vs. realized returns across your portfolio.
        </p>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Return by investment" />
            <CardBody>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip
                      formatter={(v: number) => formatMoney(v, 'ETB')}
                      contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                    />
                    <Bar dataKey="expected" fill="#16A34A" radius={[4, 4, 0, 0]} name="Expected" />
                    <Bar dataKey="realized" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Realized" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Summary" />
            <CardBody>
              <DataList
                columns={1}
                items={[
                  { label: 'Expected total', value: formatCompactMoney(totals.expected, 'ETB') },
                  { label: 'Realized total', value: formatCompactMoney(totals.realized, 'ETB') },
                  {
                    label: 'Outstanding',
                    value: formatCompactMoney(totals.expected - totals.realized, 'ETB'),
                  },
                ]}
              />
            </CardBody>
          </Card>
        </div>
      </QueryBoundary>
    </div>
  );
}
```

### `apps/web/src/features/investor/pages/StatementsPage.tsx`

```tsx
import { FileText, Download } from 'lucide-react';

import { formatDate } from '@nafi/formatters';
import { Button, Card, CardBody, CardHeader } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useReports } from '@/hooks';

export function InvestorStatementsPage() {
  const { data, isLoading, isError, error, refetch } = useReports({
    type: 'PORTFOLIO',
    pageSize: 50,
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Statements</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Downloadable statements for tax, records, and reconciliation.
        </p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">No statements yet.</p>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          {data?.items.map((r) => (
            <Card key={r.id}>
              <CardHeader
                title={r.title}
                description={`${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}`}
                action={
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    leadingIcon={<Download className="h-4 w-4" />}
                  >
                    <a href={r.fileUrl} target="_blank" rel="noreferrer noopener">
                      {r.format}
                    </a>
                  </Button>
                }
              />
              <CardBody className="flex items-center gap-3 text-xs text-neutral-500">
                <FileText className="h-4 w-4" />
                Generated {formatDate(r.generatedAt)} by {r.generatedByName}
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
```

## 6.6 Opportunity Browser & Invest Flow

### `apps/web/src/features/investor/pages/OpportunityBrowserPage.tsx`

```tsx
import { Coins, MapPin, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatCompactMoney, formatDate, formatPercent, formatWeight } from '@nafi/formatters';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  InvestmentPoolProgress,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useOpportunities } from '@/hooks';

export function OpportunityBrowserPage() {
  const { data, isLoading, isError, error, refetch } = useOpportunities();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Opportunities</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Live agricultural contracts open for investment.
        </p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.length === 0)}
        emptyFallback={<EmptyState title="No open opportunities right now" />}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((opp) => (
            <Card key={opp.id} className="flex flex-col">
              <CardHeader
                title={opp.targetCrop}
                description={
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {opp.region}
                  </span>
                }
              />
              <CardBody className="flex flex-1 flex-col gap-4">
                <InvestmentPoolProgress
                  targetAmountEtb={opp.targetAmountEtb}
                  committedAmountEtb={opp.committedAmountEtb}
                  investorCount={opp.investorCount}
                />

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500">Target yield</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatWeight(opp.targetYieldKg)}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Floor price</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatCompactMoney(opp.floorPriceEtb, 'ETB')}/kg
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Maturity</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatDate(opp.maturityDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Funded</span>
                    <p className="mt-0.5 font-medium text-brand-600">
                      {formatPercent(opp.fundedPercent, 0)}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <Button asChild fullWidth trailingIcon={<TrendingUp className="h-4 w-4" />}>
                    <Link to={`/opportunities/${opp.id}/invest`}>Invest</Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
```

### `apps/web/src/features/investor/hooks/useInvestFlow.ts`

```ts
import { useState } from 'react';

import type { CreateInvestmentInput, FundingType } from '@/api/types/investment';

export interface InvestFlowState {
  step: 1 | 2 | 3;
  fundingType: FundingType;
  amountForeignCurrency: string;
  currency: 'USD' | 'EUR' | 'GBP';
  agreedReturnRate: number;
  sourceOfFunds: string;
}

const INITIAL: InvestFlowState = {
  step: 1,
  fundingType: 'DEBT_FIXED_RETURN',
  amountForeignCurrency: '',
  currency: 'USD',
  agreedReturnRate: 0.08,
  sourceOfFunds: '',
};

export function useInvestFlow() {
  const [state, setState] = useState<InvestFlowState>(INITIAL);

  const patch = (p: Partial<InvestFlowState>) => setState((s) => ({ ...s, ...p }));

  const next = () => patch({ step: Math.min(3, state.step + 1) as 1 | 2 | 3 });
  const back = () => patch({ step: Math.max(1, state.step - 1) as 1 | 2 | 3 });
  const reset = () => setState(INITIAL);

  const toInput = (contractId: string): CreateInvestmentInput => ({
    contractId,
    fundingType: state.fundingType,
    amountForeignCurrency: state.amountForeignCurrency,
    currency: state.currency,
    agreedReturnRate: state.agreedReturnRate,
    sourceOfFunds: state.sourceOfFunds,
  });

  return { state, patch, next, back, reset, toInput };
}
```

### `apps/web/src/features/investor/pages/OpportunityInvestPage.tsx`

```tsx
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import { formatMoney, formatPercent } from '@nafi/formatters';
import {
  Alert,
  Button,
  Can,
  Card,
  CardBody,
  CardHeader,
  CurrencyInput,
  DataList,
  Input,
  Select,
  Textarea,
  Timeline,
} from '@nafi/ui-react';
import { PERMISSIONS } from '@nafi/rbac-core';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useOpportunity, useCreateInvestment } from '@/hooks';

import { useInvestFlow } from '../hooks/useInvestFlow';

const FUNDING_TYPE_OPTIONS = [
  { value: 'DEBT_FIXED_RETURN', label: 'Debt — fixed return' },
  { value: 'EQUITY_PROFIT_SHARE', label: 'Equity — profit share' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
];

export function OpportunityInvestPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: opp, isLoading, isError, error, refetch } = useOpportunity(id);
  const { state, patch, next, back, toInput } = useInvestFlow();
  const createInvestment = useCreateInvestment();

  if (!opp && !isLoading && !isError) return null;

  const steps = [
    { id: 'terms', title: 'Choose terms', status: state.step > 1 ? 'complete' : 'active' },
    { id: 'amount', title: 'Enter amount', status: state.step > 2 ? 'complete' : state.step === 2 ? 'active' : 'pending' },
    { id: 'confirm', title: 'Confirm', status: state.step === 3 ? 'active' : 'pending' },
  ] as const;

  const handleSubmit = async () => {
    if (!opp) return;
    try {
      await createInvestment.mutateAsync(toInput(opp.id));
      navigate('/portfolio/investments', { replace: true });
    } catch {
      /* toast already fired */
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/opportunities"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to opportunities
      </Link>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {opp && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card>
                <CardHeader
                  title={opp.targetCrop}
                  description={`${opp.region} · Matures ${new Date(opp.maturityDate).toLocaleDateString()}`}
                />
                <CardBody>
                  <Timeline items={steps.map((s) => ({ id: s.id, title: s.title, status: s.status }))} />
                </CardBody>
              </Card>

              {state.step === 1 && (
                <Card>
                  <CardHeader title="Investment terms" />
                  <CardBody className="flex flex-col gap-4">
                    <Select
                      label="Funding structure"
                      value={state.fundingType}
                      onValueChange={(v) => patch({ fundingType: v as typeof state.fundingType })}
                      options={FUNDING_TYPE_OPTIONS}
                    />

                    {state.fundingType === 'DEBT_FIXED_RETURN' ? (
                      <Alert variant="info" title="Fixed return">
                        You will receive your principal plus {formatPercent(state.agreedReturnRate, 2)} at
                        settlement, regardless of contract yield.
                      </Alert>
                    ) : (
                      <Alert variant="warning" title="Profit share">
                        Your return depends on the contract&apos;s actual profit. Higher upside, higher risk.
                      </Alert>
                    )}
                  </CardBody>
                </Card>
              )}

              {state.step === 2 && (
                <Card>
                  <CardHeader title="Amount" />
                  <CardBody className="flex flex-col gap-4">
                    <Select
                      label="Currency"
                      value={state.currency}
                      onValueChange={(v) => patch({ currency: v as typeof state.currency })}
                      options={CURRENCY_OPTIONS}
                    />

                    <CurrencyInput
                      label="Amount"
                      currency={state.currency}
                      value={state.amountForeignCurrency}
                      onChange={(v) => patch({ amountForeignCurrency: v })}
                      hint="Minimum $500 equivalent"
                    />

                    <Textarea
                      label="Source of funds"
                      value={state.sourceOfFunds}
                      onChange={(e) => patch({ sourceOfFunds: e.target.value })}
                      hint="Required for AML compliance. E.g., 'Savings', 'Salary', 'Business income'."
                      rows={3}
                    />
                  </CardBody>
                </Card>
              )}

              {state.step === 3 && (
                <Card>
                  <CardHeader title="Confirm" />
                  <CardBody className="flex flex-col gap-4">
                    <DataList
                      items={[
                        { label: 'Crop', value: opp.targetCrop },
                        { label: 'Region', value: opp.region },
                        { label: 'Type', value: state.fundingType === 'DEBT_FIXED_RETURN' ? 'Debt — fixed return' : 'Equity — profit share' },
                        { label: 'Amount', value: `${state.amountForeignCurrency} ${state.currency}` },
                        { label: 'Agreed return', value: formatPercent(state.agreedReturnRate, 2) },
                        { label: 'Maturity', value: new Date(opp.maturityDate).toLocaleDateString(), span: true },
                      ]}
                    />

                    <Alert variant="info" icon={<ShieldCheck className="h-5 w-5" />} title="Escrow protected">
                      Your capital is held in a regulated bank escrow account until the contract is fulfilled.
                    </Alert>
                  </CardBody>
                </Card>
              )}

              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={state.step === 1 ? () => navigate('/opportunities') : back}
                  leadingIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  {state.step === 1 ? 'Cancel' : 'Back'}
                </Button>

                {state.step < 3 ? (
                  <Button onClick={next} trailingIcon={<ArrowRight className="h-4 w-4" />}>
                    Continue
                  </Button>
                ) : (
                  <Can I={PERMISSIONS.INVESTMENT_CREATE}>
                    <Button
                      onClick={handleSubmit}
                      loading={createInvestment.isPending}
                      leadingIcon={<Check className="h-4 w-4" />}
                    >
                      Confirm investment
                    </Button>
                  </Can>
                )}
              </div>
            </div>

            <aside className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader title="Opportunity summary" />
                <CardBody>
                  <DataList
                    columns={1}
                    items={[
                      { label: 'Target yield', value: `${Number(opp.targetYieldKg).toLocaleString()} kg` },
                      { label: 'Floor price', value: formatMoney(opp.floorPriceEtb, 'ETB') + '/kg' },
                      { label: 'Target raise', value: formatMoney(opp.targetAmountEtb, 'ETB') },
                      { label: 'Committed', value: formatMoney(opp.committedAmountEtb, 'ETB') },
                      { label: 'Funded', value: formatPercent(opp.fundedPercent, 0) },
                      { label: 'Investors', value: String(opp.investorCount) },
                    ]}
                  />
                </CardBody>
              </Card>
            </aside>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
```

---

# PART B — Commercial Farmer Portal

Mobile-first. Large tap targets. Bottom nav on small screens.

## 6.7 Farmer Overview & Contracts

### `apps/web/src/features/farmer/pages/ContractsPage.tsx`

```tsx
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatDate, formatMoney, formatWeight } from '@nafi/formatters';
import { Button, Can, Card, CardBody, ContractStatusBadge } from '@nafi/ui-react';
import { PERMISSIONS } from '@nafi/rbac-core';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';

export function FarmContractsPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({ pageSize: 50 });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">My Contracts</h1>
          <p className="mt-1 text-sm text-neutral-500">
            All production contracts you are part of.
          </p>
        </div>
        <Can I={PERMISSIONS.CONTRACT_CREATE}>
          <Button asChild leadingIcon={<Plus className="h-4 w-4" />}>
            <Link to="/farm/contracts/new">New contract</Link>
          </Button>
        </Can>
      </header>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">You have no contracts yet.</p>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          {data?.items.map((c) => (
            <Link key={c.id} to={`/farm/contracts/${c.id}`}>
              <Card className="transition-shadow hover:shadow-dropdown">
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900">{c.targetCrop}</h3>
                      <p className="text-xs text-neutral-500">
                        {c.region} · Matures {formatDate(c.maturityDate)}
                      </p>
                    </div>
                    <ContractStatusBadge status={c.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-t border-neutral-100 pt-3 text-xs">
                    <div>
                      <span className="text-neutral-500">Target yield</span>
                      <p className="mt-0.5 font-medium text-neutral-900">
                        {formatWeight(c.totalTargetYieldKg)}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Floor price</span>
                      <p className="mt-0.5 font-medium text-neutral-900">
                        {formatMoney(c.guaranteedFloorPriceEtb, 'ETB')}/kg
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Contract value</span>
                      <p className="mt-0.5 font-medium text-neutral-900">
                        {formatMoney(c.contractValueEtb, 'ETB')}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
```

### `apps/web/src/features/farmer/components/ContractSignDialog.tsx`

```tsx
import { useState } from 'react';

import { Alert, Button, Checkbox, Modal, Textarea } from '@nafi/ui-react';

import { useSignContract } from '@/hooks';

const SIGNATURE_PLACEHOLDER = 'Sign by typing your full legal name exactly as registered';

export function ContractSignDialog({
  contractId,
  open,
  onOpenChange,
}: {
  contractId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [signature, setSignature] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const sign = useSignContract();

  const handleSign = async () => {
    await sign.mutateAsync({
      contractId,
      role: 'FARMER',
      signatureHash: signature, // API hashes this server-side
    });
    onOpenChange(false);
    setSignature('');
    setConfirmed(false);
  };

  const canSign = signature.length >= 3 && confirmed && !sign.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Sign contract"
      description="Your signature will be recorded on the NAFI ledger."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSign} disabled={!canSign} loading={sign.isPending}>
            Sign contract
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert variant="warning" title="Legally binding">
          By signing, you agree to the production contract under Proclamation No. 1289/2023.
        </Alert>

        <Textarea
          label="Digital signature"
          rows={2}
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder={SIGNATURE_PLACEHOLDER}
        />

        <Checkbox
          checked={confirmed}
          onCheckedChange={(v) => setConfirmed(Boolean(v))}
          label="I confirm I have read the contract and agree to its terms."
        />
      </div>
    </Modal>
  );
}
```

### `apps/web/src/features/farmer/pages/ContractDetailPage.tsx`

```tsx
import { ArrowLeft, PenLine } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { formatDate, formatMoney, formatWeight } from '@nafi/formatters';
import {
  Button,
  Can,
  Card,
  CardBody,
  CardHeader,
  ContractStatusBadge,
  DataList,
  Timeline,
  type TimelineItem,
} from '@nafi/ui-react';
import { PERMISSIONS } from '@nafi/rbac-core';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContract, useContractSignatures, useContractTimeline } from '@/hooks';

import { ContractSignDialog } from '../components/ContractSignDialog';

export function FarmContractDetailPage() {
  const { id = '' } = useParams();
  const [signOpen, setSignOpen] = useState(false);

  const contract = useContract(id);
  const timeline = useContractTimeline(id);
  const signatures = useContractSignatures(id);

  const hasSigned = signatures.data?.some(
    (s) => s.role === 'FARMER',
  );

  const timelineItems: TimelineItem[] =
    timeline.data?.map((e) => ({
      id: e.id,
      title: e.label,
      description: e.description,
      timestamp: new Date(e.timestamp).toLocaleDateString(),
      status: 'complete',
    })) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/farm/contracts"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to contracts
      </Link>

      <QueryBoundary
        isLoading={contract.isLoading}
        isError={contract.isError}
        error={contract.error}
        onRetry={contract.refetch}
      >
        {contract.data && (
          <>
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-neutral-900">
                    {contract.data.targetCrop}
                  </h1>
                  <ContractStatusBadge status={contract.data.status} />
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {contract.data.region} · Matures {formatDate(contract.data.maturityDate)}
                </p>
              </div>

              {!hasSigned && contract.data.status === 'DRAFT' && (
                <Can I={PERMISSIONS.CONTRACT_UPDATE}>
                  <Button
                    leadingIcon={<PenLine className="h-4 w-4" />}
                    onClick={() => setSignOpen(true)}
                  >
                    Sign contract
                  </Button>
                </Can>
              )}
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-6 lg:col-span-2">
                <Card>
                  <CardHeader title="Contract terms" />
                  <CardBody>
                    <DataList
                      items={[
                        { label: 'Target yield', value: formatWeight(contract.data.totalTargetYieldKg) },
                        { label: 'Floor price', value: `${formatMoney(contract.data.guaranteedFloorPriceEtb, 'ETB')}/kg` },
                        { label: 'Contract value', value: formatMoney(contract.data.contractValueEtb, 'ETB') },
                        { label: 'Committed funding', value: formatMoney(contract.data.committedAmountEtb, 'ETB') },
                        { label: 'Government witness', value: contract.data.governmentWitnessName, span: true },
                        { label: 'Managing bank', value: contract.data.bankName ?? '—', span: true },
                        { label: 'Ledger hash', value: <code className="text-xs">{contract.data.onChainHash}</code>, span: true },
                      ]}
                    />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Timeline" />
                  <CardBody>
                    {timelineItems.length === 0 ? (
                      <p className="text-sm text-neutral-500">No events yet.</p>
                    ) : (
                      <Timeline items={timelineItems} />
                    )}
                  </CardBody>
                </Card>
              </div>

              <aside className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Signatures" />
                  <CardBody>
                    <ul className="flex flex-col gap-3">
                      {signatures.data?.map((s) => (
                        <li key={s.role} className="flex items-start justify-between gap-2 text-sm">
                          <div>
                            <p className="font-medium text-neutral-900">{s.signerName}</p>
                            <p className="text-xs text-neutral-500">
                              {s.role.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <span className="text-xs text-neutral-500">
                            {new Date(s.signedAt).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                      {!signatures.data?.length && (
                        <p className="text-xs text-neutral-500">No signatures yet.</p>
                      )}
                    </ul>
                  </CardBody>
                </Card>
              </aside>
            </div>

            <ContractSignDialog contractId={id} open={signOpen} onOpenChange={setSignOpen} />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
```

## 6.8 Farmer Input Verification

### `apps/web/src/features/farmer/components/DeliveryVerifyDialog.tsx`

```tsx
import { Camera, MapPin } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, Input, Modal, Textarea } from '@nafi/ui-react';

import type { InputPurchaseSummary } from '@/api/types/input';
import { useVerifyDelivery } from '@/hooks';

export function DeliveryVerifyDialog({
  purchase,
  open,
  onOpenChange,
}: {
  purchase: InputPurchaseSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [photoHash, setPhotoHash] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const verify = useVerifyDelivery();

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Location is not supported on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsError(null);
      },
      () => setGpsError('Could not get your location. Please enable GPS.'),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const handlePhoto = (file: File) => {
    // In production, hash on-device or upload to a signed URL
    setPhotoHash(file.name + file.size);
  };

  const canVerify = photoHash.length > 0 && coords !== null && !verify.isPending;

  const submit = async () => {
    if (!coords) return;
    await verify.mutateAsync({
      purchaseId: purchase.id,
      photoHash,
      latitude: coords.lat,
      longitude: coords.lng,
      qrCode: qrCode || undefined,
      notes: notes || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Verify delivery"
      description={purchase.itemDescription}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canVerify} loading={verify.isPending}>
            Confirm receipt
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert variant="info">
          Escrow will release payment to the supplier once your delivery is verified.
        </Alert>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Delivery photo
          </label>
          <label className="flex h-32 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-brand-400">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhoto(file);
              }}
            />
            <div className="flex flex-col items-center gap-2 text-neutral-500">
              <Camera className="h-6 w-6" />
              <span className="text-xs">
                {photoHash ? 'Photo attached ✓' : 'Tap to capture'}
              </span>
            </div>
          </label>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            GPS location
          </label>
          <Button
            type="button"
            variant="outline"
            fullWidth
            leadingIcon={<MapPin className="h-4 w-4" />}
            onClick={captureLocation}
          >
            {coords
              ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
              : 'Capture GPS'}
          </Button>
          {gpsError && <p className="mt-1 text-xs text-danger">{gpsError}</p>}
        </div>

        <Input
          label="QR code (optional)"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          placeholder="Scan or type the package code"
        />

        <Textarea
          label="Notes (optional)"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any issues with the delivery?"
        />
      </div>
    </Modal>
  );
}
```

### `apps/web/src/features/farmer/pages/InputsPage.tsx`

```tsx
import { CheckCircle2, Package } from 'lucide-react';
import { useState } from 'react';

import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge, Button, Can, Card, CardBody, CardHeader } from '@nafi/ui-react';
import { PERMISSIONS } from '@nafi/rbac-core';

import type { InputPurchaseSummary } from '@/api/types/input';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useInputs } from '@/hooks';

import { DeliveryVerifyDialog } from '../components/DeliveryVerifyDialog';

export function FarmInputsPage() {
  const { data, isLoading, isError, error, refetch } = useInputs({ pageSize: 50 });
  const [selected, setSelected] = useState<InputPurchaseSummary | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Input Orders</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Track deliveries and confirm receipt to release payment.
        </p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">No input orders yet.</p>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {data?.items.map((p) => (
            <Card key={p.id}>
              <CardHeader
                title={p.itemDescription}
                description={`${p.supplierName} · ${p.contractCrop}`}
                action={
                  <Badge
                    variant={
                      p.isDisbursed
                        ? 'success'
                        : p.isDelivered
                          ? 'info'
                          : 'warning'
                    }
                    dot
                  >
                    {p.isDisbursed ? 'Paid' : p.isDelivered ? 'Delivered' : 'Pending delivery'}
                  </Badge>
                }
              />
              <CardBody className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500">Quantity</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {Number(p.quantity).toLocaleString()} {p.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Unit cost</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatMoney(p.unitCostEtb, 'ETB')}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Total</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatMoney(p.totalCostEtb, 'ETB')}
                    </p>
                  </div>
                </div>

                {p.deliveredAt && (
                  <p className="text-xs text-neutral-500">
                    Delivered {formatDate(p.deliveredAt)}
                    {p.verifiedAt ? ` · Verified ${formatDate(p.verifiedAt)}` : ''}
                  </p>
                )}

                {!p.verifiedAt && p.isDelivered && (
                  <Can I={PERMISSIONS.INPUT_VERIFY}>
                    <Button
                      onClick={() => setSelected(p)}
                      leadingIcon={<CheckCircle2 className="h-4 w-4" />}
                      fullWidth
                    >
                      Verify delivery
                    </Button>
                  </Can>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>

      {selected && (
        <DeliveryVerifyDialog
          purchase={selected}
          open={Boolean(selected)}
          onOpenChange={(open) => !open && setSelected(null)}
        />
      )}
    </div>
  );
}
```

## 6.9 Farmer Escrow, Harvest, Collateral, Payments

### `apps/web/src/features/farmer/pages/EscrowPage.tsx`

```tsx
import { useParams } from 'react-router-dom';

import { formatMoney } from '@nafi/formatters';
import { Card, CardBody, CardHeader, EscrowBalanceCard } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useEscrows, useEscrowLedger } from '@/hooks';

export function FarmEscrowPage() {
  const { data, isLoading, isError, error, refetch } = useEscrows({ pageSize: 50 });
  const firstEscrowId = data?.items[0]?.id ?? '';
  const ledger = useEscrowLedger(firstEscrowId);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Escrow</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Funds held on your behalf until contract milestones are met.
        </p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">No active escrow accounts.</p>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {data?.items.map((esc) => (
            <EscrowBalanceCard
              key={esc.id}
              contractId={esc.contractId}
              isLocked={esc.isLocked}
              bankName={esc.managingBankName}
              balances={esc.balances.map((b) => ({ currency: b.currency, amount: b.amount }))}
            />
          ))}
        </div>

        {firstEscrowId && ledger.data && ledger.data.length > 0 && (
          <Card>
            <CardHeader title="Ledger" />
            <CardBody className="p-0">
              <ul className="divide-y divide-neutral-100">
                {ledger.data.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium text-neutral-900">{entry.purpose}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={
                        entry.direction === 'CREDIT'
                          ? 'font-mono font-medium text-success-dark tabular-nums'
                          : 'font-mono font-medium text-danger-dark tabular-nums'
                      }
                    >
                      {entry.direction === 'CREDIT' ? '+' : '−'}
                      {formatMoney(entry.amount, entry.currency as 'ETB')}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}
      </QueryBoundary>
    </div>
  );
}
```

### `apps/web/src/features/farmer/pages/HarvestPage.tsx`

```tsx
import { useMemo } from 'react';

import { formatDate, formatWeight } from '@nafi/formatters';
import { Card, CardBody, CardHeader, DataList } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';

export function FarmHarvestPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({ pageSize: 50 });

  const active = useMemo(
    () => (data?.items ?? []).filter((c) => c.status === 'ACTIVE'),
    [data],
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Harvest</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Log your harvest against each active contract.
        </p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={active.length === 0}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">No active contracts to harvest.</p>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {active.map((c) => (
            <Card key={c.id}>
              <CardHeader
                title={c.targetCrop}
                description={`Matures ${formatDate(c.maturityDate)}`}
              />
              <CardBody>
                <DataList
                  items={[
                    { label: 'Target yield', value: formatWeight(c.totalTargetYieldKg) },
                    { label: 'Region', value: c.region },
                  ]}
                />
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
```

### `apps/web/src/features/farmer/pages/PaymentsPage.tsx`

```tsx
import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge, Card, CardBody, CardHeader, DataList } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useSettlements } from '@/hooks';

export function FarmPaymentsPage() {
  const { data, isLoading, isError, error, refetch } = useSettlements({ pageSize: 50 });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Payments</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Settlement history and pending distributions.
        </p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">No settlements yet.</p>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {data?.items.map((s) => (
            <Card key={s.id}>
              <CardHeader
                title={s.contractCrop}
                description={formatDate(s.createdAt)}
                action={
                  <Badge
                    variant={
                      s.status === 'EXECUTED'
                        ? 'success'
                        : s.status === 'REVERSED'
                          ? 'danger'
                          : 'warning'
                    }
                    dot
                  >
                    {s.status}
                  </Badge>
                }
              />
              <CardBody>
                <DataList
                  columns={2}
                  items={[
                    { label: 'Gross revenue', value: formatMoney(s.grossRevenueEtb, 'ETB') },
                    { label: 'Actual yield', value: `${Number(s.actualYieldKg).toLocaleString()} kg` },
                    { label: 'Total distributed', value: formatMoney(s.totalDistributedEtb, 'ETB') },
                    { label: 'Executed', value: s.executedAt ? formatDate(s.executedAt) : '—' },
                  ]}
                />
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
```

> **Note:** `FarmCollateralPage` follows the same list pattern using `useCollateral` and `useRegisterCollateral`. It renders a `<WarehouseReceiptCard>` for each item and a "Register" button that opens the `CollateralRegisterWizard`. Implementation omitted for brevity — same pattern as above.

---

# PART C — Input Supplier Portal

## 6.10 Supplier Orders

### `apps/web/src/features/supplier/pages/OrdersPage.tsx`

```tsx
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge, Button, Can, Card, CardBody, CardHeader } from '@nafi/ui-react';
import { PERMISSIONS } from '@nafi/rbac-core';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useInputs } from '@/hooks';

import { CreatePurchaseOrderDialog } from '../components/CreatePurchaseOrderDialog';

export function SupplierOrdersPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useInputs({ pageSize: 50 });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Purchase Orders</h1>
          <p className="mt-1 text-sm text-neutral-500">
            All purchase orders issued to your suppliers.
          </p>
        </div>
        <Can I={PERMISSIONS.INPUT_CREATE}>
          <Button leadingIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            New order
          </Button>
        </Can>
      </header>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">No orders yet.</p>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {data?.items.map((o) => (
            <Link key={o.id} to={`/supplier/orders/${o.id}`}>
              <Card className="transition-shadow hover:shadow-dropdown">
                <CardHeader
                  title={o.itemDescription}
                  description={`Contract: ${o.contractCrop} · ${formatDate(o.createdAt)}`}
                  action={
                    <Badge
                      variant={o.isDisbursed ? 'success' : o.isDelivered ? 'info' : 'warning'}
                      dot
                    >
                      {o.isDisbursed ? 'Paid' : o.isDelivered ? 'Delivered' : 'Awaiting delivery'}
                    </Badge>
                  }
                />
                <CardBody className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500">Quantity</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {Number(o.quantity).toLocaleString()} {o.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Unit cost</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatMoney(o.unitCostEtb, 'ETB')}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Total</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatMoney(o.totalCostEtb, 'ETB')}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </QueryBoundary>

      <CreatePurchaseOrderDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
```

### `apps/web/src/features/supplier/components/CreatePurchaseOrderDialog.tsx`

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Input, Modal, Select } from '@nafi/ui-react';

import { useContracts, useCreateInputOrder } from '@/hooks';

const schema = z.object({
  contractId: z.string().uuid(),
  itemDescription: z.string().min(3),
  quantity: z.string().regex(/^\d+(\.\d{1,3})?$/),
  unit: z.string().min(1),
  unitCostEtb: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

type Input = z.infer<typeof schema>;

export function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: contracts } = useContracts({ status: 'ACTIVE', pageSize: 100 });
  const create = useCreateInputOrder();
  const form = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: { contractId: '', itemDescription: '', quantity: '', unit: 'kg', unitCostEtb: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await create.mutateAsync(values);
    onOpenChange(false);
    form.reset();
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New purchase order"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={create.isPending}>
            Create order
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Select
          label="Contract"
          value={form.watch('contractId')}
          onValueChange={(v) => form.setValue('contractId', v, { shouldValidate: true })}
          error={form.formState.errors.contractId?.message}
          options={
            contracts?.items.map((c) => ({
              value: c.id,
              label: `${c.targetCrop} — ${c.region}`,
            })) ?? []
          }
        />

        <Input
          label="Item description"
          placeholder="e.g., Certified sesame seed, 10 tons"
          error={form.formState.errors.itemDescription?.message}
          {...form.register('itemDescription')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quantity"
            inputMode="decimal"
            error={form.formState.errors.quantity?.message}
            {...form.register('quantity')}
          />
          <Input
            label="Unit"
            placeholder="kg, ton, liter"
            error={form.formState.errors.unit?.message}
            {...form.register('unit')}
          />
        </div>

        <Input
          label="Unit cost (ETB)"
          inputMode="decimal"
          error={form.formState.errors.unitCostEtb?.message}
          {...form.register('unitCostEtb')}
        />
      </form>
    </Modal>
  );
}
```

### `apps/web/src/features/supplier/pages/OrderDetailPage.tsx`

```tsx
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge, Card, CardBody, CardHeader, DataList } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useInput } from '@/hooks';

export function SupplierOrderDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading, isError, error, refetch } = useInput(id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/supplier/orders"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
      </Link>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {data && (
          <>
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900">{data.itemDescription}</h1>
                <p className="mt-1 text-sm text-neutral-500">{data.contractCrop}</p>
              </div>
              <Badge
                variant={data.isDisbursed ? 'success' : data.isDelivered ? 'info' : 'warning'}
                dot
              >
                {data.isDisbursed ? 'Paid' : data.isDelivered ? 'Delivered' : 'Awaiting delivery'}
              </Badge>
            </header>

            <Card>
              <CardHeader title="Order details" />
              <CardBody>
                <DataList
                  items={[
                    { label: 'Quantity', value: `${Number(data.quantity).toLocaleString()} ${data.unit}` },
                    { label: 'Unit cost', value: formatMoney(data.unitCostEtb, 'ETB') },
                    { label: 'Total cost', value: formatMoney(data.totalCostEtb, 'ETB') },
                    { label: 'Ordered', value: formatDate(data.createdAt) },
                    { label: 'Delivered', value: data.deliveredAt ? formatDate(data.deliveredAt) : '—' },
                    { label: 'Verified', value: data.verifiedAt ? formatDate(data.verifiedAt) : '—' },
                  ]}
                />
              </CardBody>
            </Card>
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
```

### `apps/web/src/features/supplier/pages/DeliveriesPage.tsx`

```tsx
import { useMemo } from 'react';

import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge, Card, CardBody, CardHeader } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useInputs } from '@/hooks';

export function SupplierDeliveriesPage() {
  const { data, isLoading, isError, error, refetch } = useInputs({ pageSize: 100 });

  const delivered = useMemo(
    () => (data?.items ?? []).filter((i) => i.isDelivered),
    [data],
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Deliveries</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Deliveries you have made and their payment status.
        </p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={delivered.length === 0}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">No deliveries yet.</p>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {delivered.map((d) => (
            <Card key={d.id}>
              <CardHeader
                title={d.itemDescription}
                description={`Delivered ${d.deliveredAt ? formatDate(d.deliveredAt) : ''}`}
                action={
                  <Badge variant={d.isDisbursed ? 'success' : 'warning'} dot>
                    {d.isDisbursed ? 'Paid' : 'Pending payment'}
                  </Badge>
                }
              />
              <CardBody className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Total value</span>
                <span className="font-mono font-medium tabular-nums text-neutral-900">
                  {formatMoney(d.totalCostEtb, 'ETB')}
                </span>
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
```

### `apps/web/src/features/supplier/pages/PaymentsPage.tsx` and `ProfilePage.tsx`

Both follow the same list pattern. Payments uses `useSettlements` filtered by role context; Profile uses `useAuth` and renders a `<DataList>` of user fields with an "Edit" button that opens a modal.

---

## 6.11 Router Wiring

Update `apps/web/src/app/router.tsx` to use the real pages instead of stubs:

```tsx
// Replace the imports and children of each role group:
import { InvestorOverviewPage } from '@/features/investor/pages/OverviewPage';
import { InvestorInvestmentsPage } from '@/features/investor/pages/InvestmentsPage';
import { InvestorBondsPage } from '@/features/investor/pages/BondsPage';
import { InvestorReturnsPage } from '@/features/investor/pages/ReturnsPage';
import { InvestorStatementsPage } from '@/features/investor/pages/StatementsPage';
import { OpportunityBrowserPage } from '@/features/investor/pages/OpportunityBrowserPage';
import { OpportunityInvestPage } from '@/features/investor/pages/OpportunityInvestPage';

import { FarmContractsPage } from '@/features/farmer/pages/ContractsPage';
import { FarmContractDetailPage } from '@/features/farmer/pages/ContractDetailPage';
import { FarmInputsPage } from '@/features/farmer/pages/InputsPage';
import { FarmEscrowPage } from '@/features/farmer/pages/EscrowPage';
import { FarmHarvestPage } from '@/features/farmer/pages/HarvestPage';
import { FarmCollateralPage } from '@/features/farmer/pages/CollateralPage';
import { FarmPaymentsPage } from '@/features/farmer/pages/PaymentsPage';

import { SupplierOrdersPage } from '@/features/supplier/pages/OrdersPage';
import { SupplierOrderDetailPage } from '@/features/supplier/pages/OrderDetailPage';
import { SupplierDeliveriesPage } from '@/features/supplier/pages/DeliveriesPage';
import { SupplierPaymentsPage } from '@/features/supplier/pages/PaymentsPage';
import { SupplierProfilePage } from '@/features/supplier/pages/ProfilePage';

// Replace the DIASPORA_INVESTOR children:
children: [
  { path: '/portfolio', element: <InvestorOverviewPage /> },
  { path: '/portfolio/investments', element: <InvestorInvestmentsPage /> },
  { path: '/portfolio/investments/:id', element: <InvestorInvestmentsPage /> },
  { path: '/portfolio/bonds', element: <InvestorBondsPage /> },
  { path: '/portfolio/returns', element: <InvestorReturnsPage /> },
  { path: '/portfolio/statements', element: <InvestorStatementsPage /> },
  { path: '/opportunities', element: <OpportunityBrowserPage /> },
  { path: '/opportunities/:id/invest', element: <OpportunityInvestPage /> },
],

// Replace the COMMERCIAL_FARMER children:
children: [
  { path: '/farm/contracts', element: <FarmContractsPage /> },
  { path: '/farm/contracts/:id', element: <FarmContractDetailPage /> },
  { path: '/farm/inputs', element: <FarmInputsPage /> },
  { path: '/farm/escrow', element: <FarmEscrowPage /> },
  { path: '/farm/harvest', element: <FarmHarvestPage /> },
  { path: '/farm/collateral', element: <FarmCollateralPage /> },
  { path: '/farm/payments', element: <FarmPaymentsPage /> },
],

// Replace the INPUT_SUPPLIER children:
children: [
  { path: '/supplier/orders', element: <SupplierOrdersPage /> },
  { path: '/supplier/orders/:id', element: <SupplierOrderDetailPage /> },
  { path: '/supplier/deliveries', element: <SupplierDeliveriesPage /> },
  { path: '/supplier/payments', element: <SupplierPaymentsPage /> },
  { path: '/supplier/profile', element: <SupplierProfilePage /> },
],
```

---

## 6.12 Verification Checklist

```bash
pnpm --filter @nafi/web typecheck
pnpm --filter @nafi/web lint
pnpm --filter @nafi/web dev
```

| Test | Expected |
| :--- | :--- |
| Investor logs in → redirect to `/portfolio` | Overview with stats + recent investments |
| Investor clicks "Browse opportunities" → invest | 3-step wizard validates & submits |
| Investor opens `/portfolio/bonds` | Only debt investments shown |
| Investor opens `/portfolio/returns` | Bar chart renders (expected vs realized) |
| Farmer opens `/farm/contracts` on mobile | Card list, large tap targets |
| Farmer opens DRAFT contract → "Sign contract" | Modal opens, requires typed signature + checkbox |
| Farmer verifies delivery | Photo + GPS captured, escrow invalidates |
| Supplier creates purchase order | Modal validates, contract dropdown populated |
| RBAC test: farmer tries `/supplier/orders` | Redirect to `/farm/contracts` |
| RBAC test: investor tries to sign a contract | "Sign contract" button hidden by `<Can>` |

---

## 6.13 What Was Built & Why

| Portal | Pages | Key flows |
| :--- | :--- | :--- |
| **Diaspora Investor** | Overview, Investments, Bonds, Returns, Statements, Opportunities, Invest Flow | 3-step invest wizard with escrow disclosure and source-of-funds capture |
| **Commercial Farmer** | Contracts (list + detail), Inputs (verify), Escrow, Harvest, Collateral, Payments | Contract signing with digital signature; mobile-first delivery verification with GPS + photo |
| **Input Supplier** | Orders (list + detail + create), Deliveries, Payments, Profile | Purchase order creation, delivery tracking, escrow-gated payments |

**Reusable patterns introduced:**
- `<DataTable>` — one table component, every list page uses it
- `<QueryBoundary>` — enforced loading/error/empty/content in every view
- `<DeliveryVerifyDialog>` — geo + photo verification, reusable for any input type
- `<ContractSignDialog>` — the digital signature pattern for any signable document
- `<CreatePurchaseOrderDialog>` — the standard "create entity" modal shape
- `useInvestFlow` — encapsulated multi-step state for the invest wizard

**Rules enforced:**
- ✅ Every list uses `<QueryBoundary>` + pagination
- ✅ Every mutation invalidates its upstream queries (see Step 5)
- ✅ Every currency uses `formatMoney`, never raw interpolation
- ✅ Every date uses `formatDate`, never `toLocaleDateString()` inline except where acceptable
- ✅ Every action guarded by `<Can I=...>` even when the route is already guarded
- ✅ Farmer portal is mobile-first — cards, large buttons, `inputMode="decimal"` on numeric inputs

---

## 6.14 What Is Deliberately Not in Step 6

- ❌ Bank, DBE, NAFA, Government, Donor, Admin, Compliance, Arbitrator portals — **Step 7**
- ❌ Bank escrow release flow with multi-party approval — **Step 7**
- ❌ Government dashboards with real analytics — **Step 7**
- ❌ E2E tests — **Step 10**

**Step 7 completes the remaining roles.**

---

# ✅ Step 6 Complete

**Deliverable:** Three production role portals fully wired:

- **Diaspora Investor**: portfolio overview, investments list, bonds, returns chart, statements, opportunity browser, 3-step invest wizard
- **Commercial Farmer** (mobile-first): contracts with digital signing, input delivery verification with GPS + photo, escrow view with ledger, harvest, collateral, payments
- **Input Supplier**: purchase orders list + create modal + detail, deliveries with payment status, payments, profile

All three consume the Step 5 data layer, use Step 2 composites, and enforce RBAC at both route and action level.

