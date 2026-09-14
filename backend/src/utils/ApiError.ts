import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, string[]>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    isOperational: boolean = true,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = 'Bad request', details?: Record<string, string[]>): ApiError {
    return new ApiError(400, 'BAD_REQUEST', message, true, details);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message, true);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, 'FORBIDDEN', message, true);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(404, 'NOT_FOUND', message, true);
  }

  static conflict(message: string = 'Resource conflict'): ApiError {
    return new ApiError(409, 'CONFLICT', message, true);
  }

  static tooManyRequests(message: string = 'Too many requests'): ApiError {
    return new ApiError(429, 'TOO_MANY_REQUESTS', message, true);
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(500, 'INTERNAL_ERROR', message, false);
  }

  static validation(errors: Record<string, string[]>): ApiError {
    return new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', true, errors);
  }
}
