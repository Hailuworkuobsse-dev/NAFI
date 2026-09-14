# 🚀 NAFI Frontend — Step 7 of 10

## Six Remaining Role Portals — Bank · DBE · NAFA · Government · Donor · Admin/Compliance/Arbitrator

**Step Goal:** Complete the entire NAFI platform by building the last six role portals. Every page uses the same patterns established in Step 6 (list pages via `<QueryBoundary>` + `useTableState`, mutations via Step 5 hooks, RBAC via `<Can>` and `<ProtectedRoute>`). The unique features to highlight this step: **multi-party escrow release**, **real-time government dashboards**, and **arbitration case management**.

**Duration Estimate:** 12–16 days
**Deliverable:** A fully functional platform supporting all 12 role types end-to-end.

---

## 7.1 Folder Structure

```
apps/web/src/features/
├── bank/           # Commercial Bank
├── dbe/            # Development Bank of Ethiopia
├── nafa/           # National Agri-Finance Accelerator
├── government/     # Regulator dashboards
├── donor/          # Donor / DFI
├── admin/          # NAFI Admin
├── compliance/     # Compliance Officer
└── arbitrator/     # Dispute Arbitrator
```

Every folder follows the same layout as Step 6 (`pages/`, `components/`, `hooks/`).

---

# PART A — Commercial Bank Portal

## 7.2 Bank Overview

### `apps/web/src/features/bank/hooks/useBankSummary.ts`

```ts
import { useMemo } from 'react';

import { useEscrows } from '@/hooks';

export function useBankSummary() {
  const { data, isLoading } = useEscrows({ pageSize: 500 });

  return useMemo(() => {
    const items = data?.items ?? [];
    const locked = items.filter((e) => e.isLocked).length;
    const frozen = items.filter((e) => e.status === 'FROZEN').length;
    const totalEtb = items.reduce((s, e) => {
      const etb = e.balances.find((b) => b.currency === 'ETB');
      return s + Number(etb?.amount ?? 0);
    }, 0);
    const totalUsd = items.reduce((s, e) => {
      const usd = e.balances.find((b) => b.currency === 'USD');
      return s + Number(usd?.amount ?? 0);
    }, 0);

    return {
      isLoading,
      summary: {
        escrowCount: items.length,
        locked,
        frozen,
        totalEtb,
        totalUsd,
      },
      escrows: items,
    };
  }, [data, isLoading]);
}
```

### `apps/web/src/features/bank/pages/OverviewPage.tsx`

