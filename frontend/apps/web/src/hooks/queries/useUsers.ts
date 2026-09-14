import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { usersApi } from '@/api/domains/users';
import type { ListResponse } from '@/api/types/common';
import type { UserFilters, UserSummary } from '@/api/types/user';
import { qk } from '@/lib/queryKeys';

export function useUsers(
  filters: UserFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<UserSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.users.list(filters),
    queryFn: () => usersApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: qk.users.detail(id),
    queryFn: () => usersApi.detail(id),
    enabled: Boolean(id),
  });
}
