import type { Request, Response } from 'express';

import { prisma } from '@/config/prisma';

export function liveness(_req: Request, res: Response): void {
  res.json({ status: 'ok' });
}

export async function readiness(_req: Request, res: Response): Promise<void> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: { status: 'ok', latencyMs: Date.now() - start },
    });
  } catch {
    res.status(503).json({
      status: 'degraded',
      database: { status: 'error' },
    });
  }
}

export async function db(_req: Request, res: Response): Promise<void> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', latencyMs: Date.now() - start });
  } catch {
    res.status(503).json({ status: 'error' });
  }
}
