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
              balances={(escrow.data.balances ?? []).map((b) => ({
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
