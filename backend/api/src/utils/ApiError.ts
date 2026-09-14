export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: Record<string, string[]>) {
    return new ApiError(400, 'bad_request', message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, 'unauthorized', message);
  }

  static forbidden(message = 'You do not have permission') {
    return new ApiError(403, 'forbidden', message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'not_found', message);
  }

  static conflict(message: string) {
    return new ApiError(409, 'conflict', message);
  }

  static validation(message: string, details: Record<string, string[]>) {
    return new ApiError(422, 'validation_error', message, details);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, 'rate_limited', message);
  }

  static internal(message = 'Something went wrong') {
    return new ApiError(500, 'internal_error', message);
  }
}
