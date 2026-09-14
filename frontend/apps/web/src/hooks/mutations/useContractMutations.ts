import { useMutation, useQueryClient } from '@tanstack/react-query';

import { contractsApi } from '@/api/domains/contracts';
import type { NormalizedApiError } from '@/api/errors';
import type { ContractDetail, CreateContractInput, SignContractInput } from '@/api/types/contract';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useCreateContract() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<ContractDetail, NormalizedApiError, CreateContractInput>({
    mutationFn: (input) => contractsApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.contracts.root });
      toast({ title: 'Contract created', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Could not create contract', description: err.message, variant: 'error' });
    },
  });
}

export function useUpdateContract(id: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<ContractDetail, NormalizedApiError, Partial<CreateContractInput>>({
    mutationFn: (input) => contractsApi.update(id, input),
    onSuccess: (updated) => {
      qc.setQueryData(qk.contracts.detail(id), updated);
      void qc.invalidateQueries({ queryKey: qk.contracts.root });
      toast({ title: 'Contract updated', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Update failed', description: err.message, variant: 'error' });
    },
  });
}

export function useSignContract() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: SignContractInput) => contractsApi.sign(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.contracts.signatures(vars.contractId) });
      void qc.invalidateQueries({ queryKey: qk.contracts.detail(vars.contractId) });
      toast({ title: 'Contract signed', variant: 'success' });
    },
    onError: (err: NormalizedApiError) => {
      toast({ title: 'Signing failed', description: err.message, variant: 'error' });
    },
  });
}

export function useFreezeContract() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      contractsApi.freeze(id, reason),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.contracts.root });
      void qc.invalidateQueries({ queryKey: qk.contracts.detail(vars.id) });
      toast({ title: 'Contract frozen', variant: 'warning' });
    },
    onError: (err: NormalizedApiError) => {
      toast({ title: 'Freeze failed', description: err.message, variant: 'error' });
    },
  });
}
