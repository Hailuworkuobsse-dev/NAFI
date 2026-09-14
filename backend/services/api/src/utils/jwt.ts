import crypto from 'node:crypto';

import jwt from 'jsonwebtoken';

import { env } from '@/config/env';

export interface AccessTokenPayload {
  sub: string;
  nafiId: string;
  role: string;
  institutionId?: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
    issuer: 'nafi',
    audience: 'nafi-api',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'nafi',
    audience: 'nafi-api',
  }) as AccessTokenPayload;
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, jti: crypto.randomUUID() }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
    issuer: 'nafi',
    audience: 'nafi-api',
  });
}

export function verifyRefreshToken(token: string): { sub: string; jti: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'nafi',
    audience: 'nafi-api',
  }) as { sub: string; jti: string };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function hashRefreshToken(token: string): string {
  return hashToken(token);
}
