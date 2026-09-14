import crypto from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

import { prisma } from '@/config/prisma';
import { logger } from '@/config/logger';

interface AuditParams {
  action: string;
  resource: string;
  resourceId?: string | ((req: Request) => string | undefined);
  metadata?: Record<string, unknown> | ((req: Request) => Record<string, unknown>);
}

/**
 * Persists an audit entry with hash chaining.
 * The hash of each entry incorporates the previous entry's hash,
 * making tampering detectable.
 */
export async function writeAudit(
  req: Request,
  params: AuditParams,
): Promise<void> {
  try {
    const resourceId =
      typeof params.resourceId === 'function' ? params.resourceId(req) : params.resourceId;
    const metadata =
      typeof params.metadata === 'function' ? params.metadata(req) : params.metadata;

    const prev = await prisma.auditLog.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { hash: true },
    });

    const payload = JSON.stringify({
      actorId: req.user?.sub ?? null,
      action: params.action,
      resource: params.resource,
      resourceId: resourceId ?? null,
      metadata: metadata ?? null,
      timestamp: new Date().toISOString(),
      prevHash: prev?.hash ?? null,
    });

    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    await prisma.auditLog.create({
      data: {
        actorId: req.user?.sub ?? null,
        action: params.action,
        resource: params.resource,
        resourceId,
        ip: req.ip,
        userAgent: req.header('user-agent') ?? undefined,
        metadata: metadata as never,
        hash,
        prevHash: prev?.hash ?? null,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to write audit log');
  }
}

/**
 * Express middleware that logs the request after response is sent.
 */
export function auditMiddleware(action: string, resource: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        void writeAudit(req, {
          action,
          resource,
          resourceId: req.params.id,
          metadata: { method: req.method, path: req.originalUrl },
        });
      }
    });
    next();
  };
}
