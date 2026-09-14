import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { Prisma } from '@prisma/client';

/**
 * Central error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error({
    err,
    requestId: req.requestId,
    path: req.path,
    method: req.method,
  }, 'Error occurred');

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.reduce((acc, error) => {
      const key = error.path.join('.');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(error.message);
      return acc;
    }, {} as Record<string, string[]>);

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors,
      },
    });
    return;
  }

  // Handle ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let statusCode = 400;
    let code = 'DATABASE_ERROR';
    let message = 'Database operation failed';

    switch (err.code) {
      case 'P2002': // Unique constraint violation
        statusCode = 409;
        code = 'CONFLICT';
        message = 'Resource already exists';
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        code = 'NOT_FOUND';
        message = 'Resource not found';
        break;
      case 'P2003': // Foreign key constraint
        statusCode = 400;
        code = 'BAD_REQUEST';
        message = 'Related resource not found';
        break;
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
      },
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
      },
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token expired',
      },
    });
    return;
  }

  // Default: Internal server error
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'Internal server error' : err.message,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
}
