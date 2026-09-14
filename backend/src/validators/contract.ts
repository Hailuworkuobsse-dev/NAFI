import { z } from 'zod';

export const contractCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  principalAmount: z.number().positive('Principal amount must be positive'),
  interestRate: z.number().min(0).max(100, 'Interest rate must be between 0 and 100'),
  termMonths: z.number().int().positive('Term must be at least 1 month').max(120),
  borrowerId: z.string().cuid('Invalid borrower ID'),
  institutionId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  maturityDate: z.string().datetime().optional(),
});

export const contractUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  principalAmount: z.number().positive().optional(),
  interestRate: z.number().min(0).max(100).optional(),
  termMonths: z.number().int().positive().max(120).optional(),
  status: z.enum([
    'DRAFT',
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED',
    'ACTIVE',
    'SUSPENDED',
    'COMPLETED',
    'DEFAULTED',
    'CANCELLED',
  ]).optional(),
  startDate: z.string().datetime().optional(),
  maturityDate: z.string().datetime().optional(),
});

export const contractApproveSchema = z.object({
  notes: z.string().max(500).optional(),
});

export const contractRejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(500),
});
