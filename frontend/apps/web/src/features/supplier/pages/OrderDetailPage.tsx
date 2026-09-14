import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { formatDate, formatMoney } from '@nafi/formatters';
import { Badge, Card, CardBody, CardHeader, DataList } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useInput } from '@/hooks';

export function SupplierOrderDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading, isError, error, refetch } = useInput(id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/supplier/orders"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
      </Link>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {data && (
          <>
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900">
                  {data.itemDescription}
                </h1>
                <p className="mt-1 text-sm text-neutral-500">{data.contractCrop}</p>
              </div>
              <Badge
                variant={data.isDisbursed ? 'success' : data.isDelivered ? 'info' : 'warning'}
                dot
              >
                {data.isDisbursed ? 'Paid' : data.isDelivered ? 'Delivered' : 'Awaiting delivery'}
              </Badge>
            </header>

            <Card>
              <CardHeader title="Order details" />
              <CardBody>
                <DataList
                  items={[
                    {
                      label: 'Quantity',
                      value: `${Number(data.quantity).toLocaleString()} ${data.unit}`,
                    },
                    { label: 'Unit cost', value: formatMoney(data.unitCostEtb, 'ETB') },
                    { label: 'Total cost', value: formatMoney(data.totalCostEtb, 'ETB') },
                    { label: 'Ordered', value: formatDate(data.createdAt) },
                    {
                      label: 'Delivered',
                      value: data.deliveredAt ? formatDate(data.deliveredAt) : '—',
                    },
                    {
                      label: 'Verified',
                      value: data.verifiedAt ? formatDate(data.verifiedAt) : '—',
                    },
                  ]}
                />
              </CardBody>
            </Card>
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
