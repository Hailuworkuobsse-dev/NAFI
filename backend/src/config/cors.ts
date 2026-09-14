import { getEnv } from './env';

export interface CorsOptions {
  origin: string | RegExp | (string | RegExp)[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge?: number;
}

export function getCorsOptions(): CorsOptions {
  const env = getEnv();
  
  // Parse CORS origins (comma-separated)
  const origins = env.CORS_ORIGIN.split(',').map(o => o.trim());
  
  return {
    origin: origins.length === 1 ? origins[0] : origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-Tenant-Scope',
      'X-Permission',
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    maxAge: 86400, // 24 hours
  };
}
