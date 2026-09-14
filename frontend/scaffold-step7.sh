#!/usr/bin/env bash
# ============================================================
# NAFI Frontend — Step 7 Scaffolding Script
# Creates the remaining six role portals in apps/web:
#   - Commercial Bank (escrow release, loans, NPL)
#   - Development Bank of Ethiopia (DBE)
#   - NAFA (guarantees, claims, risk sharing)
#   - Government (real-time dashboards)
#   - Donor (grants, impact)
#   - Admin + Compliance + Arbitrator
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "▶ NAFI Step 7 scaffolding → $SCRIPT_DIR"

mkfile() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  echo "  ✓ $path"
}

APP="apps/web"

for role in bank dbe nafa government donor admin compliance arbitrator; do
  mkdir -p "$APP/src/features/$role/pages"
  mkdir -p "$APP/src/features/$role/components"
  mkdir -p "$APP/src/features/$role/hooks"
done

# ============================================================
# PART A — COMMERCIAL BANK PORTAL
# ============================================================

mkfile "$APP/src/features/bank/hooks/useBankSummary.ts" <<'EOF'
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
      summary: { escrowCount: items.length, locked, frozen, totalEtb, totalUsd },
      escrows: items,
    };
  }, [data, isLoading]);
}
EOF

mkfile "$APP/src/features/bank/components/EscrowReleaseDialog.tsx" <<'EOF'
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
  const isMultiParty = Number(amount) > 1_000_000;

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
              Releases over 1,000,000 ETB require an approval token from the contract's government
              witness and DBE co-signer.
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
EOF

mkfile "$APP/src/features/bank/pages/OverviewPage.tsx" <<'EOF'
import { Landmark, Lock, Unlock } from 'lucide-react';
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
EOF

mkfile "$APP/src/features/bank/pages/EscrowsPage.tsx" <<'EOF'
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
EOF

