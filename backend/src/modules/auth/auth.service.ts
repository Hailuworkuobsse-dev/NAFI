import prisma from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { hashPassword, verifyPassword } from '../../utils/password';
import { generateTokenPair, verifyRefreshToken, TokenPayload } from '../../utils/jwt';
import { generateNafiId, generateSecureToken } from '../../utils/nafiId';
import { Role } from '../../constants/roles';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: Role;
  institutionId?: string;
}

export class AuthService {
  /**
   * Login user with email and password
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        institutionId: true,
        isActive: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Account is deactivated');
    }

    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Update last login and generate tokens (persisting the refresh token as rotation state).
    // The refresh endpoint compares against user.refreshToken, so it MUST be stored here.
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    };

    const tokens = generateTokenPair(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), refreshToken: tokens.refreshToken },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
      ...tokens,
    };
  }

  /**
   * Register a new user
   */
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const nafiId = generateNafiId(input.role?.toString().substring(0, 3) || 'USR');

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        role: input.role || Role.DIASPORA_INVESTOR,
        institutionId: input.institutionId,
        nafiId,
        isVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        institutionId: true,
        nafiId: true,
        isVerified: true,
      },
    });

    // Generate tokens (use the user's actual institutionId, not null)
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId ?? null,
    };

    const tokens = generateTokenPair(tokenPayload);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string) {
    let payload: TokenPayload;
    
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        institutionId: true,
        isActive: true,
        refreshToken: true,
      },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    // Verify refresh token matches stored one
    if (user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const newTokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    };

    const tokens = generateTokenPair(newTokenPayload);

    // Persist rotated refresh token so subsequent refreshes validate against it
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return tokens;
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  /**
   * Get current user profile
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nafiId: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        institutionId: true,
        isVerified: true,
        createdAt: true,
        lastLoginAt: true,
        institution: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    const resetToken = generateSecureToken(32);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // In production, send email with reset token
    // For now, just log it
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}

export const authService = new AuthService();
