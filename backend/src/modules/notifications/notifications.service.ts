import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

export class NotificationsService {
  async findAll(userId: string, page = 1, limit = 20) {
    const where = { recipientId: userId };
    const [data, total] = await Promise.all([
      prisma.notification.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findById(id: string, userId: string) {
    const item = await prisma.notification.findFirst({ where: { id, recipientId: userId } });
    if (!item) throw ApiError.notFound('Notification not found');
    return item;
  }
  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, recipientId: userId },
      data: { readAt: new Date() },
    });
  }
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { recipientId: userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
  async create(data: any, recipientId: string) {
    return prisma.notification.create({ data: { ...data, recipientId } });
  }
}
export const notificationsService = new NotificationsService();