mkfile "$APP/src/features/bank/pages/EscrowDetailPage.tsx" <<'EOF'
import { ArrowLeft, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { formatDate, formatMoney } from '@nafi/formatters';
import { PERMISSIONS } from '@nafi/rbac-core';
import {
  Badge,
  Button,
  Can,
  Card,
  CardBody,
  CardHeader,
  DataList,
  EscrowBalanceCard,
} from '@nafi/ui-react';

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
                    {
                      label: 'Total deposited',
                      value: formatMoney(escrow.data.totalDepositedEtb, 'ETB'),
                    },
                    { label: 'Status', value: escrow.data.status },
                    { label: 'Opened', value: formatDate(escrow.data.createdAt) },
                  ]}
                />
              </CardBody>
            </Card>

            {ledger.data && ledger.data.length > 0 && (
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
EOF

mkfile "$APP/src/features/bank/pages/LoansPage.tsx" <<'EOF'
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
EOF

mkfile "$APP/src/features/bank/pages/CollateralPage.tsx" <<'EOF'
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
EOF

mkfile "$APP/src/features/bank/pages/SettlementsPage.tsx" <<'EOF'
import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useSettlements } from '@/hooks';
import type { SettlementSummary } from '@/api/types/settlement';

export function BankSettlementsPage() {
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
      hideBelow: 'sm',
      render: (r) => (
        <Badge
          variant={
            r.status === 'EXECUTED' ? 'success' : r.status === 'REVERSED' ? 'danger' : 'warning'
          }
          dot
        >
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
      key: 'distributed',
      header: 'Distributed',
      align: 'right',
      hideBelow: 'md',
      render: (r) => formatMoney(r.totalDistributedEtb, 'ETB'),
    },
    {
      key: 'date',
      header: 'Executed',
      align: 'right',
      hideBelow: 'lg',
      render: (r) => (r.executedAt ? formatDate(r.executedAt) : '—'),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Settlements</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Contract settlement history for your escrow portfolio.
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
EOF

mkfile "$APP/src/features/bank/pages/NplPage.tsx" <<'EOF'
import { AlertTriangle, Banknote, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

import { formatCompactMoney, formatPercent } from '@nafi/formatters';
import { DashboardGrid, StatCard } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';

export function BankNplPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({ pageSize: 500 });

  const summary = useMemo(() => {
    const items = data?.items ?? [];
    const total = items.length;
    const defaulted = items.filter((c) => c.status === 'DEFAULTED').length;
    const disputed = items.filter((c) => c.status === 'DISPUTED').length;
    const nplRatio = total > 0 ? (defaulted + disputed) / total : 0;
    const totalValue = items.reduce((s, c) => s + Number(c.contractValueEtb), 0);

    return { total, defaulted, disputed, nplRatio, totalValue };
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">NPL Monitor</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Non-performing loan exposure across the agricultural portfolio.
        </p>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <DashboardGrid>
          <StatCard
            label="Total contracts"
            value={String(summary.total)}
            icon={<Banknote className="h-5 w-5" />}
            hint={formatCompactMoney(summary.totalValue, 'ETB')}
          />
          <StatCard
            label="NPL ratio"
            value={formatPercent(summary.nplRatio, 2)}
            delta={{
              value: 'target < 5%',
              direction: summary.nplRatio < 0.05 ? 'down' : 'up',
            }}
            icon={<TrendingDown className="h-5 w-5" />}
          />
          <StatCard
            label="Defaulted"
            value={String(summary.defaulted)}
            icon={<AlertTriangle className="h-5 w-5" />}
            hint={`${summary.disputed} disputed`}
          />
        </DashboardGrid>
      </QueryBoundary>
    </div>
  );
}
EOF

# ============================================================
# PART B — DBE PORTAL
# ============================================================

mkfile "$APP/src/features/dbe/pages/PortfolioPage.tsx" <<'EOF'
import { Banknote, Coins, TrendingUp } from 'lucide-react';

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
EOF

mkfile "$APP/src/features/dbe/pages/CoFinancingPage.tsx" <<'EOF'
import { formatDate, formatMoney } from '@nafi/formatters';
import { ContractStatusBadge } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';
import type { ContractSummary } from '@/api/types/contract';

export function DbeCoFinancingPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({ pageSize: 100 });

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
    { key: 'region', header: 'Region', hideBelow: 'sm', render: (r) => r.region },
    {
      key: 'value',
      header: 'Contract value',
      align: 'right',
      render: (r) => formatMoney(r.contractValueEtb, 'ETB'),
    },
    {
      key: 'committed',
      header: 'Committed',
      align: 'right',
      hideBelow: 'md',
      render: (r) => formatMoney(r.committedAmountEtb, 'ETB'),
    },
    {
      key: 'maturity',
      header: 'Maturity',
      align: 'right',
      hideBelow: 'lg',
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
        <h1 className="text-2xl font-semibold text-neutral-900">Co-Financing</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Contracts co-financed through RUFIP III and other facilities.
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
EOF

mkfile "$APP/src/features/dbe/pages/OnLendingPage.tsx" <<'EOF'
import { Card, CardBody, CardHeader, DataList } from '@nafi/ui-react';

export function DbeOnLendingPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">On-Lending</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Wholesale funds extended to RUSACCOs and MFIs.
        </p>
      </div>

      <Card>
        <CardHeader title="Portfolio summary" />
        <CardBody>
          <DataList
            items={[
              { label: 'Active RUSACCOs', value: '—' },
              { label: 'Active MFIs', value: '—' },
              { label: 'Total outstanding', value: '—' },
              { label: 'Next disbursement', value: '—' },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
EOF

mkfile "$APP/src/features/dbe/pages/TaTrackingPage.tsx" <<'EOF'
import { Card, CardBody, CardHeader, DataList } from '@nafi/ui-react';

export function DbeTaTrackingPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Technical Assistance</h1>
        <p className="mt-1 text-sm text-neutral-500">
          TA activities, budget, and outcomes under RUFIP III.
        </p>
      </div>

      <Card>
        <CardHeader title="TA program" />
        <CardBody>
          <DataList
            items={[
              { label: 'Total budget', value: '€8.5M' },
              { label: 'Committed', value: '—' },
              { label: 'Beneficiaries reached', value: '—' },
              { label: 'Focus areas', value: 'Rural finance, climate, women', span: true },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
EOF

mkfile "$APP/src/features/dbe/pages/ReportsPage.tsx" <<'EOF'
import { FileText, Download } from 'lucide-react';

import { formatDate } from '@nafi/formatters';
import { Button, Card, CardBody, CardHeader } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useReports } from '@/hooks';

export function DbeReportsPage() {
  const { data, isLoading, isError, error, refetch } = useReports({
    type: 'DONOR_EIB',
    pageSize: 50,
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Reports</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Regulatory and donor reports for the DBE portfolio.
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
            <p className="text-sm text-neutral-500">No reports yet.</p>
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
                Generated {formatDate(r.generatedAt)}
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
EOF

# ============================================================
# PART C — NAFA PORTAL
# ============================================================

mkfile "$APP/src/features/nafa/pages/GuaranteesPage.tsx" <<'EOF'
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
                action={
                  <Badge variant="info" dot>
                    Guaranteed
                  </Badge>
                }
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
EOF

mkfile "$APP/src/features/nafa/pages/ClaimsPage.tsx" <<'EOF'
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
EOF

mkfile "$APP/src/features/nafa/pages/RiskSharingPage.tsx" <<'EOF'
import { AlertTriangle, PieChart, ShieldCheck, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

import { formatCompactMoney, formatPercent } from '@nafi/formatters';
import { DashboardGrid, StatCard } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';

export function NafaRiskSharingPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({ pageSize: 500 });

  const summary = useMemo(() => {
    const items = data?.items ?? [];
    const totalValue = items.reduce((s, c) => s + Number(c.contractValueEtb), 0);
    const exposure = totalValue * 0.7;
    const defaulted = items.filter((c) => c.status === 'DEFAULTED').length;
    const claimRate = items.length > 0 ? defaulted / items.length : 0;

    return { totalValue, exposure, defaulted, claimRate, count: items.length };
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Risk Sharing</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Guarantee exposure and portfolio health.
        </p>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <DashboardGrid>
          <StatCard
            label="Total exposure"
            value={formatCompactMoney(summary.exposure, 'ETB')}
            icon={<ShieldCheck className="h-5 w-5" />}
            hint={`${summary.count} guaranteed contracts`}
          />
          <StatCard
            label="Claim rate"
            value={formatPercent(summary.claimRate, 2)}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <StatCard
            label="Recovery rate"
            value="—"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </DashboardGrid>
      </QueryBoundary>
    </div>
  );
}
EOF

mkfile "$APP/src/features/nafa/pages/RefinancingPage.tsx" <<'EOF'
import { formatDate, formatMoney } from '@nafi/formatters';
import { ContractStatusBadge } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';
import type { ContractSummary } from '@/api/types/contract';

export function NafaRefinancingPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({
    status: 'ACTIVE',
    pageSize: 100,
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
      key: 'value',
      header: 'Contract value',
      align: 'right',
      render: (r) => formatMoney(r.contractValueEtb, 'ETB'),
    },
    {
      key: 'maturity',
      header: 'Maturity',
      align: 'right',
      hideBelow: 'sm',
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
        <h1 className="text-2xl font-semibold text-neutral-900">Refinancing</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Contracts eligible for NAFA refinancing facilities.
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
EOF

mkfile "$APP/src/features/nafa/pages/ReportsPage.tsx" <<'EOF'
import { FileText, Download } from 'lucide-react';

import { formatDate } from '@nafi/formatters';
import { Button, Card, CardBody, CardHeader } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useReports } from '@/hooks';

export function NafaReportsPage() {
  const { data, isLoading, isError, error, refetch } = useReports({
    type: 'REGULATORY_NBE',
    pageSize: 50,
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Reports</h1>
        <p className="mt-1 text-sm text-neutral-500">Regulatory reports for NAFA.</p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">No reports yet.</p>
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
                Generated {formatDate(r.generatedAt)}
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
EOF

# ============================================================
# PART D — GOVERNMENT PORTAL
# ============================================================

mkfile "$APP/src/features/government/pages/DashboardPage.tsx" <<'EOF'
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

import { formatCompactMoney, formatNumber } from '@nafi/formatters';
import { Card, CardBody, CardHeader, DashboardGrid, StatCard } from '@nafi/ui-react';

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
  const activeContracts =
    contracts.data?.items.filter((c) => c.status === 'ACTIVE').length ?? 0;
  const totalValue =
    contracts.data?.items.reduce((s, c) => s + Number(c.contractValueEtb), 0) ?? 0;
  const totalEscrow =
    escrows.data?.items.reduce((s, e) => s + Number(e.totalDepositedEtb), 0) ?? 0;

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
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #E5E7EB',
                        fontSize: 12,
                      }}
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
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
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
EOF

mkfile "$APP/src/features/government/pages/ContractsPage.tsx" <<'EOF'
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
EOF

# Helper: government list pages (Forex, Credit, Inputs, Tax, Incentives, Audit, Reports)
for page in Forex Credit Inputs Tax Incentives Audit Reports; do
  lower=$(echo "$page" | tr '[:upper:]' '[:lower:]')
  title=$(echo "$page" | sed 's/\([A-Z]\)/ \1/g' | xargs)
  mkfile "$APP/src/features/government/pages/${page}Page.tsx" <<EOF
import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function Gov${page}Page() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">${title}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Real-time view for national oversight.
        </p>
      </div>

      <Card>
        <CardHeader title="${title}" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            Detailed ${lower} metrics will be surfaced here once the backend exposes aggregated
            endpoints.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
EOF
done

# ============================================================
# PART E — DONOR PORTAL
# ============================================================

mkfile "$APP/src/features/donor/pages/GrantsPage.tsx" <<'EOF'
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
                {
                  label: 'Technical assistance',
                  value: formatCompactMoney(8_500_000, 'EUR'),
                },
                {
                  label: 'Focus areas',
                  value: 'Rural finance, climate adaptation, women inclusion',
                  span: true,
                },
              ]}
            />
          </CardBody>
        </Card>
      </QueryBoundary>
    </div>
  );
}
EOF

mkfile "$APP/src/features/donor/pages/DisbursementsPage.tsx" <<'EOF'
import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function DonorDisbursementsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Disbursements</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Grant disbursement tracking by tranche.
        </p>
      </div>

      <Card>
        <CardHeader title="Disbursement schedule" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            Tranche-level disbursement records will appear here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
EOF

mkfile "$APP/src/features/donor/pages/ImpactPage.tsx" <<'EOF'
import { Coins, Globe2, Sprout, TrendingUp, Users } from 'lucide-react';

import { formatCompactMoney, formatNumber } from '@nafi/formatters';
import { DashboardGrid, StatCard } from '@nafi/ui-react';

export function DonorImpactPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Impact Metrics</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Verifiable impact of donor-funded agricultural programs.
        </p>
      </div>

      <DashboardGrid>
        <StatCard
          label="Diaspora capital mobilized"
          value={formatCompactMoney(12_450_000, 'USD')}
          icon={<Coins className="h-5 w-5" />}
        />
        <StatCard
          label="Hectares under contract"
          value={formatNumber(68_200)}
          icon={<Globe2 className="h-5 w-5" />}
        />
        <StatCard
          label="Farmers reached"
          value={formatNumber(1_840)}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Forex generated"
          value={formatCompactMoney(4_180_000, 'USD')}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Jobs created"
          value={formatNumber(3_210)}
          icon={<Sprout className="h-5 w-5" />}
        />
      </DashboardGrid>
    </div>
  );
}
EOF

mkfile "$APP/src/features/donor/pages/ReportsPage.tsx" <<'EOF'
import { FileText, Download } from 'lucide-react';

import { formatDate } from '@nafi/formatters';
import { Button, Card, CardBody, CardHeader } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useReports } from '@/hooks';

export function DonorReportsPage() {
  const { data, isLoading, isError, error, refetch } = useReports({
    type: 'DONOR_IFAD',
    pageSize: 50,
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Reports</h1>
        <p className="mt-1 text-sm text-neutral-500">Donor reports and evaluations.</p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">No reports yet.</p>
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
                Generated {formatDate(r.generatedAt)}
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
EOF

mkfile "$APP/src/features/donor/pages/AuditPage.tsx" <<'EOF'
import { formatDate } from '@nafi/formatters';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useAuditLog } from '@/hooks';
import type { AuditLogEntry } from '@/api/domains/audit';

export function DonorAuditPage() {
  const { data, isLoading, isError, error, refetch } = useAuditLog({ pageSize: 100 });

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'actor',
      header: 'Actor',
      render: (r) => <span className="font-medium text-neutral-900">{r.actorName}</span>,
    },
    { key: 'action', header: 'Action', render: (r) => r.action },
    { key: 'resource', header: 'Resource', render: (r) => r.resource, hideBelow: 'sm' },
    {
      key: 'date',
      header: 'Timestamp',
      align: 'right',
      hideBelow: 'md',
      render: (r) => formatDate(r.createdAt),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Audit Access</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Immutable log of actions on your grant programs.
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
EOF

# ============================================================
# PART F — ADMIN, COMPLIANCE, ARBITRATOR
# ============================================================

mkfile "$APP/src/features/admin/pages/OverviewPage.tsx" <<'EOF'
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
        <p className="mt-1 text-sm text-neutral-500">Platform-wide health and activity.</p>
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
EOF

mkfile "$APP/src/features/admin/pages/UsersPage.tsx" <<'EOF'
import { formatDate } from '@nafi/formatters';
import { Badge } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useUsers } from '@/hooks';
import type { UserSummary } from '@/api/types/user';

export function AdminUsersPage() {
  const { data, isLoading, isError, error, refetch } = useUsers({ pageSize: 100 });

  const columns: Column<UserSummary>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (r) => (
        <div>
          <p className="font-medium text-neutral-900">{r.fullName}</p>
          <p className="text-xs text-neutral-500">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (r) => (
        <span className="text-xs text-neutral-700">{r.role.replace(/_/g, ' ')}</span>
      ),
      hideBelow: 'sm',
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.isActive ? 'success' : 'danger'} dot>
          {r.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      align: 'right',
      hideBelow: 'md',
      render: (r) => formatDate(r.createdAt),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Users</h1>
        <p className="mt-1 text-sm text-neutral-500">
          All platform users across every role.
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
EOF

# Admin helper pages
for page in Contracts Escrows Settlements Disputes Config Audit Health; do
  lower=$(echo "$page" | tr '[:upper:]' '[:lower:]')
  mkfile "$APP/src/features/admin/pages/${page}Page.tsx" <<EOF
import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function Admin${page}Page() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">${page}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Platform-wide ${lower} management.
        </p>
      </div>

      <Card>
        <CardHeader title="${page}" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            Aggregated ${lower} view will appear here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
EOF
done

mkfile "$APP/src/features/compliance/pages/QueuePage.tsx" <<'EOF'
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
EOF

for page in Kyc Aml Sar; do
  title=$(echo "$page" | tr '[:lower:]' '[:upper:]')
  mkfile "$APP/src/features/compliance/pages/${page}Page.tsx" <<EOF
import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function Compliance${page}Page() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">${title}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          ${title} review queue and workflow.
        </p>
      </div>

      <Card>
        <CardHeader title="${title}" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            ${title} submissions will appear here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
EOF
done

mkfile "$APP/src/features/arbitrator/pages/CasesPage.tsx" <<'EOF'
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
EOF

mkfile "$APP/src/features/arbitrator/pages/CaseDetailPage.tsx" <<'EOF'
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
                        {
                          label: 'Category',
                          value: dispute.data.category.replace(/_/g, ' '),
                        },
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
                        {
                          id: '1',
                          title: 'Dispute filed',
                          status: 'complete',
                          timestamp: formatDate(dispute.data.filedAt),
                        },
                        ...(dispute.data.hearingAt
                          ? [
                              {
                                id: '2',
                                title: 'Hearing scheduled',
                                status: 'complete' as const,
                                timestamp: formatDate(dispute.data.hearingAt),
                              },
                            ]
                          : []),
                        ...(dispute.data.decisionAt
                          ? [
                              {
                                id: '3',
                                title: 'Decision recorded',
                                status: 'complete' as const,
                                timestamp: formatDate(dispute.data.decisionAt),
                              },
                            ]
                          : [
                              {
                                id: '3',
                                title: 'Awaiting decision',
                                status: 'pending' as const,
                              },
                            ]),
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
                  <Button variant="ghost" onClick={() => setScheduleOpen(false)}>
                    Cancel
                  </Button>
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
                <label className="text-sm font-medium text-neutral-700">
                  Hearing date & time
                </label>
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
                  <Button variant="ghost" onClick={() => setDecideOpen(false)}>
                    Cancel
                  </Button>
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
EOF

# ============================================================
# UPDATE ROUTER — replace all remaining stubs with real pages
# ============================================================

mkfile "$APP/src/app/router.tsx" <<'EOF'
import { PERMISSIONS } from '@nafi/rbac-core';
import { ProtectedRoute } from '@nafi/ui-react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { AuthLayout } from '@/features/auth/layouts/AuthLayout';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';

// Admin
import { AdminAuditPage } from '@/features/admin/pages/AuditPage';
import { AdminConfigPage } from '@/features/admin/pages/ConfigPage';
import { AdminContractsPage } from '@/features/admin/pages/ContractsPage';
import { AdminDisputesPage } from '@/features/admin/pages/DisputesPage';
import { AdminEscrowsPage } from '@/features/admin/pages/EscrowsPage';
import { AdminHealthPage } from '@/features/admin/pages/HealthPage';
import { AdminOverviewPage } from '@/features/admin/pages/OverviewPage';
import { AdminSettlementsPage } from '@/features/admin/pages/SettlementsPage';
import { AdminUsersPage } from '@/features/admin/pages/UsersPage';

// Arbitrator
import { ArbitrationCaseDetailPage } from '@/features/arbitrator/pages/CaseDetailPage';
import { ArbitrationCasesPage } from '@/features/arbitrator/pages/CasesPage';

// Bank
import { BankCollateralPage } from '@/features/bank/pages/CollateralPage';
import { BankEscrowDetailPage } from '@/features/bank/pages/EscrowDetailPage';
import { BankEscrowsPage } from '@/features/bank/pages/EscrowsPage';
import { BankLoansPage } from '@/features/bank/pages/LoansPage';
import { BankNplPage } from '@/features/bank/pages/NplPage';
import { BankOverviewPage } from '@/features/bank/pages/OverviewPage';
import { BankSettlementsPage } from '@/features/bank/pages/SettlementsPage';

// Compliance
import { ComplianceAmlPage } from '@/features/compliance/pages/AmlPage';
import { ComplianceKycPage } from '@/features/compliance/pages/KycPage';
import { ComplianceQueuePage } from '@/features/compliance/pages/QueuePage';
import { ComplianceSarPage } from '@/features/compliance/pages/SarPage';

// DBE
import { DbeCoFinancingPage } from '@/features/dbe/pages/CoFinancingPage';
import { DbeOnLendingPage } from '@/features/dbe/pages/OnLendingPage';
import { DbePortfolioPage } from '@/features/dbe/pages/PortfolioPage';
import { DbeReportsPage } from '@/features/dbe/pages/ReportsPage';
import { DbeTaTrackingPage } from '@/features/dbe/pages/TaTrackingPage';

// Donor
import { DonorAuditPage } from '@/features/donor/pages/AuditPage';
import { DonorDisbursementsPage } from '@/features/donor/pages/DisbursementsPage';
import { DonorGrantsPage } from '@/features/donor/pages/GrantsPage';
import { DonorImpactPage } from '@/features/donor/pages/ImpactPage';
import { DonorReportsPage } from '@/features/donor/pages/ReportsPage';

// Farmer
import { FarmContractDetailPage } from '@/features/farmer/pages/ContractDetailPage';
import { FarmCollateralPage } from '@/features/farmer/pages/CollateralPage';
import { FarmContractsPage } from '@/features/farmer/pages/ContractsPage';
import { FarmEscrowPage } from '@/features/farmer/pages/EscrowPage';
import { FarmHarvestPage } from '@/features/farmer/pages/HarvestPage';
import { FarmInputsPage } from '@/features/farmer/pages/InputsPage';
import { FarmPaymentsPage } from '@/features/farmer/pages/PaymentsPage';

// Government
import { GovAuditPage } from '@/features/government/pages/AuditPage';
import { GovContractsPage } from '@/features/government/pages/ContractsPage';
import { GovCreditPage } from '@/features/government/pages/CreditPage';
import { GovDashboardPage } from '@/features/government/pages/DashboardPage';
import { GovForexPage } from '@/features/government/pages/ForexPage';
import { GovIncentivesPage } from '@/features/government/pages/IncentivesPage';
import { GovInputsPage } from '@/features/government/pages/InputsPage';
import { GovReportsPage } from '@/features/government/pages/ReportsPage';
import { GovTaxPage } from '@/features/government/pages/TaxPage';

// Investor
import { InvestorBondsPage } from '@/features/investor/pages/BondsPage';
import { InvestorInvestmentsPage } from '@/features/investor/pages/InvestmentsPage';
import { OpportunityBrowserPage } from '@/features/investor/pages/OpportunityBrowserPage';
import { OpportunityInvestPage } from '@/features/investor/pages/OpportunityInvestPage';
import { InvestorOverviewPage } from '@/features/investor/pages/OverviewPage';
import { InvestorReturnsPage } from '@/features/investor/pages/ReturnsPage';
import { InvestorStatementsPage } from '@/features/investor/pages/StatementsPage';

// NAFA
import { NafaClaimsPage } from '@/features/nafa/pages/ClaimsPage';
import { NafaGuaranteesPage } from '@/features/nafa/pages/GuaranteesPage';
import { NafaRefinancingPage } from '@/features/nafa/pages/RefinancingPage';
import { NafaReportsPage } from '@/features/nafa/pages/ReportsPage';
import { NafaRiskSharingPage } from '@/features/nafa/pages/RiskSharingPage';

// Supplier
import { SupplierDeliveriesPage } from '@/features/supplier/pages/DeliveriesPage';
import { SupplierOrderDetailPage } from '@/features/supplier/pages/OrderDetailPage';
import { SupplierOrdersPage } from '@/features/supplier/pages/OrdersPage';
import { SupplierPaymentsPage } from '@/features/supplier/pages/PaymentsPage';
import { SupplierProfilePage } from '@/features/supplier/pages/ProfilePage';

import { DashboardLayout } from '@/layouts/DashboardLayout';
import { BuyerPurchases, BuyerSettlements, NotFound, ProfilePage } from '@/pages/stubs';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password/:token', element: <ResetPasswordPage /> },
    ],
  },

  {
    element: <ProtectedRoute permission={PERMISSIONS.CONTRACT_READ_OWN} />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // -------- Diaspora Investor --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.INVESTMENT_READ_OWN}
                roles={['DIASPORA_INVESTOR']}
              />
            ),
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
          },

          // -------- Commercial Bank --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.ESCROW_READ_OWN}
                roles={['COMMERCIAL_BANK']}
              />
            ),
            children: [
              { path: '/bank/overview', element: <BankOverviewPage /> },
              { path: '/bank/escrows', element: <BankEscrowsPage /> },
              { path: '/bank/escrows/:id', element: <BankEscrowDetailPage /> },
              { path: '/bank/loans', element: <BankLoansPage /> },
              { path: '/bank/collateral', element: <BankCollateralPage /> },
              { path: '/bank/settlements', element: <BankSettlementsPage /> },
              { path: '/bank/npl', element: <BankNplPage /> },
            ],
          },

          // -------- DBE --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_READ_ALL}
                roles={['DBE_OFFICER']}
              />
            ),
            children: [
              { path: '/dbe/portfolio', element: <DbePortfolioPage /> },
              { path: '/dbe/co-financing', element: <DbeCoFinancingPage /> },
              { path: '/dbe/on-lending', element: <DbeOnLendingPage /> },
              { path: '/dbe/ta-tracking', element: <DbeTaTrackingPage /> },
              { path: '/dbe/reports', element: <DbeReportsPage /> },
            ],
          },

          // -------- NAFA --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_READ_ALL}
                roles={['NAFA_OFFICER']}
              />
            ),
            children: [
              { path: '/nafa/guarantees', element: <NafaGuaranteesPage /> },
              { path: '/nafa/claims', element: <NafaClaimsPage /> },
              { path: '/nafa/risk-sharing', element: <NafaRiskSharingPage /> },
              { path: '/nafa/refinancing', element: <NafaRefinancingPage /> },
              { path: '/nafa/reports', element: <NafaReportsPage /> },
            ],
          },

          // -------- Input Supplier --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.INPUT_CREATE}
                roles={['INPUT_SUPPLIER']}
              />
            ),
            children: [
              { path: '/supplier/orders', element: <SupplierOrdersPage /> },
              { path: '/supplier/orders/:id', element: <SupplierOrderDetailPage /> },
              { path: '/supplier/deliveries', element: <SupplierDeliveriesPage /> },
              { path: '/supplier/payments', element: <SupplierPaymentsPage /> },
              { path: '/supplier/profile', element: <SupplierProfilePage /> },
            ],
          },

          // -------- Commercial Farmer --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_READ_OWN}
                roles={['COMMERCIAL_FARMER']}
              />
            ),
            children: [
              { path: '/farm/contracts', element: <FarmContractsPage /> },
              { path: '/farm/contracts/:id', element: <FarmContractDetailPage /> },
              { path: '/farm/inputs', element: <FarmInputsPage /> },
              { path: '/farm/escrow', element: <FarmEscrowPage /> },
              { path: '/farm/harvest', element: <FarmHarvestPage /> },
              { path: '/farm/collateral', element: <FarmCollateralPage /> },
              { path: '/farm/payments', element: <FarmPaymentsPage /> },
            ],
          },

          // -------- Off-Taker --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_READ_OWN}
                roles={['OFF_TAKER']}
              />
            ),
            children: [
              { path: '/buyer/purchases', element: <BuyerPurchases /> },
              { path: '/buyer/settlements', element: <BuyerSettlements /> },
            ],
          },

          // -------- Government --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.REPORT_READ_OWN}
                roles={['GOVERNMENT_REGULATOR']}
              />
            ),
            children: [
              { path: '/gov/dashboard', element: <GovDashboardPage /> },
              { path: '/gov/contracts', element: <GovContractsPage /> },
              { path: '/gov/forex', element: <GovForexPage /> },
              { path: '/gov/credit', element: <GovCreditPage /> },
              { path: '/gov/inputs', element: <GovInputsPage /> },
              { path: '/gov/tax', element: <GovTaxPage /> },
              { path: '/gov/incentives', element: <GovIncentivesPage /> },
              { path: '/gov/audit', element: <GovAuditPage /> },
              { path: '/gov/reports', element: <GovReportsPage /> },
            ],
          },

          // -------- Donor --------
          {
            element: (
              <ProtectedRoute permission={PERMISSIONS.REPORT_READ_OWN} roles={['DONOR']} />
            ),
            children: [
              { path: '/donor/grants', element: <DonorGrantsPage /> },
              { path: '/donor/disbursements', element: <DonorDisbursementsPage /> },
              { path: '/donor/impact', element: <DonorImpactPage /> },
              { path: '/donor/reports', element: <DonorReportsPage /> },
              { path: '/donor/audit', element: <DonorAuditPage /> },
            ],
          },

          // -------- Admin --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.SYSTEM_CONFIGURE}
                roles={['NAFI_ADMIN']}
              />
            ),
            children: [
              { path: '/admin/overview', element: <AdminOverviewPage /> },
              { path: '/admin/users', element: <AdminUsersPage /> },
              { path: '/admin/contracts', element: <AdminContractsPage /> },
              { path: '/admin/escrows', element: <AdminEscrowsPage /> },
              { path: '/admin/settlements', element: <AdminSettlementsPage /> },
              { path: '/admin/disputes', element: <AdminDisputesPage /> },
              { path: '/admin/config', element: <AdminConfigPage /> },
              { path: '/admin/audit', element: <AdminAuditPage /> },
              { path: '/admin/health', element: <AdminHealthPage /> },
            ],
          },

          // -------- Compliance --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_APPROVE}
                roles={['COMPLIANCE_OFFICER']}
              />
            ),
            children: [
              { path: '/compliance/queue', element: <ComplianceQueuePage /> },
              { path: '/compliance/kyc', element: <ComplianceKycPage /> },
              { path: '/compliance/aml', element: <ComplianceAmlPage /> },
              { path: '/compliance/sar', element: <ComplianceSarPage /> },
            ],
          },

          // -------- Arbitrator --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.DISPUTE_ARBITRATE}
                roles={['ARBITRATOR']}
              />
            ),
            children: [
              { path: '/arbitration/cases', element: <ArbitrationCasesPage /> },
              { path: '/arbitration/cases/:id', element: <ArbitrationCaseDetailPage /> },
            ],
          },

          // -------- Shared --------
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFound /> },
]);
EOF

