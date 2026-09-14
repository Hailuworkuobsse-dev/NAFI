import { useMutation, useQueryClient } from '@tanstack/react-query';

import { settlementsApi } from '@/api/domains/settlements';
import type { NormalizedApiError } from '@/api/errors';
import type {
  ExecuteSettlementInput,
  SettlementDetail,
  SimulateSettlementInput,
} from '@/api/types/settlement';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useSimulateSettlement() {
  const { toast } = useToast();

  return useMutation<SettlementDetail, NormalizedApiError, SimulateSettlementInput>({
    mutationFn: (input) => settlementsApi.simulate(input),
    onSuccess: () => {
      toast({ title: 'Settlement simulated', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Simulation failed', description: err.message, variant: 'error' });
    },
  });
}

export function useExecuteSettlement() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<SettlementDetail, NormalizedApiError, ExecuteSettlementInput>({
    mutationFn: (input) => settlementsApi.execute(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.settlements.detail(vars.settlementId) });
      void qc.invalidateQueries({ queryKey: qk.settlements.root });
      void qc.invalidateQueries({ queryKey: qk.contracts.root });
      void qc.invalidateQueries({ queryKey: qk.escrows.root });
      toast({ title: 'Settlement executed', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Execution failed', description: err.message, variant: 'error' });
    },
  });
}
