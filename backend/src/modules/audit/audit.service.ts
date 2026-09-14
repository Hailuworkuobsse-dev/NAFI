import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

export class AuditService {
  async findAll(filter: any = {}, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (filter.action) where.action = filter.action;
    if (filter.entityType) where.entityType = filter.entityType;
    if (filter.userId) where.userId = filter.userId;
    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { timestamp: 'desc' } }),
      prisma.auditLog.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findById(id: string) {
    const item = await prisma.auditLog.findUnique({ where: { id } });
    if (!item) throw ApiError.notFound('Audit log not found');
    return item;
  }
  async verifyChain() {
    const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'asc' } });
    for (let i = 1; i < logs.length; i++) {
      if (logs[i].previousHash !== logs[i - 1].hash) {
        return { valid: false, brokenAt: logs[i].id };
      }
    }
    return { valid: true };
  }
}
export const auditService = new AuditService();