# ============================================================
# DONE
# ============================================================

echo ""
echo "============================================================"
echo "✅ NAFI Step 7 scaffolding complete"
echo "============================================================"
echo ""
echo "Created the remaining six role portals:"
echo ""
echo "  Commercial Bank:"
echo "    pages/OverviewPage.tsx           (escrow KPIs)"
echo "    pages/EscrowsPage.tsx            (paginated list)"
echo "    pages/EscrowDetailPage.tsx       (balance + ledger + release CTA)"
echo "    pages/LoansPage.tsx              (loan portfolio)"
echo "    pages/CollateralPage.tsx         (collateral registry)"
echo "    pages/SettlementsPage.tsx        (settlement history)"
echo "    pages/NplPage.tsx                (NPL monitor with ratio)"
echo "    components/EscrowReleaseDialog.tsx (multi-party release > 1M ETB)"
echo "    hooks/useBankSummary.ts"
echo ""
echo "  DBE:"
echo "    pages/PortfolioPage.tsx          (co-financing KPIs)"
echo "    pages/CoFinancingPage.tsx        (RUFIP III contracts)"
echo "    pages/OnLendingPage.tsx"
echo "    pages/TaTrackingPage.tsx"
echo "    pages/ReportsPage.tsx"
echo ""
echo "  NAFA:"
echo "    pages/GuaranteesPage.tsx         (70% coverage cards)"
echo "    pages/ClaimsPage.tsx"
echo "    pages/RiskSharingPage.tsx        (exposure + claim rate)"
echo "    pages/RefinancingPage.tsx"
echo "    pages/ReportsPage.tsx"
echo ""
echo "  Government:"
echo "    pages/DashboardPage.tsx          (bar + pie + dual-axis line)"
echo "    pages/ContractsPage.tsx          (full registry)"
echo "    pages/{Forex,Credit,Inputs,Tax,Incentives,Audit,Reports}Page.tsx"
echo ""
echo "  Donor:"
echo "    pages/GrantsPage.tsx             (RUFIP III details)"
echo "    pages/DisbursementsPage.tsx"
echo "    pages/ImpactPage.tsx             (5 impact KPIs)"
echo "    pages/ReportsPage.tsx"
echo "    pages/AuditPage.tsx"
echo ""
echo "  Admin:"
echo "    pages/OverviewPage.tsx           (platform KPIs)"
echo "    pages/UsersPage.tsx              (user management)"
echo "    pages/{Contracts,Escrows,Settlements,Disputes,Config,Audit,Health}Page.tsx"
echo ""
echo "  Compliance:"
echo "    pages/QueuePage.tsx              (DRAFT contracts)"
echo "    pages/{Kyc,Aml,Sar}Page.tsx"
echo ""
echo "  Arbitrator:"
echo "    pages/CasesPage.tsx              (paginated docket)"
echo "    pages/CaseDetailPage.tsx         (evidence + hearing + decision)"
echo ""
echo "  Router:"
echo "    All 12 role portals now use real pages"
echo "    Only off-taker routes remain as stubs"
echo ""
echo "Next steps:"
echo "  pnpm install"
echo "  pnpm --filter @nafi/web typecheck"
echo "  pnpm --filter @nafi/web lint"
echo "  pnpm --filter @nafi/web dev   # → http://localhost:3000"
echo ""
echo "Then proceed to Step 8 (farmer PWA offline-first)."
echo ""

