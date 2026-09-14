import { formatDate, formatMoney } from '@nafi/formatters';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  DataList,
  WarehouseReceiptCard,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useCollateral } from '@/hooks';

export function FarmCollateralPage() {
  const { data, isLoading, isError, error, refetch } = useCollateral({ pageSize: 50 });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Collateral</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Warehouse receipts and movable property registered as collateral.
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
            <p className="text-sm text-neutral-500">No collateral registered yet.</p>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data?.items.map((c) =>
            c.type === 'WAREHOUSE_RECEIPT' ? (
              <WarehouseReceiptCard
                key={c.id}
                receipt={{
                  id: c.id,
                  quantityKg: '0',
                  grade: '—',
                  warehouseName: c.description,
                  issuedAt: c.registeredAt,
                  expiresAt: c.expiresAt ?? c.registeredAt,
                  hasLien: c.lienStatus === 'LIEN_REGISTERED',
                }}
              />
            ) : (
              <Card key={c.id}>
                <CardHeader
                  title={c.description}
                  description={c.type.replace(/_/g, ' ')}
                  action={
                    <Badge
                      variant={c.lienStatus === 'LIEN_REGISTERED' ? 'warning' : 'success'}
                      dot
                    >
                      {c.lienStatus.replace(/_/g, ' ')}
                    </Badge>
                  }
                />
                <CardBody>
                  <DataList
                    columns={1}
                    items={[
                      { label: 'Estimated value', value: formatMoney(c.estimatedValueEtb, 'ETB') },
                      { label: 'Registered', value: formatDate(c.registeredAt) },
                      { label: 'Expires', value: c.expiresAt ? formatDate(c.expiresAt) : '—' },
                    ]}
                  />
                </CardBody>
              </Card>
            ),
          )}
        </div>
      </QueryBoundary>
    </div>
  );
}
