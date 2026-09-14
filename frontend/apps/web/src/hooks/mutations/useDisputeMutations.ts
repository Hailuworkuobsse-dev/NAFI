import { useMutation, useQueryClient } from '@tanstack/react-query';

import { disputesApi } from '@/api/domains/disputes';
import type { NormalizedApiError } from '@/api/errors';
import type {
  DecideDisputeInput,
  DisputeDetail,
  FileDisputeInput,
} from '@/api/types/dispute';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useFileDispute() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: FileDisputeInput) => disputesApi.file(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.disputes.root });
      void qc.invalidateQueries({ queryKey: qk.escrows.root });
      toast({
        title: 'Dispute filed',
        description: 'Escrow funds have been frozen pending review.',
        variant: 'warning',
      });
    },
    onError: (err: NormalizedApiError) => {
      toast({ title: 'Filing failed', description: err.message, variant: 'error' });
    },
  });
}

export function useScheduleHearing() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    DisputeDetail,
    NormalizedApiError,
    { id: string; hearingAt: string; arbitratorId: string }
  >({
    mutationFn: ({ id, hearingAt, arbitratorId }) =>
      disputesApi.scheduleHearing(id, hearingAt, arbitratorId),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.disputes.detail(vars.id) });
      toast({ title: 'Hearing scheduled', variant: 'success' });
    },
  });
}

export function useDecideDispute() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<DisputeDetail, NormalizedApiError, DecideDisputeInput>({
    mutationFn: (input) => disputesApi.decide(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.disputes.detail(vars.disputeId) });
      void qc.invalidateQueries({ queryKey: qk.disputes.root });
      toast({ title: 'Decision recorded', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Decision failed', description: err.message, variant: 'error' });
    },
  });
}
