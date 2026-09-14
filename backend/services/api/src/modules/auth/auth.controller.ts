import type { Request, Response } from 'express';

import { loginSchema, registerSchema, type Role } from '@nafi/validators';

import { env } from '@/config/env';
import { ApiError } from '@/utils/ApiError';
import { created, noContent, ok } from '@/utils/apiResponse';

import * as authService from './auth.service';

const REFRESH_COOKIE = 'nafi_refresh';

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'strict' as const,
  path: '/',
  domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);

  const { accessToken, refreshToken, user } = await authService.login({
    ...input,
    ip: req.ip,
    userAgent: req.header('user-agent') ?? undefined,
  });

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);

  ok(res, { accessToken, user });
}

export async function register(req: Request, res: Response): Promise<void> {
  const input = registerSchema.parse(req.body);
  const result = await authService.register({ ...input, role: input.role as Role });
  created(res, result);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('No refresh token');

  const { accessToken, user } = await authService.refresh(token);
  ok(res, { accessToken, user });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE];
  await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined });
  noContent(res);
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const user = await authService.me(req.user.sub);
  ok(res, user);
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string };
  if (!email) throw ApiError.badRequest('Email is required');
  await authService.requestPasswordReset(email);
  ok(res, { sent: true });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) throw ApiError.badRequest('Token and password are required');
  await authService.confirmPasswordReset(token, password);
  ok(res, { reset: true });
}
