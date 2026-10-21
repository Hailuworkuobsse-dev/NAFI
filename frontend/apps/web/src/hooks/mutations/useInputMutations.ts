import { useMutation, useQueryClient } from '@tanstack/react-query';

import { inputsApi } from '@/api/domains/inputs';
import type { NormalizedApiError } from '@/api/errors';
import type {
  CreateInputOrderInput,
  InputPurchaseSummary,
  VerifyDeliveryInput,
} from '@/api/types/input';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';
import { track } from '@/observability/analytics';

export function useCreateInputOrder() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<InputPurchaseSummary, NormalizedApiError, CreateInputOrderInput>({
    mutationFn: (input) => inputsApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.inputs.root });
      toast({ title: 'Purchase order created', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Order failed', description: err.message, variant: 'error' });
    },
  });
}

export function useVerifyDelivery() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<InputPurchaseSummary, NormalizedApiError, VerifyDeliveryInput>({
    mutationFn: (input) => inputsApi.verifyDelivery(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.inputs.detail(vars.purchaseId) });
      void qc.invalidateQueries({ queryKey: qk.inputs.root });
      void qc.invalidateQueries({ queryKey: qk.escrows.root });
      track({ name: 'delivery_verified', props: { offline: !navigator.onLine } });
      toast({
        title: 'Delivery verified',
        description: 'Escrow funds will be released to the supplier.',
        variant: 'success',
      });
    },
    onError: (err) => {
      toast({ title: 'Verification failed', description: err.message, variant: 'error' });
    },
  });
}
