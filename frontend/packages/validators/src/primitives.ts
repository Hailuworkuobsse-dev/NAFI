import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email().toLowerCase().trim();
export const phoneEthiopiaSchema = z
  .string()
  .regex(/^(\+251|0)[79]\d{8}$/, 'Must be a valid Ethiopian phone number');
export const nafiIdSchema = z.string().regex(/^NAFI-[A-Z0-9]{8}$/, 'Invalid NAFI ID');

export const decimalSchema = z.union([z.number(), z.string()]).refine(
  (v) => {
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) && n >= 0;
  },
  { message: 'Must be a non-negative decimal' },
);

export const positiveDecimalSchema = z.union([z.number(), z.string()]).refine(
  (v) => {
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) && n > 0;
  },
  { message: 'Must be a positive decimal' },
);

export const currencySchema = z.enum(['ETB', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'AED']);
export const roleSchema = z.enum([
  'DIASPORA_INVESTOR',
  'COMMERCIAL_BANK',
  'DBE_OFFICER',
  'NAFA_OFFICER',
  'INPUT_SUPPLIER',
  'COMMERCIAL_FARMER',
  'OFF_TAKER',
  'GOVERNMENT_REGULATOR',
  'DONOR',
  'NAFI_ADMIN',
  'COMPLIANCE_OFFICER',
  'ARBITRATOR',
]);
export const localeSchema = z.enum(['en', 'am', 'om', 'ti']);
