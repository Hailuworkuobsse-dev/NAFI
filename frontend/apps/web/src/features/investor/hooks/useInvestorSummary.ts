import { useMemo } from 'react';

import { useMyInvestments } from '@/hooks';

export function useInvestorSummary() {
  const { data, isLoading } = useMyInvestments({ pageSize: 500 });

  return useMemo(() => {
    const items = data?.items ?? [];
    const totalInvestedEtb = items.reduce((s, i) => s + Number(i.amountEtb), 0);
    const totalExpectedReturnEtb = items.reduce((s, i) => s + Number(i.expectedReturnEtb), 0);
    const totalRealizedReturnEtb = items.reduce(
      (s, i) => s + Number(i.realizedReturnEtb ?? 0),
      0,
    );
    const activeCount = items.filter((i) => !i.settledAt).length;

    return {
      isLoading,
      summary: {
        totalInvestedEtb,
        totalExpectedReturnEtb,
        totalRealizedReturnEtb,
        activeCount,
        investmentCount: items.length,
      },
      investments: items,
    };
  }, [data, isLoading]);
}
