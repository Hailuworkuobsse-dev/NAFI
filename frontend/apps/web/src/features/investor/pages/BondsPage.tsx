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
        <p className="mt-1 text-sm text-neutral-500">Fixed-return agricultural bonds you hold.</p>
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
