import { useMutation, useQueryClient } from '@tanstack/react-query';

import { collateralApi } from '@/api/domains/collateral';
import type { NormalizedApiError } from '@/api/errors';
import type { CollateralSummary, RegisterCollateralInput } from '@/api/types/collateral';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useRegisterCollateral() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<CollateralSummary, NormalizedApiError, RegisterCollateralInput>({
    mutationFn: (input) => collateralApi.register(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.collateral.root });
      toast({ title: 'Collateral registered', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Registration failed', description: err.message, variant: 'error' });
    },
  });
}

export function useRegisterLien() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    CollateralSummary,
    NormalizedApiError,
    { id: string; lienHolderId: string; amount: string }
  >({
    mutationFn: ({ id, lienHolderId, amount }) =>
      collateralApi.registerLien(id, lienHolderId, amount),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.collateral.detail(vars.id) });
      toast({ title: 'Lien registered', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Lien failed', description: err.message, variant: 'error' });
    },
  });
}

export function useLiquidateCollateral() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<CollateralSummary, NormalizedApiError, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => collateralApi.liquidate(id, reason),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.collateral.detail(vars.id) });
      void qc.invalidateQueries({ queryKey: qk.collateral.root });
      toast({ title: 'Collateral liquidated', variant: 'warning' });
    },
    onError: (err) => {
      toast({ title: 'Liquidation failed', description: err.message, variant: 'error' });
    },
  });
}
