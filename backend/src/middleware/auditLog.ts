import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { generateAuditHash } from '../utils/nafiId';
import { logger } from '../config/logger';

/**
 * Middleware to create hash-chained audit log entries
 */
export function auditLog(entity: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json to capture response and write audit log
    res.json = function(body: unknown) {
      // Write audit log after response is sent
      setImmediate(async () => {
        try {
          await writeAuditLog(req, entity, action, body);
        } catch (error) {
          logger.error({ error }, 'Failed to write audit log');
        }
      });
      
      return originalJson(body);
    };

    next();
  };
}

async function writeAuditLog(
  req: Request,
  entity: string,
  action: string,
  responseBody: unknown
): Promise<void> {
  try {
    // Get the most recent audit log to build hash chain
    const latestLog = await prisma.auditLog.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { currentHash: true },
    });

    const previousHash = latestLog?.currentHash || null;
    
    // Resolve the entity id defensively (req.params.id may be a string array in some route patterns)
    const rawId = (req.params as Record<string, string | string[] | undefined>).id;
    const entityId = Array.isArray(rawId) ? rawId[0] : rawId;

    // Create audit data string for hashing
    const auditData = JSON.stringify({
      entity,
      action,
      entityId: entityId || 'list',
      userId: req.user?.userId,
      timestamp: new Date().toISOString(),
    });

    const currentHash = generateAuditHash(previousHash, auditData);

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        logRef: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        previousHash,
        currentHash,
        action: action as any,
        entity,
        entityId: entityId || 'list',
        userId: req.user?.userId || null,
        tenantScope: req.tenantScope || 'OWN',
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null,
        metadata: {
          method: req.method,
          path: req.path,
          query: req.query,
          responseBody: typeof responseBody === 'object' ? responseBody : null,
        },
      },
    });

    logger.info({
      entity,
      action,
      entityId: req.params.id,
      userId: req.user?.userId,
      hash: currentHash,
    }, 'Audit log created');
  } catch (error) {
    logger.error({ error }, 'Error writing audit log');
  }
}
