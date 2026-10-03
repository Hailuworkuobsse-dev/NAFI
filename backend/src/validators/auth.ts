import { z } from 'zod';
import { Role } from '../constants/roles';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    // The frontend sends a single `fullName` field; accept either that or
    // explicit firstName/lastName values.
    fullName: z.string().min(2, 'Full name is required').max(100).optional(),
    firstName: z.string().min(1, 'First name is required').max(50).optional(),
    lastName: z.string().min(1, 'Last name is required').max(50).optional(),
    phone: z.string().optional(),
    role: z.nativeEnum(Role).default(Role.DIASPORA_INVESTOR),
    institutionId: z.string().optional(),
    locale: z.string().optional(),
    acceptTerms: z.boolean().optional(),
  })
  .transform((data) => {
    let firstName = data.firstName;
    let lastName = data.lastName;

    if (!firstName && !lastName && data.fullName) {
      const parts = data.fullName.trim().split(/\s+/);
      firstName = parts[0] ?? '';
      lastName = parts.slice(1).join(' ') || '.';
    }

    if (!firstName || !lastName) {
      throw new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: ['fullName'],
          message: 'First name and last name (or full name) are required',
        },
      ]);
    }

    return { ...data, firstName, lastName };
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
