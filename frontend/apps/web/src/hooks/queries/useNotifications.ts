import { useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationsApi } from '@/api/domains/notifications';
import { qk } from '@/lib/queryKeys';

export function useNotifications() {
  return useQuery({
    queryKey: qk.notifications.list(),
    queryFn: () => notificationsApi.list(),
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: qk.notifications.unreadCount,
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return async (id: string) => {
    await notificationsApi.markRead(id);
    await qc.invalidateQueries({ queryKey: qk.notifications.root });
  };
}
