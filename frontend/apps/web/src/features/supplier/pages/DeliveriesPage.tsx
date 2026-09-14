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