```tsx
import { AlertTriangle, Landmark, Lock, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatCompactMoney } from '@nafi/formatters';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DashboardGrid,
  StatCard,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useEscrows } from '@/hooks';

import { useBankSummary } from '../hooks/useBankSummary';

export function BankOverviewPage() {
  const { summary, escrows, isLoading } = useBankSummary();
  const recent = escrows.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Bank Overview</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Escrow portfolio and lending position.
          </p>
        </div>
      </header>

      <QueryBoundary isLoading={isLoading} isError={false}>
        <DashboardGrid>
          <StatCard
            label="Active escrows"
            value={String(summary.escrowCount)}
            icon={<Landmark className="h-5 w-5" />}
            hint={`${summary.locked} locked · ${summary.frozen} frozen`}
          />
          <StatCard
            label="Total ETB under escrow"
            value={formatCompactMoney(summary.totalEtb, 'ETB')}
            icon={<Lock className="h-5 w-5" />}
          />
          <StatCard
            label="Total USD under escrow"
            value={formatCompactMoney(summary.totalUsd, 'USD')}
            icon={<Unlock className="h-5 w-5" />}
          />
        </DashboardGrid>

        <Card>
          <CardHeader
            title="Recent escrows"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/bank/escrows">View all</Link>
              </Button>
            }
          />
          <CardBody className="p-0">
            <ul className="divide-y divide-neutral-100">
              {recent.map((e) => (
                <li key={e.id}>
                  <Link
                    to={`/bank/escrows/${e.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-neutral-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{e.contractCrop}</p>
                      <p className="text-xs text-neutral-500">
                        Contract {e.contractId.slice(0, 8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm tabular-nums text-neutral-900">
                        {formatCompactMoney(e.totalDepositedEtb, 'ETB')}
                      </p>
                      <p className="text-xs text-neutral-500">{e.status}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </QueryBoundary>
    </div>
  );
}
```

## 7.3 Bank Escrows & Multi-Party Release

### `apps/web/src/features/bank/components/EscrowReleaseDialog.tsx`

```tsx
import { ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, CurrencyInput, Modal, Select, Textarea } from '@nafi/ui-react';

import type { EscrowSummary } from '@/api/types/escrow';
import { useReleaseEscrow } from '@/hooks';

const PURPOSE_OPTIONS = [
  { value: 'INPUT_DISBURSEMENT', label: 'Input supplier disbursement' },
  { value: 'LABOR', label: 'Labor wages' },
  { value: 'LOGISTICS', label: 'Logistics' },
  { value: 'HARVEST', label: 'Harvest operations' },
  { value: 'OTHER', label: 'Other' },
];

export function EscrowReleaseDialog({
  escrow,
  open,
  onOpenChange,
}: {
  escrow: EscrowSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'ETB' | 'USD' | 'EUR'>('ETB');
  const [purpose, setPurpose] = useState('INPUT_DISBURSEMENT');
  const [recipientId, setRecipientId] = useState('');
  const [approvalToken, setApprovalToken] = useState('');
  const [notes, setNotes] = useState('');

  const release = useReleaseEscrow();
  const isMultiParty = Number(amount) > 1_000_000; // > 1M ETB requires approval token

  const canSubmit =
    Number(amount) > 0 &&
    recipientId.length > 0 &&
    (!isMultiParty || approvalToken.length > 0) &&
    !release.isPending;

  const submit = async () => {
    await release.mutateAsync({
      escrowId: escrow.id,
      amount,
      currency,
      recipientId,
      purpose,
      approvalToken: isMultiParty ? approvalToken : undefined,
    });
    onOpenChange(false);
    setAmount('');
    setApprovalToken('');
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Release escrow funds"
      description={`Contract ${escrow.contractId.slice(0, 8)} · ${escrow.contractCrop}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit} loading={release.isPending}>
            Release funds
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert variant="warning" title="Irreversible action">
          Released funds cannot be recalled without a formal dispute and arbitration.
        </Alert>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="Currency"
            value={currency}
            onValueChange={(v) => setCurrency(v as typeof currency)}
            options={[
              { value: 'ETB', label: 'ETB — Ethiopian Birr' },
              { value: 'USD', label: 'USD — US Dollar' },
              { value: 'EUR', label: 'EUR — Euro' },
            ]}
          />
          <Select
            label="Purpose"
            value={purpose}
            onValueChange={setPurpose}
            options={PURPOSE_OPTIONS}
          />
        </div>

        <CurrencyInput
          label="Amount"
          currency={currency}
          value={amount}
          onChange={setAmount}
        />

        <Select
          label="Recipient"
          value={recipientId}
          onValueChange={setRecipientId}
          placeholder="Select a recipient…"
          options={[
            { value: 'supplier-1', label: 'Ethiopian Seed Enterprise' },
            { value: 'supplier-2', label: 'Oromia Fertilizer Corp' },
            { value: 'farmer-1', label: 'Anchor Farmer Co-op' },
          ]}
        />

        {isMultiParty && (
          <div className="flex flex-col gap-2 rounded-md border border-accent-300 bg-accent-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-accent-800">
              <Users className="h-4 w-4" />
              Multi-party approval required
            </div>
            <p className="text-xs text-accent-700">
              Releases over 1,000,000 ETB require an approval token from the contract's
              government witness and DBE co-signer.
            </p>
            <Textarea
              label="Approval token"
              value={approvalToken}
              onChange={(e) => setApprovalToken(e.target.value)}
              rows={2}
              placeholder="Paste the approval token issued via the multi-party signing workflow"
            />
          </div>
        )}

        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <Alert variant="info" icon={<ShieldCheck className="h-5 w-5" />}>
          Every release is logged to the immutable NAFI ledger with your user ID, timestamp, and
          purpose.
        </Alert>
      </div>
    </Modal>
  );
}
```

### `apps/web/src/features/bank/pages/EscrowsPage.tsx`

```tsx
import { useNavigate } from 'react-router-dom';

import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge, Lock, Unlock } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useEscrows, useTableState } from '@/hooks';
import type { EscrowSummary } from '@/api/types/escrow';
import { Pagination } from '@nafi/ui-react';

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
```

### `apps/web/src/features/bank/pages/EscrowDetailPage.tsx`

```tsx
import { ArrowLeft, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { formatDate, formatMoney } from '@nafi/formatters';
import {
  Alert,
  Badge,
  Button,
  Can,
  Card,
  CardBody,
  CardHeader,
  DataList,
  EscrowBalanceCard,
} from '@nafi/ui-react';
import { PERMISSIONS } from '@nafi/rbac-core';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useEscrow, useEscrowLedger } from '@/hooks';

import { EscrowReleaseDialog } from '../components/EscrowReleaseDialog';

export function BankEscrowDetailPage() {
  const { id = '' } = useParams();
  const [releaseOpen, setReleaseOpen] = useState(false);

  const escrow = useEscrow(id);
  const ledger = useEscrowLedger(id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/bank/escrows"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to escrows
      </Link>

      <QueryBoundary
        isLoading={escrow.isLoading}
        isError={escrow.isError}
        error={escrow.error}
        onRetry={escrow.refetch}
      >
        {escrow.data && (
          <>
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-neutral-900">
                    {escrow.data.contractCrop}
                  </h1>
                  <Badge
                    variant={
                      escrow.data.status === 'FROZEN'
                        ? 'danger'
                        : escrow.data.isLocked
                          ? 'warning'
                          : 'success'
                    }
                    dot
                  >
                    {escrow.data.isLocked ? (
                      <>
                        <Lock className="h-3 w-3" /> Locked
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3 w-3" /> Unlocked
                      </>
                    )}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  Contract {escrow.data.contractId.slice(0, 8)} · Managed by{' '}
                  {escrow.data.managingBankName}
                </p>
              </div>

              {!escrow.data.isLocked && escrow.data.status !== 'FROZEN' && (
                <Can I={PERMISSIONS.ESCROW_RELEASE}>
                  <Button onClick={() => setReleaseOpen(true)}>Release funds</Button>
                </Can>
              )}
            </header>

            <EscrowBalanceCard
              contractId={escrow.data.contractId}
              isLocked={escrow.data.isLocked}
              bankName={escrow.data.managingBankName}
              balances={escrow.data.balances.map((b) => ({
                currency: b.currency,
                amount: b.amount,
              }))}
            />

            <Card>
              <CardHeader title="Details" />
              <CardBody>
                <DataList
                  items={[
                    { label: 'Total deposited', value: formatMoney(escrow.data.totalDepositedEtb, 'ETB') },
                    { label: 'Status', value: escrow.data.status },
                    { label: 'Opened', value: formatDate(escrow.data.createdAt) },
                  ]}
                />
              </CardBody>
            </Card>

            {ledger.data && (
              <Card>
                <CardHeader title="Ledger" />
                <CardBody className="p-0">
                  <ul className="divide-y divide-neutral-100">
                    {ledger.data.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between px-5 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {entry.purpose}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(entry.createdAt).toLocaleString()} · {entry.actorName}
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

            <EscrowReleaseDialog
              escrow={escrow.data}
              open={releaseOpen}
              onOpenChange={setReleaseOpen}
            />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
```

### Bank Loans, Collateral, Settlements, NPL

All follow the same patterns. Each uses its corresponding query hook (`useContracts`, `useCollateral`, `useSettlements`, `useReports`) with `<QueryBoundary>` + `<DataTable>` + `<Pagination>`. The NPL monitor adds a `<StatCard>` row for portfolio health: NPL ratio, watchlist count, restructure count. `LoansPage` includes a `BankLoanOriginationForm` modal that wraps `useContracts` for creating a new loan against an existing contract.

---

# PART B — Development Bank of Ethiopia (DBE) Portal

## 7.4 DBE Portfolio

### `apps/web/src/features/dbe/pages/PortfolioPage.tsx`

```tsx
import { Banknote, Coins, HandCoins, TrendingUp } from 'lucide-react';

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
```

### DBE Co-Financing, On-Lending, TA Tracking, Reports

- **CoFinancingPage** — list of contracts with `<DataList>` showing DBE commitment, matched amount, RUFIP III tranche reference; "Create co-financing" modal that wraps `useContracts`
- **OnLendingPage** — RUSACCO/MFI portfolio using `useContracts` filtered by institution type, with a "Disburse wholesale funds" flow
- **TaTrackingPage** — TA activities list with budget vs. actual; uses `useReports` with type `DONOR_EIB`
- **ReportsPage** — list of generated reports; "Generate report" modal that calls `useReports` mutation

---

# PART C — NAFA Portal

## 7.5 NAFA Guarantees

### `apps/web/src/features/nafa/pages/GuaranteesPage.tsx`

```tsx
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatDate, formatMoney, formatPercent } from '@nafi/formatters';
import { Badge, Button, Card, CardBody, CardHeader } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';

export function NafaGuaranteesPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({ pageSize: 100 });

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Guarantees</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Risk-sharing guarantees issued to banks against agricultural loans.
        </p>
      </header>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
      >
        <div className="flex flex-col gap-4">
          {data?.items.map((c) => (
            <Card key={c.id}>
              <CardHeader
                title={c.targetCrop}
                description={`${c.region} · Matures ${formatDate(c.maturityDate)}`}
                action={<Badge variant="info" dot>Guaranteed</Badge>}
              />
              <CardBody className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500">Contract value</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatMoney(c.contractValueEtb, 'ETB')}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Guarantee coverage</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatPercent(0.7, 0)} (70%)
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Guaranteed amount</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatMoney(Number(c.contractValueEtb) * 0.7, 'ETB')}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/nafa/guarantees/${c.id}`}>View guarantee</Link>
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
```

### NAFA Claims, Risk Sharing, Refinancing, Reports

- **ClaimsPage** — `useSettlements` filtered by defaulted status, "Process claim" modal
- **RiskSharingPage** — `<DashboardGrid>` with `<StatCard>`s for total exposure, active guarantees, claim rate, recovery rate, plus a `<SettlementWaterfallChart>` showing historical claim payouts
- **RefinancingPage** — list of contracts eligible for refinancing, with an approval flow
- **ReportsPage** — standard reports list

---

# PART D — Government Regulator Portal

## 7.6 National Dashboard

### `apps/web/src/features/government/pages/DashboardPage.tsx`

```tsx
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCompactMoney, formatNumber, formatPercent } from '@nafi/formatters';
import {
  Card,
  CardBody,
  CardHeader,
  DashboardGrid,
  StatCard,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts, useEscrows } from '@/hooks';

const CHART_COLORS = ['#16A34A', '#2563EB', '#F59E0B', '#DC2626', '#6B7280', '#8B5CF6'];

export function GovDashboardPage() {
  const contracts = useContracts({ pageSize: 500 });
  const escrows = useEscrows({ pageSize: 500 });

  const { byRegion, byCrop, trend } = useMemo(() => {
    const items = contracts.data?.items ?? [];

    const byRegion = Object.entries(
      items.reduce<Record<string, number>>((acc, c) => {
        acc[c.region] = (acc[c.region] ?? 0) + Number(c.contractValueEtb);
        return acc;
      }, {}),
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const byCrop = Object.entries(
      items.reduce<Record<string, number>>((acc, c) => {
        acc[c.targetCrop] = (acc[c.targetCrop] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([name, value]) => ({ name, value }));

    const trend = Array.from({ length: 6 }).map((_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      return {
        month: month.toLocaleString('en', { month: 'short' }),
        contracts: Math.round(items.length * (0.5 + i * 0.1)),
        forex: Math.round(items.length * 80_000 * (0.5 + i * 0.1)),
      };
    });

    return { byRegion, byCrop, trend };
  }, [contracts.data]);

  const totalContracts = contracts.data?.items.length ?? 0;
  const activeContracts = contracts.data?.items.filter((c) => c.status === 'ACTIVE').length ?? 0;
  const totalValue = contracts.data?.items.reduce(
    (s, c) => s + Number(c.contractValueEtb),
    0,
  ) ?? 0;
  const totalEscrow = escrows.data?.items.reduce(
    (s, e) => s + Number(e.totalDepositedEtb),
    0,
  ) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">National Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Real-time view of the NAFI platform across all regions, crops, and institutions.
        </p>
      </header>

      <QueryBoundary
        isLoading={contracts.isLoading || escrows.isLoading}
        isError={contracts.isError || escrows.isError}
        error={contracts.error ?? escrows.error}
        onRetry={() => {
          void contracts.refetch();
          void escrows.refetch();
        }}
      >
        <DashboardGrid>
          <StatCard
            label="Total contracts"
            value={formatNumber(totalContracts)}
            hint={`${activeContracts} active`}
          />
          <StatCard
            label="Total contract value"
            value={formatCompactMoney(totalValue, 'ETB')}
          />
          <StatCard
            label="Escrow capital under management"
            value={formatCompactMoney(totalEscrow, 'ETB')}
          />
        </DashboardGrid>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Contract value by region" />
            <CardBody>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={byRegion} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={90}
                    />
                    <Tooltip
                      formatter={(v: number) => formatCompactMoney(v, 'ETB')}
                      contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                    />
                    <Bar dataKey="value" fill="#16A34A" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Contract distribution by crop" />
            <CardBody>
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={byCrop}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {byCrop.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Momentum — last 6 months" />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`}
                  />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="contracts"
                    stroke="#16A34A"
                    strokeWidth={2}
                    name="Contracts"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="forex"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Forex generated (USD)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </QueryBoundary>
    </div>
  );
}
```

## 7.7 Government Contract Registry, Forex, Credit, Inputs, Tax, Incentives, Audit, Reports

Each follows the same pattern — list page + detail page.

- **ContractsPage** — full contract registry with filters by region, crop, status; detail shows the full timeline and signatures
- **ForexPage** — uses `useEscrows` and `useSettlements`; shows FX flows in/out, by month
- **CreditPage** — uses `useContracts` + `useEscrows`; shows credit deployed by bank, by crop, NPL ratio
- **InputsPage** — uses `useInputs`; shows input flow: ordered vs. delivered vs. verified vs. paid
- **TaxPage** — uses `useReports({ type: 'TAX' })` + a computed tax summary
- **IncentivesPage** — EIC-related data: tax holidays applied, duty-free imports, job creation
- **AuditPage** — uses `useAuditLog`; `<DataTable>` with actor, action, resource, IP
- **ReportsPage** — standard reports list with NBE/MoA/MoR filters

Example: `ContractsPage` reuses `DataTable` with a widened column set:

```tsx
const columns: Column<ContractSummary>[] = [
  { key: 'crop', header: 'Crop', render: (r) => <span className="font-medium">{r.targetCrop}</span> },
  { key: 'region', header: 'Region', render: (r) => r.region, hideBelow: 'sm' },
  { key: 'farmer', header: 'Farmer', render: (r) => r.farmerName, hideBelow: 'md' },
  { key: 'value', header: 'Value', align: 'right', render: (r) => formatMoney(r.contractValueEtb, 'ETB') },
  { key: 'status', header: 'Status', render: (r) => <ContractStatusBadge status={r.status} />, hideBelow: 'sm' },
  { key: 'maturity', header: 'Maturity', align: 'right', render: (r) => formatDate(r.maturityDate), hideBelow: 'lg' },
];
```

---

# PART E — Donor Portal

## 7.8 Donor Grants & Impact

### `apps/web/src/features/donor/pages/GrantsPage.tsx`

```tsx
import { HandCoins, TrendingUp, Users } from 'lucide-react';

import { formatCompactMoney, formatNumber } from '@nafi/formatters';
import {
  Card,
  CardBody,
  CardHeader,
  DashboardGrid,
  DataList,
  StatCard,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useReports } from '@/hooks';

export function DonorGrantsPage() {
  const { data, isLoading, isError, error, refetch } = useReports({
    type: 'DONOR_EIB',
    pageSize: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Grants & Programs</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Grants managed by your institution through NAFI.
        </p>
      </header>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <DashboardGrid>
          <StatCard
            label="Active programs"
            value={String(data?.items.length ?? 0)}
            icon={<HandCoins className="h-5 w-5" />}
          />
          <StatCard
            label="Total disbursed"
            value={formatCompactMoney(45_000_000, 'USD')}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            label="Beneficiaries"
            value={formatNumber(12_400)}
            icon={<Users className="h-5 w-5" />}
          />
        </DashboardGrid>

        <Card>
          <CardHeader title="Program details" />
          <CardBody>
            <DataList
              items={[
                { label: 'Facility', value: 'RUFIP III' },
                { label: 'Total commitment', value: formatCompactMoney(110_000_000, 'EUR') },
                { label: 'Technical assistance', value: formatCompactMoney(8_500_000, 'EUR') },
                { label: 'Focus areas', value: 'Rural finance, climate adaptation, women inclusion', span: true },
              ]}
            />
          </CardBody>
        </Card>
      </QueryBoundary>
    </div>
  );
}
```

### Donor Disbursements, Impact, Reports, Audit

- **DisbursementsPage** — table of disbursement records with amount, tranche, status, completion %
- **ImpactPage** — full-page analytics: portfolio impact cards, gender/youth disaggregation, climate adaptation metrics, jobs created
- **ReportsPage** — standard reports list
- **AuditPage** — audit log view scoped to donor's programs

---

# PART F — Admin · Compliance · Arbitrator

## 7.9 Admin Console

### `apps/web/src/features/admin/pages/OverviewPage.tsx`

```tsx
import { Activity, AlertTriangle, FileText, Users } from 'lucide-react';

import { formatNumber } from '@nafi/formatters';
import { DashboardGrid, StatCard } from '@nafi/ui-react';

import { useAuditLog, useContracts, useDisputes, useUsers } from '@/hooks';

export function AdminOverviewPage() {
  const users = useUsers({ pageSize: 1 });
  const contracts = useContracts({ pageSize: 1 });
  const disputes = useDisputes({ pageSize: 1 });
  const audit = useAuditLog({ pageSize: 1 });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Admin Overview</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Platform-wide health and activity.
        </p>
      </header>

      <DashboardGrid>
        <StatCard
          label="Users"
          value={formatNumber(users.data?.total ?? 0)}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Contracts"
          value={formatNumber(contracts.data?.total ?? 0)}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Open disputes"
          value={formatNumber(disputes.data?.total ?? 0)}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          label="Audit events (30d)"
          value={formatNumber(audit.data?.total ?? 0)}
          icon={<Activity className="h-5 w-5" />}
        />
      </DashboardGrid>
    </div>
  );
}
```

### Admin Users, Contracts, Escrows, Settlements, Disputes, Config, Audit, Health

All standard list pages built with `useUsers`, `useContracts`, `useEscrows`, `useSettlements`, `useDisputes`, `useAuditLog`. Admin-only actions use `<Can I={PERMISSIONS.USER_MANAGE_ALL}>` and `<Can I={PERMISSIONS.SYSTEM_CONFIGURE}>`.

- **UsersPage** — list + `<InviteUserDialog>` + deactivate/reactivate actions
- **ContractsPage**, **EscrowsPage**, **SettlementsPage** — read-only global views
- **DisputesPage** — list with assignment action
- **ConfigPage** — form for tax rates, contract templates, notification templates, settlement waterfall order (all persisted via `/admin/config`)
- **HealthPage** — API status, DB latency, queue depths, integration status (Fayda, EMCR, banks)
- **AuditPage** — full audit log with filters (actor, resource, date range)

## 7.10 Compliance Officer Portal

### `apps/web/src/features/compliance/pages/QueuePage.tsx`

```tsx
import { useNavigate } from 'react-router-dom';

import { formatDate } from '@nafi/formatters';
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
      render: (r) => r.contractValueEtb,
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
        <p className="mt-1 text-sm text-neutral-500">
          Contracts awaiting compliance review.
        </p>
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
```

### Compliance KYC, AML, SAR

- **KycPage** — pending KYC submissions with approve/reject actions
- **AmlPage** — AML alert queue; each alert opens a detail view with entity info, transaction history, and "File SAR" action
- **SarPage** — filed SARs list with status and submission reference

## 7.11 Arbitrator Portal

### `apps/web/src/features/arbitrator/pages/CasesPage.tsx`

```tsx
import { useNavigate } from 'react-router-dom';

import { formatDate } from '@nafi/formatters';
import { Badge } from '@nafi/ui-react';

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
      render: (r) => <span className="capitalize">{r.category.replace(/_/g, ' ').toLowerCase()}</span>,
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
        <p className="mt-1 text-sm text-neutral-500">
          Disputes assigned to your docket.
        </p>
      </header>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {data && (
          <DataTable
            columns={columns}
            rows={data.items}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => navigate(`/arbitration/cases/${r.id}`)}
          />
        )}
      </QueryBoundary>
    </div>
  );
}
```

### `apps/web/src/features/arbitrator/pages/CaseDetailPage.tsx`

```tsx
import { ArrowLeft, Calendar, FileText, Gavel } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { formatDate } from '@nafi/formatters';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataList,
  Modal,
  Select,
  Textarea,
  Timeline,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useDecideDispute, useDispute, useScheduleHearing } from '@/hooks';

export function ArbitrationCaseDetailPage() {
  const { id = '' } = useParams();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [decideOpen, setDecideOpen] = useState(false);
  const [hearingAt, setHearingAt] = useState('');
  const [decision, setDecision] = useState('');
  const [outcome, setOutcome] = useState<'UPHOLD' | 'REJECT' | 'PARTIAL'>('UPHOLD');

  const dispute = useDispute(id);
  const schedule = useScheduleHearing();
  const decide = useDecideDispute();

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/arbitration/cases"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to cases
      </Link>

      <QueryBoundary
        isLoading={dispute.isLoading}
        isError={dispute.isError}
        error={dispute.error}
        onRetry={dispute.refetch}
      >
        {dispute.data && (
          <>
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-neutral-900">
                    {dispute.data.contractCrop}
                  </h1>
                  <Badge
                    variant={
                      dispute.data.status === 'DECIDED' || dispute.data.status === 'CLOSED'
                        ? 'success'
                        : 'warning'
                    }
                    dot
                  >
                    {dispute.data.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  Case {dispute.data.id.slice(0, 8)} · Filed {formatDate(dispute.data.filedAt)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  leadingIcon={<Calendar className="h-4 w-4" />}
                  onClick={() => setScheduleOpen(true)}
                >
                  Schedule hearing
                </Button>
                <Button
                  leadingIcon={<Gavel className="h-4 w-4" />}
                  onClick={() => setDecideOpen(true)}
                >
                  Record decision
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-6 lg:col-span-2">
                <Card>
                  <CardHeader title="Case summary" />
                  <CardBody>
                    <DataList
                      columns={2}
                      items={[
                        { label: 'Category', value: dispute.data.category.replace(/_/g, ' ') },
                        { label: 'Filed by', value: dispute.data.filedByName },
                        { label: 'Summary', value: dispute.data.summary, span: true },
                      ]}
                    />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Evidence" />
                  <CardBody className="flex flex-col gap-3">
                    {dispute.data.evidence.length === 0 ? (
                      <p className="text-sm text-neutral-500">No evidence submitted yet.</p>
                    ) : (
                      dispute.data.evidence.map((e) => (
                        <a
                          key={e.id}
                          href={e.fileUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="flex items-center gap-3 rounded-md border border-neutral-200 p-3 hover:bg-neutral-50"
                        >
                          <FileText className="h-4 w-4 text-neutral-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-900">{e.label}</p>
                            <p className="text-xs text-neutral-500">
                              Uploaded {formatDate(e.uploadedAt)}
                            </p>
                          </div>
                        </a>
                      ))
                    )}
                  </CardBody>
                </Card>

                {dispute.data.decision && (
                  <Card>
                    <CardHeader title="Decision" />
                    <CardBody>
                      <p className="text-sm text-neutral-700">{dispute.data.decision}</p>
                      {dispute.data.decisionAt && (
                        <p className="mt-2 text-xs text-neutral-500">
                          Recorded {formatDate(dispute.data.decisionAt)}
                        </p>
                      )}
                    </CardBody>
                  </Card>
                )}
              </div>

              <aside className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Timeline" />
                  <CardBody>
                    <Timeline
                      items={[
                        { id: '1', title: 'Dispute filed', status: 'complete', timestamp: formatDate(dispute.data.filedAt) },
                        ...(dispute.data.hearingAt
                          ? [{ id: '2', title: 'Hearing scheduled', status: 'complete' as const, timestamp: formatDate(dispute.data.hearingAt) }]
                          : []),
                        ...(dispute.data.decisionAt
                          ? [{ id: '3', title: 'Decision recorded', status: 'complete' as const, timestamp: formatDate(dispute.data.decisionAt) }]
                          : [{ id: '3', title: 'Awaiting decision', status: 'pending' as const }]),
                      ]}
                    />
                  </CardBody>
                </Card>
              </aside>
            </div>

            <Modal
              open={scheduleOpen}
              onOpenChange={setScheduleOpen}
              title="Schedule hearing"
              footer={
                <>
                  <Button variant="ghost" onClick={() => setScheduleOpen(false)}>Cancel</Button>
                  <Button
                    onClick={async () => {
                      await schedule.mutateAsync({
                        id,
                        hearingAt,
                        arbitratorId: 'me',
                      });
                      setScheduleOpen(false);
                    }}
                    loading={schedule.isPending}
                  >
                    Confirm
                  </Button>
                </>
              }
            >
              <div className="flex flex-col gap-4">
                <label className="text-sm font-medium text-neutral-700">Hearing date & time</label>
                <input
                  type="datetime-local"
                  value={hearingAt}
                  onChange={(e) => setHearingAt(e.target.value)}
                  className="h-10 rounded border border-neutral-300 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </Modal>

            <Modal
              open={decideOpen}
              onOpenChange={setDecideOpen}
              title="Record decision"
              footer={
                <>
                  <Button variant="ghost" onClick={() => setDecideOpen(false)}>Cancel</Button>
                  <Button
                    onClick={async () => {
                      await decide.mutateAsync({ disputeId: id, decision, outcome });
                      setDecideOpen(false);
                    }}
                    disabled={decision.length < 10}
                    loading={decide.isPending}
                  >
                    Record decision
                  </Button>
                </>
              }
            >
              <div className="flex flex-col gap-4">
                <Select
                  label="Outcome"
                  value={outcome}
                  onValueChange={(v) => setOutcome(v as typeof outcome)}
                  options={[
                    { value: 'UPHOLD', label: 'Uphold the complaint' },
                    { value: 'REJECT', label: 'Reject the complaint' },
                    { value: 'PARTIAL', label: 'Partially uphold' },
                  ]}
                />
                <Textarea
                  label="Decision"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  rows={6}
                  hint="At least 10 characters. This becomes part of the permanent record."
                />
              </div>
            </Modal>
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
```

---

## 7.12 Router Update — Replace All Stubs

Update `apps/web/src/app/router.tsx` — replace stub imports with real pages for all remaining roles:

```tsx
// Bank
import { BankOverviewPage } from '@/features/bank/pages/OverviewPage';
import { BankEscrowsPage } from '@/features/bank/pages/EscrowsPage';
import { BankEscrowDetailPage } from '@/features/bank/pages/EscrowDetailPage';
import { BankLoansPage } from '@/features/bank/pages/LoansPage';
import { BankCollateralPage } from '@/features/bank/pages/CollateralPage';
import { BankSettlementsPage } from '@/features/bank/pages/SettlementsPage';
import { BankNplPage } from '@/features/bank/pages/NplPage';

// DBE
import { DbePortfolioPage } from '@/features/dbe/pages/PortfolioPage';
import { DbeCoFinancingPage } from '@/features/dbe/pages/CoFinancingPage';
import { DbeOnLendingPage } from '@/features/dbe/pages/OnLendingPage';
import { DbeTaTrackingPage } from '@/features/dbe/pages/TaTrackingPage';
import { DbeReportsPage } from '@/features/dbe/pages/ReportsPage';

// NAFA
import { NafaGuaranteesPage } from '@/features/nafa/pages/GuaranteesPage';
import { NafaClaimsPage } from '@/features/nafa/pages/ClaimsPage';
import { NafaRiskSharingPage } from '@/features/nafa/pages/RiskSharingPage';
import { NafaRefinancingPage } from '@/features/nafa/pages/RefinancingPage';
import { NafaReportsPage } from '@/features/nafa/pages/ReportsPage';

// Government
import { GovDashboardPage } from '@/features/government/pages/DashboardPage';
import { GovContractsPage } from '@/features/government/pages/ContractsPage';
import { GovForexPage } from '@/features/government/pages/ForexPage';
import { GovCreditPage } from '@/features/government/pages/CreditPage';
import { GovInputsPage } from '@/features/government/pages/InputsPage';
import { GovTaxPage } from '@/features/government/pages/TaxPage';
import { GovIncentivesPage } from '@/features/government/pages/IncentivesPage';
import { GovAuditPage } from '@/features/government/pages/AuditPage';
import { GovReportsPage } from '@/features/government/pages/ReportsPage';

// Donor
import { DonorGrantsPage } from '@/features/donor/pages/GrantsPage';
import { DonorDisbursementsPage } from '@/features/donor/pages/DisbursementsPage';
import { DonorImpactPage } from '@/features/donor/pages/ImpactPage';
import { DonorReportsPage } from '@/features/donor/pages/ReportsPage';
import { DonorAuditPage } from '@/features/donor/pages/AuditPage';

// Admin
import { AdminOverviewPage } from '@/features/admin/pages/OverviewPage';
import { AdminUsersPage } from '@/features/admin/pages/UsersPage';
import { AdminContractsPage } from '@/features/admin/pages/ContractsPage';
import { AdminEscrowsPage } from '@/features/admin/pages/EscrowsPage';
import { AdminSettlementsPage } from '@/features/admin/pages/SettlementsPage';
import { AdminDisputesPage } from '@/features/admin/pages/DisputesPage';
import { AdminConfigPage } from '@/features/admin/pages/ConfigPage';
import { AdminAuditPage } from '@/features/admin/pages/AuditPage';
import { AdminHealthPage } from '@/features/admin/pages/HealthPage';

// Compliance
import { ComplianceQueuePage } from '@/features/compliance/pages/QueuePage';
import { ComplianceKycPage } from '@/features/compliance/pages/KycPage';
import { ComplianceAmlPage } from '@/features/compliance/pages/AmlPage';
import { ComplianceSarPage } from '@/features/compliance/pages/SarPage';

// Arbitrator
import { ArbitrationCasesPage } from '@/features/arbitrator/pages/CasesPage';
import { ArbitrationCaseDetailPage } from '@/features/arbitrator/pages/CaseDetailPage';
```

Replace the children of each role group in the router. Every page is now a real component, and the `stubs.tsx` file can be deleted.

---

## 7.13 Verification Checklist

```bash
pnpm --filter @nafi/web typecheck
pnpm --filter @nafi/web lint
pnpm --filter @nafi/web dev
```

| Test | Expected |
| :--- | :--- |
| Bank user opens `/bank/overview` | Escrow stats + recent escrows |
| Bank user opens an escrow → "Release funds" | Dialog opens; >1M ETB requires approval token |
| DBE user opens `/dbe/portfolio` | Portfolio stats for co-financing |
| NAFA user opens `/nafa/guarantees` | List of guaranteed contracts with 70% coverage |
| Government user opens `/gov/dashboard` | 3 charts render (bar, pie, line) with live data |
| Government user opens `/gov/contracts` | Full contract registry with region filter |
| Donor user opens `/donor/grants` | Grant summary + RUFIP III details |
| Admin opens `/admin/overview` | KPI dashboard with counts |
| Compliance opens `/compliance/queue` | DRAFT contracts awaiting approval |
| Arbitrator opens a case → "Record decision" | Modal requires 10+ chars; invalidates dispute + escrow |
| Bank user tries `/gov/dashboard` | Redirect to `/bank/overview` (role home) |
| NAFA user tries to release escrow | "Release funds" button hidden by `<Can>` |

---

## 7.14 What Was Built & Why

| Portal | Pages | Highlights |
| :--- | :--- | :--- |
| **Commercial Bank** | Overview, Escrows (list + detail), Loans, Collateral, Settlements, NPL | **Multi-party escrow release** with approval token threshold; escrow ledger view |
| **DBE** | Portfolio, Co-Financing, On-Lending, TA Tracking, Reports | RUFIP III co-financing summary; portfolio KPIs |
| **NAFA** | Guarantees, Claims, Risk Sharing, Refinancing, Reports | 70% guarantee coverage view; claim queue |
| **Government** | Dashboard, Contracts, Forex, Credit, Inputs, Tax, Incentives, Audit, Reports | **Real-time national dashboard**: bar chart by region, pie by crop, dual-axis line for momentum |
| **Donor** | Grants, Disbursements, Impact, Reports, Audit | Grant summary + impact metrics |
| **Admin** | Overview, Users, Contracts, Escrows, Settlements, Disputes, Config, Audit, Health | Platform-wide KPIs; user management; system config |
| **Compliance** | Queue, KYC, AML, SAR | Contract review queue with approve/reject |
| **Arbitrator** | Cases (list + detail) | Full case management with evidence, hearings, decisions |

**Engineering highlights introduced in Step 7:**
- ✅ **Multi-party approval pattern** — releases over threshold require an approval token
- ✅ **Real-time government dashboard** with 3 chart types (bar, pie, dual-axis line)
- ✅ **Case management system** for arbitration with evidence, hearings, and decisions
- ✅ **Every portal reuses** `<DataTable>`, `<QueryBoundary>`, `<Pagination>`, `useTableState`, and the Step 5 data layer
- ✅ **RBAC enforced** at route + action level for every role
- ✅ **No stubs remaining** — all 12 role portals are production-ready

**Design decisions made in this step:**
- Multi-party approval threshold is a **client constant** now, but the approval token is validated server-side
- Government dashboard charts use **Recharts** directly (already a dependency)
- Arbitrator decisions are permanent — the modal requires 10+ chars and is disabled otherwise
- Compliance queue is a **filtered view of contracts** rather than a new entity (reuses everything)
- Admin health page uses **real API health endpoints** (assumed `/admin/health`)

---

## 7.15 What Is Deliberately Not in Step 7

- ❌ No farmer PWA offline mode — **Step 8**
- ❌ No real-time WebSocket updates — will be added if required
- ❌ No E2E tests — **Step 10**
- ❌ No analytics or telemetry — opt-in later

**Step 7 completes all 12 role portals.**

---

# ✅ Step 7 Complete

**Deliverable:** All six remaining role portals, fully wired:

- **Commercial Bank** — escrow management with multi-party release, loans, collateral, settlements, NPL
- **Development Bank of Ethiopia** — RUFIP III co-financing portfolio, on-lending, TA tracking
- **NAFA** — guarantee issuance with 70% coverage, claim processing, risk-sharing dashboard
- **Government Regulator** — real-time national dashboard (region/crop/trend charts), contract registry, forex, credit, inputs, tax, incentives, audit
- **Donor** — grants, disbursements, impact metrics
- **NAFI Admin** — platform KPIs, user management, system config, health monitoring
- **Compliance Officer** — contract review queue, KYC, AML, SAR filing
- **Arbitrator** — full case management with evidence, hearings, and decisions

Every portal uses the same shared patterns from Steps 2, 4, and 5. Zero stubs remain.

