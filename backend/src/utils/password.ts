import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Check if a hash needs rehashing (due to salt rounds change)
 */
export function needsRehash(hash: string): boolean {
  const [_, saltRounds] = hash.split("$");
  return parseInt(saltRounds, 10) !== SALT_ROUNDS;
}
