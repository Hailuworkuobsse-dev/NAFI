import { z } from 'zod';
import { currencySchema, positiveDecimalSchema, uuidSchema } from './primitives';

export const investmentCreateSchema = z.object({
  contractId: uuidSchema,
  fundingType: z.enum(['DEBT_FIXED_RETURN', 'EQUITY_PROFIT_SHARE']),
  amountForeignCurrency: positiveDecimalSchema,
  currency: currencySchema.refine((c) => c !== 'ETB', {
    message: 'Diaspora investment must be in foreign currency',
  }),
  agreedReturnRate: z.coerce.number().min(0).max(1),
  sourceOfFunds: z.string().min(10).max(500),
});
export type InvestmentCreateInput = z.infer<typeof investmentCreateSchema>;
