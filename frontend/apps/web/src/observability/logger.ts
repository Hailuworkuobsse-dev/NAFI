type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN_LEVEL: Level =
  (import.meta.env.VITE_LOG_LEVEL as Level | undefined) ??
  (import.meta.env.PROD ? 'info' : 'debug');

const SENSITIVE_KEYS = /password|token|secret|authorization|ssn|credit.?card/i;

function sanitize(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = SENSITIVE_KEYS.test(key) ? '[redacted]' : sanitize(value);
  }
  return out;
}

function log(level: Level, message: string, meta?: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return;

  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta: sanitize(meta) } : {}),
  };

  if (!import.meta.env.PROD) {
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn('[nafi]', payload);
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
};
