import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge, Card, CardBody, CardHeader } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useSettlements } from '@/hooks';

export function SupplierPaymentsPage() {
  const { data, isLoading, isError, error, refetch } = useSettlements({ pageSize: 50 });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Payments</h1>
        <p className="mt-1 text-sm text-neutral-500">Settlement history.</p>
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
                  <Badge variant={s.status === 'EXECUTED' ? 'success' : 'warning'} dot>
                    {s.status}
                  </Badge>
                }
              />
              <CardBody className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Total distributed</span>
                <span className="font-mono font-medium tabular-nums text-neutral-900">
                  {formatMoney(s.totalDistributedEtb, 'ETB')}
                </span>
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
