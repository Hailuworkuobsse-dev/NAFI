import { getDb } from './db';

export async function cacheContracts<T extends { id: string }>(
  userId: string,
  contracts: readonly T[],
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('cachedContracts', 'readwrite');
  const now = Date.now();

  for (const c of contracts) {
    await tx.store.put({ id: c.id, data: c, cachedAt: now, userId });
  }

  const cutoff = now - 30 * 24 * 60 * 60 * 1000;
  const oldKeys = await tx.store.index('byCachedAt').getAllKeys(IDBKeyRange.upperBound(cutoff));
  for (const key of oldKeys) {
    await tx.store.delete(key);
  }

  await tx.done;
}

export async function readCachedContracts(userId: string): Promise<unknown[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex('cachedContracts', 'byUser', userId);
  return all.map((r) => r.data);
}

export async function cacheInputs<T extends { id: string }>(
  userId: string,
  inputs: readonly T[],
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('cachedInputs', 'readwrite');
  const now = Date.now();
  for (const i of inputs) {
    await tx.store.put({ id: i.id, data: i, cachedAt: now, userId });
  }
  await tx.done;
}

export async function readCachedInputs(userId: string): Promise<unknown[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex('cachedInputs', 'byUser', userId);
  return all.map((r) => r.data);
}

export async function cacheEscrows<T extends { id: string }>(
  userId: string,
  escrows: readonly T[],
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('cachedEscrows', 'readwrite');
  const now = Date.now();
  for (const e of escrows) {
    await tx.store.put({ id: e.id, data: e, cachedAt: now, userId });
  }
  await tx.done;
}

export async function readCachedEscrows(userId: string): Promise<unknown[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex('cachedEscrows', 'byUser', userId);
  return all.map((r) => r.data);
}

export async function setLastSynced(userId: string, resource: string): Promise<void> {
  const db = await getDb();
  await db.put('syncMeta', { userId, resource, lastSyncedAt: Date.now() });
}

export async function getLastSynced(
  userId: string,
  resource: string,
): Promise<number | null> {
  const db = await getDb();
  const row = await db.get('syncMeta', [resource, userId]);
  return row?.lastSyncedAt ?? null;
}
