import { z } from 'zod';
import { uuidSchema, positiveDecimalSchema } from './primitives';

export const contractCreateSchema = z.object({
  commercialFarmerId: uuidSchema,
  targetCrop: z.string().min(2).max(100),
  totalTargetYieldKg: positiveDecimalSchema,
  guaranteedFloorPriceEtb: positiveDecimalSchema,
  maturityDate: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
    message: 'Maturity date must be in the future',
  }),
  governmentWitnessId: uuidSchema,
  regionCode: z.string().min(2).max(10),
});
export type ContractCreateInput = z.infer<typeof contractCreateSchema>;

export const contractUpdateSchema = contractCreateSchema.partial();
export type ContractUpdateInput = z.infer<typeof contractUpdateSchema>;

export const contractSignSchema = z.object({
  contractId: uuidSchema,
  role: z.enum(['FARMER', 'BANK', 'GOVERNMENT_WITNESS', 'SUPPLIER', 'OFF_TAKER']),
  signatureHash: z.string().min(32),
  signedAt: z.coerce.date().default(() => new Date()),
});
export type ContractSignInput = z.infer<typeof contractSignSchema>;
