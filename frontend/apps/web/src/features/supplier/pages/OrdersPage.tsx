import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { formatDate, formatMoney } from '@nafi/formatters';
import { PERMISSIONS } from '@nafi/rbac-core';
import { Badge, Button, Can, Card, CardBody, CardHeader } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useInputs } from '@/hooks';

import { CreatePurchaseOrderDialog } from '../components/CreatePurchaseOrderDialog';

export function SupplierOrdersPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useInputs({ pageSize: 50 });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Purchase Orders</h1>
          <p className="mt-1 text-sm text-neutral-500">
            All purchase orders issued to your suppliers.
          </p>
        </div>
        <Can I={PERMISSIONS.INPUT_CREATE}>
          <Button
            leadingIcon={<Plus className="h-4 w-4" />}
            onClick={() => setCreateOpen(true)}
          >
            New order
          </Button>
        </Can>
      </header>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">No orders yet.</p>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {data?.items.map((o) => (
            <Link key={o.id} to={`/supplier/orders/${o.id}`}>
              <Card className="transition-shadow hover:shadow-dropdown">
                <CardHeader
                  title={o.itemDescription}
                  description={`Contract: ${o.contractCrop} · ${formatDate(o.createdAt)}`}
                  action={
                    <Badge
                      variant={
                        o.isDisbursed ? 'success' : o.isDelivered ? 'info' : 'warning'
                      }
                      dot
                    >
                      {o.isDisbursed
                        ? 'Paid'
                        : o.isDelivered
                          ? 'Delivered'
                          : 'Awaiting delivery'}
                    </Badge>
                  }
                />
                <CardBody className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500">Quantity</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {Number(o.quantity).toLocaleString()} {o.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Unit cost</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatMoney(o.unitCostEtb, 'ETB')}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Total</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatMoney(o.totalCostEtb, 'ETB')}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </QueryBoundary>

      <CreatePurchaseOrderDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
