import { useMemo } from 'react';

import { useEscrows } from '@/hooks';

export function useBankSummary() {
  const { data, isLoading } = useEscrows({ pageSize: 500 });

  return useMemo(() => {
    const items = data?.items ?? [];
    const locked = items.filter((e) => e.isLocked).length;
    const frozen = items.filter((e) => e.status === 'FROZEN').length;
    const totalEtb = items.reduce((s, e) => {
      const etb = e.balances.find((b) => b.currency === 'ETB');
      return s + Number(etb?.amount ?? 0);
    }, 0);
    const totalUsd = items.reduce((s, e) => {
      const usd = e.balances.find((b) => b.currency === 'USD');
      return s + Number(usd?.amount ?? 0);
    }, 0);

    return {
      isLoading,
      summary: { escrowCount: items.length, locked, frozen, totalEtb, totalUsd },
      escrows: items,
    };
  }, [data, isLoading]);
}
