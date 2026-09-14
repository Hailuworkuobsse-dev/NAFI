import { z } from 'zod';
import { emailSchema, localeSchema, roleSchema } from './primitives';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mfaCode: z.string().length(6).optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  role: roleSchema,
  fullName: z.string().min(2).max(100),
  email: emailSchema,
  phone: z.string().min(9).max(20),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/\d/, 'Must contain a digit'),
  locale: localeSchema.default('en'),
  acceptTerms: z.literal(true),
});
export type RegisterInput = z.infer<typeof registerSchema>;
