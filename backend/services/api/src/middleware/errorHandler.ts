import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '@/config/logger';
import { ApiError } from '@/utils/ApiError';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { code: 'not_found', message: 'Route not found', requestId: res.locals.requestId },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = res.locals.requestId;

  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || '_';
      details[key] = details[key] ?? [];
      details[key].push(issue.message);
    }
    res.status(422).json({
      success: false,
      error: {
        code: 'validation_error',
        message: 'Some fields need your attention.',
        details,
        requestId,
      },
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    });
    return;
  }

  logger.error({ err, requestId }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: {
      code: 'internal_error',
      message: 'Something went wrong on our side.',
      requestId,
    },
  });
}
