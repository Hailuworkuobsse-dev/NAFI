import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import prisma from '../config/prisma';

declare module 'express' {
  interface Request {
    user?: TokenPayload & { id: string };
  }
}

/**
 * Middleware to authenticate JWT bearer tokens
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    let payload: TokenPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, role: true },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('User account is deactivated');
    }

    // Attach user to request
    req.user = {
      ...payload,
      id: user.id,
    };

    next();
  } catch (error) {
    next(error);
  }
}
