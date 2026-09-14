import { http } from '../client';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  deepLink?: string;
}

export const notificationsApi = {
  list() {
    return http.get<NotificationItem[]>('/notifications');
  },

  unreadCount() {
    return http.get<{ count: number }>('/notifications/unread-count');
  },

  markRead(id: string) {
    return http.post<void>(`/notifications/${id}/read`);
  },

  markAllRead() {
    return http.post<void>('/notifications/read-all');
  },
};
