import { useMutation, useQueryClient } from '@tanstack/react-query';

import { investmentsApi } from '@/api/domains/investments';
import type { NormalizedApiError } from '@/api/errors';
import type { CreateInvestmentInput, InvestmentSummary } from '@/api/types/investment';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useCreateInvestment() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<InvestmentSummary, NormalizedApiError, CreateInvestmentInput>({
    mutationFn: (input) => investmentsApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.investments.root });
      void qc.invalidateQueries({ queryKey: qk.opportunities.root });
      toast({ title: 'Investment committed', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Investment failed', description: err.message, variant: 'error' });
    },
  });
}
