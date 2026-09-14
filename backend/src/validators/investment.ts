import { z } from 'zod';

export const investmentCreateSchema = z.object({
  contractId: z.string().cuid('Invalid contract ID'),
  amount: z.number().positive('Investment amount must be positive'),
  payoutAddress: z.string().optional(),
});

export const investmentUpdateSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'ACTIVE',
    'PAID_OUT',
    'WRITTEN_OFF',
  ]).optional(),
  confirmedAt: z.string().datetime().optional(),
  payoutAddress: z.string().optional(),
});

export const investmentConfirmSchema = z.object({
  notes: z.string().max(500).optional(),
});
