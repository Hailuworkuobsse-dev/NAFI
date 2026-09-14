import { useMutation, useQueryClient } from '@tanstack/react-query';

import { escrowsApi } from '@/api/domains/escrows';
import type { NormalizedApiError } from '@/api/errors';
import type { EscrowSummary, FreezeEscrowInput, ReleaseEscrowInput } from '@/api/types/escrow';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useReleaseEscrow() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: ReleaseEscrowInput) => escrowsApi.release(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.escrows.root });
      void qc.invalidateQueries({ queryKey: qk.escrows.detail(vars.escrowId) });
      void qc.invalidateQueries({ queryKey: qk.escrows.ledger(vars.escrowId) });
      toast({ title: 'Escrow released', variant: 'success' });
    },
    onError: (err: NormalizedApiError) => {
      toast({ title: 'Release failed', description: err.message, variant: 'error' });
    },
  });
}

export function useFreezeEscrow() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<EscrowSummary, NormalizedApiError, FreezeEscrowInput>({
    mutationFn: (input) => escrowsApi.freeze(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.escrows.detail(vars.escrowId) });
      toast({ title: 'Escrow frozen', variant: 'warning' });
    },
    onError: (err) => {
      toast({ title: 'Freeze failed', description: err.message, variant: 'error' });
    },
  });
}

export function useCloseEscrow() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<EscrowSummary, NormalizedApiError, string>({
    mutationFn: (id) => escrowsApi.close(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: qk.escrows.detail(id) });
      void qc.invalidateQueries({ queryKey: qk.escrows.root });
      toast({ title: 'Escrow closed', variant: 'success' });
    },
  });
}
