import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

export class NotificationsService {
  async findAll(userId: string, page = 1, limit = 20) {
    const where = { userId };
    const [data, total] = await Promise.all([
      prisma.notification.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findById(id: string, userId: string) {
    const item = await prisma.notification.findFirst({ where: { id, userId } });
    if (!item) throw ApiError.notFound('Notification not found');
    return item;
  }
  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date(), isRead: true },
    });
  }
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date(), isRead: true },
    });
  }
  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }
  async create(data: any, userId: string) {
    return prisma.notification.create({
      data: {
        ...data,
        userId,
        notificationRef: data.notificationRef || `NTF-${Date.now().toString(36).toUpperCase()}`,
      },
    });
  }
}
export const notificationsService = new NotificationsService();
