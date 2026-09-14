import { Lock, Unlock } from 'lucide-react';

import { formatMoney, type SupportedCurrency } from '@nafi/formatters';

import { Card, CardBody, CardHeader } from '../../components/Card/Card';
import { Badge } from '../../primitives/Badge/Badge';

export interface EscrowBalanceCardProps {
  contractId: string;
  isLocked: boolean;
  balances: Array<{ currency: SupportedCurrency; amount: string }>;
  bankName: string;
}

export function EscrowBalanceCard({
  contractId,
  isLocked,
  balances,
  bankName,
}: EscrowBalanceCardProps) {
  return (
    <Card>
      <CardHeader
        title="Escrow Balance"
        description={`Managed by ${bankName} · Contract ${contractId.slice(0, 8)}`}
        action={
          <Badge variant={isLocked ? 'warning' : 'success'} dot>
            {isLocked ? (
              <>
                <Lock className="h-3 w-3" /> Locked
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3" /> Released
              </>
            )}
          </Badge>
        }
      />
      <CardBody>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {balances.map((b) => (
            <div key={b.currency} className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                {b.currency}
              </span>
              <span className="font-mono text-xl font-semibold text-neutral-900 tabular-nums">
                {formatMoney(b.amount, b.currency)}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
