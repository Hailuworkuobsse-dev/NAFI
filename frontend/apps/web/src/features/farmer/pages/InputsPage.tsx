import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import { formatDate, formatMoney } from '@nafi/formatters';
import { PERMISSIONS } from '@nafi/rbac-core';
import { Badge, Button, Can, Card, CardBody, CardHeader } from '@nafi/ui-react';

import type { InputPurchaseSummary } from '@/api/types/input';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useInputs } from '@/hooks';

import { DeliveryVerifyDialog } from '../components/DeliveryVerifyDialog';

export function FarmInputsPage() {
  const { data, isLoading, isError, error, refetch } = useInputs({ pageSize: 50 });
  const [selected, setSelected] = useState<InputPurchaseSummary | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Input Orders</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Track deliveries and confirm receipt to release payment.
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
            <p className="text-sm text-neutral-500">No input orders yet.</p>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {data?.items.map((p) => (
            <Card key={p.id}>
              <CardHeader
                title={p.itemDescription}
                description={`${p.supplierName} · ${p.contractCrop}`}
                action={
                  <Badge
                    variant={
                      p.isDisbursed ? 'success' : p.isDelivered ? 'info' : 'warning'
                    }
                    dot
                  >
                    {p.isDisbursed ? 'Paid' : p.isDelivered ? 'Delivered' : 'Pending delivery'}
                  </Badge>
                }
              />
              <CardBody className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500">Quantity</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {Number(p.quantity).toLocaleString()} {p.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Unit cost</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatMoney(p.unitCostEtb, 'ETB')}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Total</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatMoney(p.totalCostEtb, 'ETB')}
                    </p>
                  </div>
                </div>

                {p.deliveredAt && (
                  <p className="text-xs text-neutral-500">
                    Delivered {formatDate(p.deliveredAt)}
                    {p.verifiedAt ? ` · Verified ${formatDate(p.verifiedAt)}` : ''}
                  </p>
                )}

                {!p.verifiedAt && p.isDelivered && (
                  <Can I={PERMISSIONS.INPUT_VERIFY}>
                    <Button
                      onClick={() => setSelected(p)}
                      leadingIcon={<CheckCircle2 className="h-4 w-4" />}
                      fullWidth
                    >
                      Verify delivery
                    </Button>
                  </Can>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>

      {selected && (
        <DeliveryVerifyDialog
          purchase={selected}
          open={Boolean(selected)}
          onOpenChange={(open) => !open && setSelected(null)}
        />
      )}
    </div>
  );
}
