import { useQuery } from '@tanstack/react-query';

import { opportunitiesApi } from '@/api/domains/opportunities';
import type { PublicOpportunity } from '@/api/types/opportunity';
import { qk } from '@/lib/queryKeys';

export function useOpportunities() {
  return useQuery<PublicOpportunity[]>({
    queryKey: qk.opportunities.list(),
    queryFn: () => opportunitiesApi.list(),
    staleTime: 60_000,
  });
}

export function useOpportunity(id: string) {
  return useQuery<PublicOpportunity>({
    queryKey: qk.opportunities.detail(id),
    queryFn: () => opportunitiesApi.detail(id),
    enabled: Boolean(id),
  });
}
