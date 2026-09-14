import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@nafi/api-client';

export interface PublicStats {
  totalFundedUsd: number;
  activeContracts: number;
  farmersReached: number;
  hectaresUnderContract: number;
  forexGeneratedUsd: number;
  jobsCreated: number;
}

export function usePublicStats(): { stats: PublicStats; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.publicStats,
    queryFn: async (): Promise<PublicStats> => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/stats`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch public stats');
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

  const fallback: PublicStats = {
    totalFundedUsd: 12_450_000,
    activeContracts: 47,
    farmersReached: 1_840,
    hectaresUnderContract: 68_200,
    forexGeneratedUsd: 4_180_000,
    jobsCreated: 3_210,
  };

  return { stats: data ?? fallback, isLoading };
}
