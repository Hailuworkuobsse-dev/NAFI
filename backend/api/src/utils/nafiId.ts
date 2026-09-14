/**
 * Generate a NAFI ID: NAFI-XXXXXXXX (8 uppercase alphanumerics).
 */
export function generateNafiId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `NAFI-${out}`;
}

/**
 * Compute a pseudo on-chain hash for a contract.
 * In production this would be replaced by a real hash of the contract
 * canonical representation, anchored to the KalypsET ledger.
 */
export function generateContractHash(): string {
  const random = Math.random().toString(36).slice(2);
  return `0x${Buffer.from(random + Date.now()).toString('hex').padStart(64, '0').slice(0, 64)}`;
}
