import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Input, Modal, Select } from '@nafi/ui-react';

import { useContracts, useCreateInputOrder } from '@/hooks';

const schema = z.object({
  contractId: z.string().uuid(),
  itemDescription: z.string().min(3),
  quantity: z.string().regex(/^\d+(\.\d{1,3})?$/),
  unit: z.string().min(1),
  unitCostEtb: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

type FormInput = z.infer<typeof schema>;

export function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: contracts } = useContracts({ status: 'ACTIVE', pageSize: 100 });
  const create = useCreateInputOrder();
  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      contractId: '',
      itemDescription: '',
      quantity: '',
      unit: 'kg',
      unitCostEtb: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await create.mutateAsync(values);
    onOpenChange(false);
    form.reset();
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New purchase order"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={create.isPending}>
            Create order
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Select
          label="Contract"
          value={form.watch('contractId')}
          onValueChange={(v) => form.setValue('contractId', v, { shouldValidate: true })}
          error={form.formState.errors.contractId?.message}
          options={
            contracts?.items.map((c) => ({
              value: c.id,
              label: `${c.targetCrop} — ${c.region}`,
            })) ?? []
          }
        />

        <Input
          label="Item description"
          placeholder="e.g., Certified sesame seed, 10 tons"
          error={form.formState.errors.itemDescription?.message}
          {...form.register('itemDescription')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quantity"
            inputMode="decimal"
            error={form.formState.errors.quantity?.message}
            {...form.register('quantity')}
          />
          <Input
            label="Unit"
            placeholder="kg, ton, liter"
            error={form.formState.errors.unit?.message}
            {...form.register('unit')}
          />
        </div>

        <Input
          label="Unit cost (ETB)"
          inputMode="decimal"
          error={form.formState.errors.unitCostEtb?.message}
          {...form.register('unitCostEtb')}
        />
      </form>
    </Modal>
  );
}
