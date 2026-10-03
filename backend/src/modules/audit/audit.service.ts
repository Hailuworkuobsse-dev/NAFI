import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { TenantScope } from '../../middleware/tenantScope';

export interface AuditFilter {
  action?: string;
  entity?: string;
  entityId?: string;
  userId?: string;
}

export class AuditService {
  async findAll(
    _userId: string,
    institutionId: string | null,
    scope: TenantScope = TenantScope.OWN,
    filter: AuditFilter = {},
    page = 1,
    limit = 20
  ) {
    const where: Record<string, unknown> = {};
    if (filter.action) where.action = filter.action;
    if (filter.entity) where.entity = filter.entity;
    if (filter.entityId) where.entityId = filter.entityId;
    if (filter.userId) where.userId = filter.userId;

    // Non-privileged roles only see their own audit entries
    if (scope === TenantScope.OWN || scope === TenantScope.INSTITUTION) {
      if (!['ALL', 'NATIONAL'].includes(scope)) where.userId = _userId;
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
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
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'asc' } });
    for (let i = 1; i < logs.length; i++) {
      const prev = logs[i - 1];
      const curr = logs[i];
      if (!prev || !curr) continue;
      if (curr.previousHash !== prev.currentHash) {
        return { valid: false, brokenAt: curr.id };
      }
    }
    return { valid: true };
  }
}
export const auditService = new AuditService();
