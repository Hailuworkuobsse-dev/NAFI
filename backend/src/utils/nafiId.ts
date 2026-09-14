import { createHash, randomBytes } from 'crypto';

/**
 * Generate a unique NAFI-ID
 */
export function generateNafiId(prefix: string = 'USR'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(4).toString('hex').toUpperCase();
  return `NAFI-${prefix}-${timestamp}-${random}`;
}

/**
 * Generate a contract hash (SHA-256)
 */
export function generateContractHash(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a unique reference ID
 */
export function generateRef(prefix: string = 'REF'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate a hash chain link for audit logs
 */
export function generateAuditHash(previousHash: string | null, data: string): string {
  const combined = previousHash ? `${previousHash}:${data}` : data;
  return createHash('sha256').update(combined).digest('hex');
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}
