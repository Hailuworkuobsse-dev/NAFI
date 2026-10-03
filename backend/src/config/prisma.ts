import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Build the datasource URL from separate POSTGRES_* vars when DATABASE_URL is absent,
// so the server doesn't fail with P1012 (which makes every request return 500).
function resolveDatasourceUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const { POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;
  if (POSTGRES_HOST && POSTGRES_USER && POSTGRES_PASSWORD && POSTGRES_DB) {
    const url = `mysql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?schema=public`;
    process.env.DATABASE_URL = url;
    return url;
  }
  return undefined;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: { db: { url: resolveDatasourceUrl() } },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
