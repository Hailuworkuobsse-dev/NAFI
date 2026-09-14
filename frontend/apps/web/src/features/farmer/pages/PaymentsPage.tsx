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
                    {
                      label: 'Actual yield',
                      value: `${Number(s.actualYieldKg).toLocaleString()} kg`,
                    },
                    {
                      label: 'Total distributed',
                      value: formatMoney(s.totalDistributedEtb, 'ETB'),
                    },
                    {
                      label: 'Executed',
                      value: s.executedAt ? formatDate(s.executedAt) : '—',
                    },
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
