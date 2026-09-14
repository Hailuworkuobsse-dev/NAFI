import { useQuery } from '@tanstack/react-query';

export interface PublicOpportunity {
  id: string;
  targetCrop: string;
  region: string;
  targetAmountEtb: string;
  committedAmountEtb: string;
  investorCount: number;
  targetYieldKg: string;
  floorPriceEtb: string;
  maturityDate: string;
  fundedPercent: number;
}

export function usePublicOpportunities() {
  const { data, isLoading } = useQuery({
    queryKey: ['public', 'opportunities'] as const,
    queryFn: async (): Promise<PublicOpportunity[]> => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/opportunities`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch opportunities');
      const json = await res.json();
      return json.data as PublicOpportunity[];
    },
    staleTime: 60_000,
    retry: 1,
  });

  return { opportunities: data ?? [], isLoading };
}
