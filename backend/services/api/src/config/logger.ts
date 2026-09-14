import pino from 'pino';

import { env } from './env';

export const logger = pino({
  level: env.isProd ? 'info' : 'debug',
  transport: env.isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      }
    : undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'token',
      '*.password',
      '*.token',
    ],
    censor: '[redacted]',
  },
});
