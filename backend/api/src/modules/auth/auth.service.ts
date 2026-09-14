import crypto from 'node:crypto';

import { ROLE_PERMISSIONS, type Role } from '@nafi/rbac-core';

import { env } from '@/config/env';
import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';
import {
  hashRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@/utils/jwt';
import { generateNafiId } from '@/utils/nafiId';
import { hashPassword, verifyPassword } from '@/utils/password';

export interface AuthUserView {
  id: string;
  nafiId: string;
  email: string;
  fullName: string;
  role: Role;
  institutionId?: string;
  institutionName?: string;
  permissions: string[];
  scopes?: Record<string, string[]>;
  locale: 'en' | 'am' | 'om' | 'ti';
  mfaEnabled: boolean;
  avatarUrl?: string;
}

function toView(user: {
  id: string;
  nafiId: string;
  email: string;
  fullName: string;
  role: string;
  institutionId: string | null;
  institutionName: string | null;
  locale: string;
  mfaEnabled: boolean;
  avatarUrl: string | null;
}): AuthUserView {
  const role = user.role as Role;
  return {
    id: user.id,
    nafiId: user.nafiId,
    email: user.email,
    fullName: user.fullName,
    role,
    institutionId: user.institutionId ?? undefined,
    institutionName: user.institutionName ?? undefined,
    permissions: ROLE_PERMISSIONS[role] as string[],
    locale: user.locale as AuthUserView['locale'],
    mfaEnabled: user.mfaEnabled,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

export async function login(input: {
  email: string;
  password: string;
  mfaCode?: string;
  ip?: string;
  userAgent?: string;
}): Promise<{ accessToken: string; refreshToken: string; user: AuthUserView }> {
  const user = await prisma.stakeholder.findUnique({ where: { email: input.email } });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid email or password');

  // MFA scaffold: if enabled, we require a 6-digit code (validation stubbed)
  if (user.mfaEnabled) {
    if (!input.mfaCode || input.mfaCode.length !== 6) {
      throw ApiError.unauthorized('MFA code required');
    }
    // TODO: verify against user.mfaSecret with a TOTP library
  }

  const accessToken = signAccessToken({
    sub: user.id,
    nafiId: user.nafiId,
    role: user.role,
    institutionId: user.institutionId ?? undefined,
  });

  const refreshToken = signRefreshToken(user.id);
  const tokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.$transaction([
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        ip: input.ip,
        userAgent: input.userAgent,
      },
    }),
    prisma.stakeholder.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }),
  ]);

  return { accessToken, refreshToken, user: toView(user) };
}

export async function register(input: {
  role: Role;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  locale: 'en' | 'am' | 'om' | 'ti';
}): Promise<{ userId: string; nafiId: string }> {
  const existing = await prisma.stakeholder.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await hashPassword(input.password);

  let nafiId = generateNafiId();
  // Loop in the unlikely case of a collision
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.stakeholder.findUnique({ where: { nafiId } });
    if (!clash) break;
    nafiId = generateNafiId();
  }

  const user = await prisma.stakeholder.create({
    data: {
      nafiId,
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      role: input.role,
      locale: input.locale,
      countryCode: 'ET',
    },
  });

  return { userId: user.id, nafiId: user.nafiId };
}

export async function refresh(refreshToken: string): Promise<{
  accessToken: string;
  user: AuthUserView;
}> {
  let payload: { sub: string; jti: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token expired or revoked');
  }

  const user = await prisma.stakeholder.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw ApiError.unauthorized();

  const accessToken = signAccessToken({
    sub: user.id,
    nafiId: user.nafiId,
    role: user.role,
    institutionId: user.institutionId ?? undefined,
  });

  return { accessToken, user: toView(user) };
}

export async function logout(refreshToken?: string): Promise<void> {
  if (!refreshToken) return;
  const tokenHash = hashRefreshToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function me(userId: string): Promise<AuthUserView> {
  const user = await prisma.stakeholder.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  return toView(user);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.stakeholder.findUnique({ where: { email } });
  if (!user) return; // don't leak existence

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  // TODO: send email via provider. For now, log the raw token (dev only).
  if (env.isDev) {
    // eslint-disable-next-line no-console
    console.log(`[password-reset] ${email}: /reset-password/${token}`);
  }
}

export async function confirmPasswordReset(token: string, password: string): Promise<void> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw ApiError.badRequest('Reset link is invalid or expired');
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.stakeholder.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
