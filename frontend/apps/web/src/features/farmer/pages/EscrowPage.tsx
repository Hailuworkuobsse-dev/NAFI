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
              balances={esc.balances.map((b) => ({
                currency: b.currency,
                amount: b.amount,
              }))}
            />
          ))}
        </div>

        {firstEscrowId && ledger.data && ledger.data.length > 0 && (
          <Card>
            <CardHeader title="Ledger" />
            <CardBody className="p-0">
              <ul className="divide-y divide-neutral-100">
                {ledger.data.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between px-5 py-3 text-sm"
                  >
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
