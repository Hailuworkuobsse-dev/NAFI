import { z } from 'zod';
import type { HelmetOptions } from 'helmet';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  REDACT_FIELDS: z.string().default('password,token,secret,apiKey'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z.string().transform((val) => val === 'true').default('false'),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  HELMET_CSP_DIRECTIVES: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env | null = null;

export function getEnv(): Env {
  if (!env) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      throw new Error(`Invalid environment variables: ${result.error.message}`);
    }
    env = result.data;
  }
  return env;
}

export function validateEnv(): void {
  getEnv();
}

export const config = getEnv();

export const helmetOptions: HelmetOptions = {
  contentSecurityPolicy: config.HELMET_CSP_DIRECTIVES 
    ? { directives: JSON.parse(config.HELMET_CSP_DIRECTIVES) }
    : undefined,
  crossOriginEmbedderPolicy: false,
};
