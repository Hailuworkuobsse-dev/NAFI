import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

/**
 * IndexedDB schema for offline-first farmer operations.
 * Stores:
 *  - cachedContracts: snapshot of contracts for offline reads
 *  - cachedInputs: snapshot of inputs
 *  - cachedEscrows: snapshot of escrow balances
 *  - mutationQueue: writes waiting to sync
 *  - syncMeta: last-synced timestamps per resource
 */
interface NafiOfflineDB extends DBSchema {
  cachedContracts: {
    key: string;
    value: { id: string; data: unknown; cachedAt: number; userId: string };
    indexes: { byUser: string; byCachedAt: number };
  };

  cachedInputs: {
    key: string;
    value: { id: string; data: unknown; cachedAt: number; userId: string };
    indexes: { byUser: string };
  };

  cachedEscrows: {
    key: string;
    value: { id: string; data: unknown; cachedAt: number; userId: string };
    indexes: { byUser: string };
  };

  mutationQueue: {
    key: string;
    value: {
      id: string;
      createdAt: number;
      userId: string;
      endpoint: string;
      method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: unknown;
      attempts: number;
      lastError?: string;
      priority: number;
      groupKey?: string;
    };
    indexes: {
      byUser: string;
      byCreatedAt: number;
      byPriority: number;
      byGroupKey: string;
    };
  };

  syncMeta: {
    key: [string, string];
    value: { resource: string; userId: string; lastSyncedAt: number };
    indexes: { byUser: string };
  };
}

const DB_NAME = 'nafi-offline';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<NafiOfflineDB> | null = null;

export async function getDb(): Promise<IDBPDatabase<NafiOfflineDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<NafiOfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('cachedContracts')) {
        const store = db.createObjectStore('cachedContracts', { keyPath: 'id' });
        store.createIndex('byUser', 'userId');
        store.createIndex('byCachedAt', 'cachedAt');
      }
      if (!db.objectStoreNames.contains('cachedInputs')) {
        const store = db.createObjectStore('cachedInputs', { keyPath: 'id' });
        store.createIndex('byUser', 'userId');
      }
      if (!db.objectStoreNames.contains('cachedEscrows')) {
        const store = db.createObjectStore('cachedEscrows', { keyPath: 'id' });
        store.createIndex('byUser', 'userId');
      }
      if (!db.objectStoreNames.contains('mutationQueue')) {
        const store = db.createObjectStore('mutationQueue', { keyPath: 'id' });
        store.createIndex('byUser', 'userId');
        store.createIndex('byCreatedAt', 'createdAt');
        store.createIndex('byPriority', 'priority');
        store.createIndex('byGroupKey', 'groupKey');
      }
      if (!db.objectStoreNames.contains('syncMeta')) {
        const store = db.createObjectStore('syncMeta', { keyPath: ['resource', 'userId'] });
        store.createIndex('byUser', 'userId');
      }
    },
  });

  return dbInstance;
}

/**
 * Clear all offline data (used on logout).
 */
export async function clearOfflineData(userId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(
    ['cachedContracts', 'cachedInputs', 'cachedEscrows', 'mutationQueue', 'syncMeta'],
    'readwrite',
  );

  const stores = [
    tx.objectStore('cachedContracts'),
    tx.objectStore('cachedInputs'),
    tx.objectStore('cachedEscrows'),
    tx.objectStore('mutationQueue'),
    tx.objectStore('syncMeta'),
  ];

  for (const store of stores) {
    // @ts-expect-error — mixed key types
    const idx = store.index('byUser');
    const keys = await idx.getAllKeys(userId);
    for (const key of keys) {
      // @ts-expect-error — mixed key types
      await store.delete(key);
    }
  }

  await tx.done;
}
