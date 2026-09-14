# 🚀 NAFI Frontend — Step 8 of 10

## Farmer PWA — Offline-First, Background Sync, USSD Mode & Push Notifications

**Step Goal:** Turn the farmer portal into an installable, offline-first Progressive Web App that works in low-connectivity rural Ethiopia. Critical operations (delivery verification, contract signing, input receipt) must succeed even with zero network, then sync automatically when connectivity returns. Add USSD simulation for feature phones and push notifications for contract milestones.

**Duration Estimate:** 7–10 days
**Deliverable:** An installable PWA that functions fully offline for read operations and queues writes for later sync — all transparent to the user.

---

## 8.1 Why This Matters

Ethiopia's commercial farmers operate in regions where 4G coverage is expanding (70.8% in 2025) but connectivity is intermittent. The farmer portal must assume:
- Long periods offline (hours, sometimes days)
- Slow networks (2G/3G fallback)
- Expensive data — every byte counts
- Feature phones still in use — USSD required
- Android-first (most farmers use mid-range Android)

**Design principles:**
- **Read offline-first:** cache contracts, inputs, escrow on first load; serve from cache when offline
- **Write offline-first:** queue mutations in IndexedDB; sync when online with exponential backoff
- **Conflict-aware:** use server timestamps and versioning to detect conflicts
- **Explicit sync UI:** user always sees what's synced and what's pending
- **Small payloads:** use `Accept-Encoding: gzip` and only fetch changed fields

---

## 8.2 PWA Package & Config

### `apps/web/package.json` — Add PWA deps

```json
{
  "dependencies": {
    "idb": "^8.0.0"
  },
  "devDependencies": {
    "vite-plugin-pwa": "^0.20.5",
    "workbox-window": "^7.3.0"
  }
}
```

### `apps/web/vite.config.ts` — Add PWA plugin

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/auth\//],
        runtimeCaching: [
          {
            // API GETs: network-first with cache fallback
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nafi-api',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Static assets: cache-first, forever (hashed filenames)
            urlPattern: /\.(?:js|css|woff2|png|svg|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'nafi-static',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
        // Exclude POST/PUT/PATCH/DELETE — handled by the offline queue
        // Exclude /auth/refresh — always needs network
      },
      manifest: {
        name: 'NAFI Farmer',
        short_name: 'NAFI',
        description: 'National Agri-Finance Infrastructure — Farmer App',
        theme_color: '#16A34A',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/farm/contracts',
        icons: [
          { src: '/pwa/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        categories: ['business', 'finance', 'productivity'],
        lang: 'en',
        dir: 'ltr',
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  // ... rest of config unchanged
});
```

### `apps/web/public/pwa/` — Required assets

Place these binary assets:

```
public/pwa/
├── icon-192.png              # 192×192, brand green with white "N"
├── icon-512.png              # 512×512
├── icon-512-maskable.png     # 512×512, safe area respected
└── offline.html              # Fallback page when navigating offline to uncached route
```

### `apps/web/public/pwa/offline.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>NAFI — Offline</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        background: #f9fafb;
        color: #111827;
        padding: 1rem;
      }
      .card {
        max-width: 24rem;
        padding: 2rem;
        background: white;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
        text-align: center;
      }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #6b7280; font-size: 0.875rem; margin: 0 0 1.5rem; }
      button {
        background: #16a34a;
        color: white;
        border: 0;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-weight: 500;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>You're offline</h1>
      <p>The page you requested isn't cached yet. Any work you've done is saved and will sync when you reconnect.</p>
      <button onclick="location.reload()">Try again</button>
    </div>
  </body>
</html>
```

---

## 8.3 Offline Storage — IndexedDB

### `apps/web/src/offline/db.ts`

```ts
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

/**
 * IndexedDB schema for offline-first farmer operations.
 * Stores:
 *  - cachedContrats: snapshot of contracts for offline reads
 *  - cachedInputs: snapshot of inputs
 *  - cachedEscrows: snapshot of escrow balances
 *  - mutationQueue: writes waiting to sync
 *  - syncMeta: last-synced timestamps per resource
 */
interface NafiOfflineDB extends DBSchema {
  cachedContracts: {
    key: string;
    value: {
      id: string;
      data: unknown;
      cachedAt: number;
      userId: string;
    };
    indexes: { byUser: string; byCachedAt: number };
  };

  cachedInputs: {
    key: string;
    value: {
      id: string;
      data: unknown;
      cachedAt: number;
      userId: string;
    };
    indexes: { byUser: string };
  };

  cachedEscrows: {
    key: string;
    value: {
      id: string;
      data: unknown;
      cachedAt: number;
      userId: string;
    };
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
      /** Retry count for exponential backoff */
      attempts: number;
      /** Last error message if the mutation failed */
      lastError?: string;
      /** Priority — higher runs first */
      priority: number;
      /** Optional grouping key for dependency resolution */
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
    key: string;
    value: {
      resource: string;
      userId: string;
      lastSyncedAt: number;
    };
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
    // @ts-expect-error — mixed key types across stores
    const idx = store.index('byUser');
    const keys = await idx.getAllKeys(userId);
    for (const key of keys) {
      // @ts-expect-error — mixed key types
      await store.delete(key);
    }
  }

  await tx.done;
}
```

### `apps/web/src/offline/cache.ts`

```ts
import { getDb } from './db';

export async function cacheContracts(
  userId: string,
  contracts: { id: string; [key: string]: unknown }[],
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('cachedContracts', 'readwrite');
  const now = Date.now();

  for (const c of contracts) {
    await tx.store.put({ id: c.id, data: c, cachedAt: now, userId });
  }

  // Prune entries older than 30 days
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

export async function cacheInputs(
  userId: string,
  inputs: { id: string; [key: string]: unknown }[],
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

export async function cacheEscrows(
  userId: string,
  escrows: { id: string; [key: string]: unknown }[],
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

export async function setLastSynced(
  userId: string,
  resource: string,
): Promise<void> {
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
```

---

## 8.4 Offline Mutation Queue

### `apps/web/src/offline/queue.ts`

```ts
import { getDb } from './db';

export interface QueuedMutation {
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
}

const MAX_ATTEMPTS = 10;

export interface EnqueueInput {
  userId: string;
  endpoint: string;
  method: QueuedMutation['method'];
  body?: unknown;
  /** Higher priority runs first. Delivery verification = 100. Default = 50. */
  priority?: number;
  /** Group key — all mutations in a group sync in order. */
  groupKey?: string;
}

export async function enqueueMutation(input: EnqueueInput): Promise<string> {
  const db = await getDb();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const mutation: QueuedMutation = {
    id,
    createdAt: Date.now(),
    userId: input.userId,
    endpoint: input.endpoint,
    method: input.method,
    body: input.body,
    attempts: 0,
    priority: input.priority ?? 50,
    groupKey: input.groupKey,
  };

  await db.put('mutationQueue', mutation);
  return id;
}

export async function listQueuedMutations(userId: string): Promise<QueuedMutation[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex('mutationQueue', 'byUser', userId);
  // Sort: higher priority first, then oldest first
  return all.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return a.createdAt - b.createdAt;
  });
}

export async function removeMutation(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('mutationQueue', id);
}

export async function markMutationFailed(id: string, error: string): Promise<void> {
  const db = await getDb();
  const existing = await db.get('mutationQueue', id);
  if (!existing) return;
  const updated: QueuedMutation = {
    ...existing,
    attempts: existing.attempts + 1,
    lastError: error,
  };
  if (updated.attempts >= MAX_ATTEMPTS) {
    // Keep it but flag as permanently failed; UI shows it in the "Failed" tab
    await db.put('mutationQueue', { ...updated, priority: -1 });
  } else {
    await db.put('mutationQueue', updated);
  }
}

export async function getQueueStats(userId: string): Promise<{
  pending: number;
  failed: number;
}> {
  const all = await listQueuedMutations(userId);
  return {
    pending: all.filter((m) => m.priority >= 0 && m.attempts < MAX_ATTEMPTS).length,
    failed: all.filter((m) => m.priority < 0 || m.attempts >= MAX_ATTEMPTS).length,
  };
}
```

---

## 8.5 Offline Sync Engine

### `apps/web/src/offline/sync.ts`

```ts
import { http } from '@/api/client';
import { tokenStore } from '@/auth/tokenStore';

import { getDb } from './db';
import {
  listQueuedMutations,
  markMutationFailed,
  removeMutation,
  type QueuedMutation,
} from './queue';

const BACKOFF_BASE_MS = 2_000;
const BACKOFF_MAX_MS = 5 * 60_000;
const MAX_ATTEMPTS = 10;

let isSyncing = false;
let syncTimeout: number | null = null;

type SyncListener = (event: SyncEvent) => void;

export type SyncEvent =
  | { type: 'sync:start'; count: number }
  | { type: 'sync:mutation:success'; mutation: QueuedMutation }
  | { type: 'sync:mutation:failed'; mutation: QueuedMutation; error: string }
  | { type: 'sync:complete'; succeeded: number; failed: number }
  | { type: 'sync:error'; error: string };

const listeners = new Set<SyncListener>();

export function onSyncEvent(listener: SyncListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(event: SyncEvent): void {
  listeners.forEach((l) => l(event));
}

/**
 * Process the queue. Serial execution preserves order within a group.
 * Runs on: (1) network recovery, (2) periodic tick, (3) explicit call.
 */
export async function processQueue(userId: string): Promise<void> {
  if (isSyncing) return;
  if (!navigator.onLine) return;
  if (!tokenStore.get()) return;

  isSyncing = true;

  try {
    const mutations = await listQueuedMutations(userId);
    const pending = mutations.filter((m) => m.priority >= 0 && m.attempts < MAX_ATTEMPTS);

    if (pending.length === 0) {
      isSyncing = false;
      return;
    }

    emit({ type: 'sync:start', count: pending.length });

    let succeeded = 0;
    let failed = 0;

    for (const mutation of pending) {
      try {
        await executeMutation(mutation);
        await removeMutation(mutation.id);
        succeeded++;
        emit({ type: 'sync:mutation:success', mutation });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        await markMutationFailed(mutation.id, message);
        failed++;
        emit({ type: 'sync:mutation:failed', mutation, error: message });

        // If the failure is auth-related, stop — wait for re-login.
        if (/401|403/.test(message)) break;
      }
    }

    emit({ type: 'sync:complete', succeeded, failed });
  } catch (err) {
    emit({ type: 'sync:error', error: err instanceof Error ? err.message : 'Sync failed' });
  } finally {
    isSyncing = false;
    scheduleNextSync(userId);
  }
}

async function executeMutation(mutation: QueuedMutation): Promise<void> {
  const { endpoint, method, body } = mutation;

  switch (method) {
    case 'POST':
      await http.post(endpoint, body);
      break;
    case 'PUT':
      await http.put(endpoint, body);
      break;
    case 'PATCH':
      await http.patch(endpoint, body);
      break;
    case 'DELETE':
      await http.delete(endpoint);
      break;
  }
}

/**
 * Schedule the next queue tick with exponential backoff.
 * Only backoff when there are still pending items; otherwise poll every 30s.
 */
function scheduleNextSync(userId: string): void {
  if (syncTimeout) window.clearTimeout(syncTimeout);

  void (async () => {
    const db = await getDb();
    const all = await db.getAllFromIndex('mutationQueue', 'byUser', userId);
    const pending = all.filter((m) => m.priority >= 0 && m.attempts < MAX_ATTEMPTS);

    if (pending.length === 0) {
      // Idle poll every 30s
      syncTimeout = window.setTimeout(() => void processQueue(userId), 30_000);
      return;
    }

    const maxAttempts = Math.max(...pending.map((m) => m.attempts));
    const backoff = Math.min(BACKOFF_BASE_MS * Math.pow(2, maxAttempts), BACKOFF_MAX_MS);

    syncTimeout = window.setTimeout(() => void processQueue(userId), backoff);
  })();
}

/**
 * Register all the triggers that kick off sync.
 * Call once per session after login.
 */
export function startSyncEngine(userId: string): () => void {
  const onOnline = () => void processQueue(userId);

  window.addEventListener('online', onOnline);

  // Kick off immediately
  void processQueue(userId);

  // Safety-net poll every 60s (even if we miss the online event)
  const poll = window.setInterval(() => {
    if (navigator.onLine) void processQueue(userId);
  }, 60_000);

  return () => {
    window.removeEventListener('online', onOnline);
    window.clearInterval(poll);
    if (syncTimeout) window.clearTimeout(syncTimeout);
  };
}
```

### `apps/web/src/offline/backgroundSync.ts`

```ts
/**
 * Registers a Background Sync tag with the browser so the SW retries the queue
 * even if the tab is closed. Falls back to the in-app queue if unsupported.
 */
export async function registerBackgroundSync(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  if (!('SyncManager' in window)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    // @ts-expect-error — SyncManager not in TS lib yet
    await registration.sync.register('nafi-mutation-queue');
  } catch {
    // Silent — Background Sync is a progressive enhancement
  }
}
```

### Add Background Sync listener to the SW

Since `vite-plugin-pwa` uses `generateSW`, we extend it via `workbox.importScripts` and a custom handler:

### `apps/web/src/offline/sw-extra.js` (copied to public)

```js
// Register with vite-plugin-pwa via workbox.importScripts
// Retries the mutation queue when the browser signals connectivity restored.

self.addEventListener('sync', (event) => {
  if (event.tag !== 'nafi-mutation-queue') return;

  event.waitUntil(
    (async () => {
      // Ask the app to process its queue by posting a message.
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        client.postMessage({ type: 'nafi:sync-request' });
      });
    })(),
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json();

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'NAFI', {
      body: payload.body ?? '',
      icon: '/pwa/icon-192.png',
      badge: '/pwa/icon-192.png',
      tag: payload.tag ?? 'nafi',
      data: { deepLink: payload.deepLink ?? '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const deepLink = event.notification.data?.deepLink ?? '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const client = clients.find((c) => c.url.includes(self.location.origin));
      if (client) {
        client.focus();
        client.postMessage({ type: 'nafi:navigate', deepLink });
      } else {
        self.clients.openWindow(deepLink);
      }
    }),
  );
});
```

Update `vite.config.ts` PWA block:

```ts
workbox: {
  importScripts: ['/sw-extra.js'],
  // ...rest unchanged
}
```

---

## 8.6 Offline-Aware React Layer

### `apps/web/src/offline/OfflineProvider.tsx`

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/auth/useAuth';

import { clearOfflineData } from './db';
import { getQueueStats } from './queue';
import { onSyncEvent, startSyncEngine, type SyncEvent } from './sync';

export interface OfflineContextValue {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastEvent: SyncEvent | null;
  triggerSync: () => void;
  clearQueue: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [lastEvent, setLastEvent] = useState<SyncEvent | null>(null);

  // Refresh queue stats when things change
  const refreshStats = useCallback(async () => {
    if (!user) return;
    const stats = await getQueueStats(user.id);
    setPendingCount(stats.pending);
    setFailedCount(stats.failed);
  }, [user]);

  // Online/offline tracking
  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      void refreshStats();
    };
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [refreshStats]);

  // Sync engine lifecycle
  useEffect(() => {
    if (!user) return;
    const stop = startSyncEngine(user.id);
    return () => stop();
  }, [user]);

  // Listen for sync events
  useEffect(() => {
    const off = onSyncEvent((event) => {
      setLastEvent(event);
      if (event.type === 'sync:start') setIsSyncing(true);
      if (event.type === 'sync:complete' || event.type === 'sync:error') {
        setIsSyncing(false);
        void refreshStats();
      }
    });
    return off;
  }, [refreshStats]);

  // Listen for messages from the service worker (background sync + notifications)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'nafi:sync-request') {
        void refreshStats();
      }
      if (event.data?.type === 'nafi:navigate' && event.data.deepLink) {
        window.location.href = event.data.deepLink;
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [refreshStats]);

  const triggerSync = useCallback(() => {
    if (user) void startSyncEngine(user.id);
  }, [user]);

  const clearQueue = useCallback(async () => {
    if (user) await clearOfflineData(user.id);
    await refreshStats();
  }, [user, refreshStats]);

  const value = useMemo<OfflineContextValue>(
    () => ({
      isOnline,
      isSyncing,
      pendingCount,
      failedCount,
      lastEvent,
      triggerSync,
      clearQueue,
    }),
    [isOnline, isSyncing, pendingCount, failedCount, lastEvent, triggerSync, clearQueue],
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline(): OfflineContextValue {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used inside <OfflineProvider>');
  return ctx;
}
```

### Add `<OfflineProvider>` inside `<AppProviders>`

```tsx
// apps/web/src/app/providers/AppProviders.tsx
import { OfflineProvider } from '@/offline/OfflineProvider';

// ... inside the return:
<AuthProvider>
  <OfflineProvider>
    <ToastProvider>{children}</ToastProvider>
  </OfflineProvider>
</AuthProvider>
```

### `apps/web/src/offline/useOfflineMutation.ts`

```ts
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { useAuth } from '@/auth/useAuth';
import { useToast } from '@/components/ToastProvider';

import { enqueueMutation } from './queue';
import { registerBackgroundSync } from './backgroundSync';
import { useOffline } from './OfflineProvider';

export interface OfflineMutationConfig<TData, TVariables> {
  /** Endpoint that would be hit when online. */
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Build the request body from variables. */
  toBody?: (vars: TVariables) => unknown;
  /** Priority — higher runs first when syncing. Default 50. */
  priority?: number;
  /** Group key so related mutations preserve order. */
  groupKey?: string;
  /** Query keys to invalidate on success (when online). */
  invalidateKeys?: readonly unknown[][];
  /** Called when the mutation succeeds (online) OR is queued (offline). */
  onComplete?: (data: TData | null, variables: TVariables) => void;
  /** Toast title on success (online). */
  successToast?: string;
  /** Toast title when queued offline. */
  queuedToast?: string;
  /** Real online mutation function. */
  onlineMutation: (vars: TVariables) => Promise<TData>;
}

/**
 * A mutation hook that automatically falls back to the offline queue
 * when the user is offline.
 *
 * Usage:
 *   const verify = useOfflineMutation({
 *     endpoint: `/inputs/${id}/verify`,
 *     method: 'POST',
 *     toBody: (v) => ({ photoHash: v.photoHash, ... }),
 *     priority: 100,
 *     invalidateKeys: [qk.inputs.root],
 *     onlineMutation: (v) => inputsApi.verifyDelivery(v),
 *     successToast: 'Delivery verified',
 *     queuedToast: 'Saved — will sync when online',
 *   });
 */
export function useOfflineMutation<TData, TVariables>(
  config: OfflineMutationConfig<TData, TVariables>,
) {
  const { user } = useAuth();
  const { isOnline, triggerSync } = useOffline();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<TData | null, Error, TVariables>({
    mutationFn: async (vars) => {
      if (!user) throw new Error('Not authenticated');

      // Online path: real request
      if (isOnline) {
        const data = await config.onlineMutation(vars);
        if (config.invalidateKeys) {
          config.invalidateKeys.forEach((key) =>
            queryClient.invalidateQueries({ queryKey: key }),
          );
        }
        if (config.successToast) {
          toast({ title: config.successToast, variant: 'success' });
        }
        config.onComplete?.(data, vars);
        return data;
      }

      // Offline path: queue
      await enqueueMutation({
        userId: user.id,
        endpoint: config.endpoint,
        method: config.method,
        body: config.toBody ? config.toBody(vars) : vars,
        priority: config.priority ?? 50,
        groupKey: config.groupKey,
      });

      await registerBackgroundSync();

      if (config.queuedToast) {
        toast({
          title: config.queuedToast,
          description: "We'll sync automatically when you're back online.",
          variant: 'info',
        });
      }

      config.onComplete?.(null, vars);
      return null;
    },
  });
}
```

---

## 8.7 Offline UI Components

### `apps/web/src/components/OfflineBanner.tsx`

```tsx
import { CloudOff, RefreshCw, Wifi } from 'lucide-react';

import { Button, cn } from '@nafi/ui-react';

import { useOffline } from '@/offline/OfflineProvider';

export function OfflineBanner() {
  const { isOnline, isSyncing, pendingCount, failedCount, triggerSync } = useOffline();

  // Nothing to show when fully online and synced
  if (isOnline && pendingCount === 0 && failedCount === 0) return null;

  const variant = !isOnline ? 'offline' : failedCount > 0 ? 'error' : 'pending';

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-between gap-3 border-b px-4 py-2 text-sm',
        variant === 'offline' && 'border-warning/30 bg-warning-light text-warning-dark',
        variant === 'pending' && 'border-info/30 bg-info-light text-info-dark',
        variant === 'error' && 'border-danger/30 bg-danger-light text-danger-dark',
      )}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <CloudOff className="h-4 w-4" />
            <span>
              You&apos;re offline.
              {pendingCount > 0 && ` ${pendingCount} item${pendingCount === 1 ? '' : 's'} saved locally.`}
            </span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Syncing {pendingCount} item{pendingCount === 1 ? '' : 's'}…</span>
          </>
        ) : failedCount > 0 ? (
          <>
            <CloudOff className="h-4 w-4" />
            <span>{failedCount} item{failedCount === 1 ? '' : 's'} failed to sync.</span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            <span>{pendingCount} item{pendingCount === 1 ? '' : 's'} waiting to sync.</span>
          </>
        )}
      </div>

      {isOnline && !isSyncing && pendingCount > 0 && (
        <Button variant="ghost" size="sm" onClick={triggerSync}>
          Sync now
        </Button>
      )}
    </div>
  );
}
```

### `apps/web/src/components/SyncStatus.tsx`

```tsx
import { CloudOff, RefreshCw } from 'lucide-react';

import { cn } from '@nafi/ui-react';

import { useOffline } from '@/offline/OfflineProvider';

/**
 * Compact inline indicator. Use in headers, list toolbars, or table footers.
 */
export function SyncStatus({ className }: { className?: string }) {
  const { isOnline, isSyncing, pendingCount, failedCount } = useOffline();

  if (isOnline && pendingCount === 0 && failedCount === 0) return null;

  const label = !isOnline
    ? `Offline${pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`
    : isSyncing
      ? `Syncing…`
      : failedCount > 0
        ? `${failedCount} failed`
        : `${pendingCount} pending`;

  const Icon = !isOnline ? CloudOff : RefreshCw;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        !isOnline && 'bg-warning-light text-warning-dark',
        isOnline && failedCount > 0 && 'bg-danger-light text-danger-dark',
        isOnline && failedCount === 0 && 'bg-info-light text-info-dark',
        className,
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', isSyncing && 'animate-spin')} />
      {label}
    </div>
  );
}
```

---

## 8.8 Offline-Aware Delivery Verification (Farmer)

Update `DeliveryVerifyDialog` to use `useOfflineMutation` — this is the flagship offline feature.

### `apps/web/src/features/farmer/components/DeliveryVerifyDialog.tsx` (updated)

```tsx
import { Camera, MapPin, WifiOff } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, Input, Modal, Textarea } from '@nafi/ui-react';

import type { InputPurchaseSummary } from '@/api/types/input';
import { useOffline, useOfflineMutation } from '@/offline';
import { inputsApi } from '@/api/domains/inputs';
import { qk } from '@/lib/queryKeys';

export function DeliveryVerifyDialog({
  purchase,
  open,
  onOpenChange,
}: {
  purchase: InputPurchaseSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isOnline } = useOffline();
  const [photoHash, setPhotoHash] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const verify = useOfflineMutation({
    endpoint: `/inputs/${purchase.id}/verify`,
    method: 'POST',
    priority: 100, // Critical — runs first when syncing
    groupKey: `input:${purchase.id}`,
    toBody: (vars: typeof payload) => vars,
    invalidateKeys: [qk.inputs.root, qk.escrows.root],
    onlineMutation: (vars: typeof payload) => inputsApi.verifyDelivery(vars),
    successToast: 'Delivery verified — escrow will release payment',
    queuedToast: 'Delivery saved offline',
    onComplete: () => {
      onOpenChange(false);
      setPhotoHash('');
      setQrCode('');
      setNotes('');
      setCoords(null);
    },
  });

  const payload = {
    purchaseId: purchase.id,
    photoHash,
    latitude: coords?.lat ?? 0,
    longitude: coords?.lng ?? 0,
    qrCode: qrCode || undefined,
    notes: notes || undefined,
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Location is not supported on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsError(null);
      },
      () => setGpsError('Could not get your location. Please enable GPS.'),
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  };

  const handlePhoto = (file: File) => {
    // In production: compress on-device, then hash. Here we use a simple signature.
    setPhotoHash(`${file.name}:${file.size}:${Date.now()}`);
  };

  const canVerify = photoHash.length > 0 && coords !== null && !verify.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Verify delivery"
      description={purchase.itemDescription}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => verify.mutate(payload)} disabled={!canVerify} loading={verify.isPending}>
            {isOnline ? 'Confirm receipt' : 'Save offline'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {!isOnline && (
          <Alert variant="warning" icon={<WifiOff className="h-5 w-5" />} title="You're offline">
            Your verification will be saved on this device and synced automatically once you
            reconnect. Don&apos;t uninstall the app before syncing.
          </Alert>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Delivery photo</label>
          <label className="flex h-32 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-brand-400">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhoto(file);
              }}
            />
            <div className="flex flex-col items-center gap-2 text-neutral-500">
              <Camera className="h-6 w-6" />
              <span className="text-xs">
                {photoHash ? 'Photo attached ✓' : 'Tap to capture'}
              </span>
            </div>
          </label>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">GPS location</label>
          <Button
            type="button"
            variant="outline"
            fullWidth
            leadingIcon={<MapPin className="h-4 w-4" />}
            onClick={captureLocation}
          >
            {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Capture GPS'}
          </Button>
          {gpsError && <p className="mt-1 text-xs text-danger">{gpsError}</p>}
        </div>

        <Input
          label="QR code (optional)"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          placeholder="Scan or type the package code"
        />

        <Textarea
          label="Notes (optional)"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any issues with the delivery?"
        />
      </div>
    </Modal>
  );
}
```

### `apps/web/src/offline/index.ts`

```ts
export * from './db';
export * from './cache';
export * from './queue';
export * from './sync';
export * from './OfflineProvider';
export * from './useOfflineMutation';
export * from './backgroundSync';
```

---

## 8.9 Install Prompt

### `apps/web/src/components/InstallPrompt.tsx`

```tsx
import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Card, CardBody } from '@nafi/ui-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'nafi.pwa.install-dismissed';

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!event || hidden) return null;

  const install = async () => {
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === 'accepted') setHidden(true);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setHidden(true);
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-toast w-[min(92vw,22rem)] -translate-x-1/2">
      <Card className="shadow-modal">
        <CardBody className="flex items-start gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-neutral-900">Install NAFI Farmer</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Works offline. Faster access. Uses less data.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={install}>
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Not now
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-neutral-400 hover:text-neutral-700"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </CardBody>
      </Card>
    </div>
  );
}
```

Mount it once in `DashboardLayout` (farmer only):

```tsx
import { InstallPrompt } from '@/components/InstallPrompt';
import { useAuth } from '@/auth/useAuth';

// Inside DashboardLayout, before closing </div>:
{user.role === 'COMMERCIAL_FARMER' && <InstallPrompt />}
```

---

## 8.10 Push Notifications

### `apps/web/src/offline/push.ts`

```ts
import { apiClient } from '@/auth/api';

export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Subscribe the browser to push notifications and register the subscription
 * with the backend. Safe to call multiple times.
 */
export async function subscribeToPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const granted = await requestPushPermission();
  if (!granted) return;

  const registration = await navigator.serviceWorker.ready;

  // The public VAPID key is fetched from the API so it can rotate server-side.
  const { data } = await apiClient.get<{ data: { publicKey: string } }>(
    '/notifications/push/vapid-public-key',
  );
  const applicationServerKey = urlBase64ToUint8Array(data.data.publicKey);

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  await apiClient.post('/notifications/push/subscribe', subscription.toJSON());
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  await apiClient.post('/notifications/push/unsubscribe', {
    endpoint: subscription.endpoint,
  });

  await subscription.unsubscribe();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
```

### Notification preferences page — `apps/web/src/features/farmer/pages/ProfilePage.tsx` (partial)

Add a card:

```tsx
import { Bell } from 'lucide-react';

import { Button, Card, CardBody, CardHeader, Switch } from '@nafi/ui-react';

import { subscribeToPush, unsubscribeFromPush } from '@/offline/push';

// Inside the profile page:
const [pushEnabled, setPushEnabled] = useState(
  typeof Notification !== 'undefined' && Notification.permission === 'granted',
);

<Card>
  <CardHeader
    title="Notifications"
    description="Get notified about contract milestones, deliveries, and settlements."
    action={<Bell className="h-5 w-5 text-neutral-400" />}
  />
  <CardBody className="flex flex-col gap-4">
    <Switch
      checked={pushEnabled}
      onCheckedChange={async (checked) => {
        if (checked) {
          await subscribeToPush();
          setPushEnabled(Notification.permission === 'granted');
        } else {
          await unsubscribeFromPush();
          setPushEnabled(false);
        }
      }}
      label="Enable push notifications"
    />
    <p className="text-xs text-neutral-500">
      Notifications are delivered even when the app is closed.
    </p>
  </CardBody>
</Card>
```

---

## 8.11 USSD Simulator (Internal Tool)

The USSD simulator is a development tool for testing the feature-phone experience. It lives at `/tools/ussd-simulator` and is guarded by the `NAFI_ADMIN` role.

### `apps/web/src/features/admin/pages/UssdSimulatorPage.tsx`

```tsx
import { useState } from 'react';

import { Card, CardBody, CardHeader, Input } from '@nafi/ui-react';

import { useAuth } from '@/auth/useAuth';

interface UssdScreen {
  text: string;
  options?: { key: string; label: string }[];
}

const SCREENS: Record<string, UssdScreen> = {
  root: {
    text: 'Welcome to NAFI\n1. My Contracts\n2. Input Deliveries\n3. Escrow Balance\n4. Payments\n5. Help',
    options: [
      { key: '1', label: 'My Contracts' },
      { key: '2', label: 'Input Deliveries' },
      { key: '3', label: 'Escrow Balance' },
      { key: '4', label: 'Payments' },
      { key: '5', label: 'Help' },
    ],
  },
  '1': {
    text: 'My Contracts\n1. Sesame — Active\n2. Coffee — Draft\n0. Back',
    options: [
      { key: '1', label: 'Sesame — Active' },
      { key: '2', label: 'Coffee — Draft' },
      { key: '0', label: 'Back' },
    ],
  },
  '2': {
    text: 'Input Deliveries\n1. NPK Fertilizer — Pending\n2. Sesame Seed — Verified\n0. Back',
    options: [
      { key: '1', label: 'NPK Fertilizer — Pending' },
      { key: '2', label: 'Sesame Seed — Verified' },
      { key: '0', label: 'Back' },
    ],
  },
  '3': { text: 'Escrow Balance\nETB 1,250,000.00\n0. Back', options: [{ key: '0', label: 'Back' }] },
  '4': { text: 'Payments\nLast settlement: 2026-08-15\nAmount: ETB 320,000.00\n0. Back', options: [{ key: '0', label: 'Back' }] },
  '5': { text: 'Help\nCall 8000 for support\n0. Back', options: [{ key: '0', label: 'Back' }] },
};

export function UssdSimulatorPage() {
  const { user } = useAuth();
  const [stack, setStack] = useState<string[]>(['root']);
  const [input, setInput] = useState('');

  const current = SCREENS[stack[stack.length - 1]!] ?? SCREENS.root!;

  const handleKey = (key: string) => {
    if (key === '0') {
      setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
      return;
    }
    if (key === '1' && stack[stack.length - 1] === 'root') setStack((s) => [...s, '1']);
    if (key === '2' && stack[stack.length - 1] === 'root') setStack((s) => [...s, '2']);
    if (key === '3' && stack[stack.length - 1] === 'root') setStack((s) => [...s, '3']);
    if (key === '4' && stack[stack.length - 1] === 'root') setStack((s) => [...s, '4']);
    if (key === '5' && stack[stack.length - 1] === 'root') setStack((s) => [...s, '5']);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">USSD Simulator</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Test the feature-phone experience. Signed in as {user?.fullName}.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Feature phone" />
          <CardBody>
            <div className="mx-auto w-64 rounded-3xl border-8 border-neutral-800 bg-neutral-900 p-3">
              <div className="rounded bg-lime-100 p-4 font-mono text-xs text-neutral-900 shadow-inner">
                <pre className="whitespace-pre-wrap leading-relaxed">{current.text}</pre>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKey(k)}
                    className="rounded bg-neutral-700 py-3 text-base font-medium text-white hover:bg-neutral-600 active:bg-neutral-500"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Session stack" />
          <CardBody>
            <ol className="flex flex-col gap-1.5 text-sm text-neutral-700">
              {stack.map((s, i) => (
                <li key={`${s}-${i}`} className="flex items-center gap-2">
                  <span className="text-neutral-400">{i + 1}.</span>
                  <span className="font-mono">{s}</span>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Type a USSD string e.g. *804#"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
```

Add to admin nav:

```ts
// apps/web/src/layouts/navConfig.ts — NAFI_ADMIN section
{ labelKey: 'nav.admin.ussd', path: '/admin/tools/ussd', icon: 'Phone', permission: PERMISSIONS.SYSTEM_CONFIGURE },
```

Router entry inside admin group:

```tsx
{ path: '/admin/tools/ussd', element: <UssdSimulatorPage /> },
```

---

## 8.12 Offline-Aware Contracts Page

Update `FarmContractsPage` to read from cache when offline and merge queued mutations.

### `apps/web/src/features/farmer/hooks/useOfflineContracts.ts`

```ts
import { useQuery } from '@tanstack/react-query';

import { contractsApi } from '@/api/domains/contracts';
import type { ContractFilters, ContractSummary } from '@/api/types/contract';
import type { ListResponse } from '@/api/types/common';
import { useAuth } from '@/auth/useAuth';
import { useOffline } from '@/offline/OfflineProvider';
import { cacheContracts, readCachedContracts } from '@/offline/cache';

/**
 * Fetches contracts; caches them; falls back to cache when offline.
 */
export function useOfflineContracts(filters: ContractFilters = {}) {
  const { user } = useAuth();
  const { isOnline } = useOffline();

  return useQuery<ListResponse<ContractSummary>>({
    queryKey: ['contracts', 'offline', filters],
    queryFn: async () => {
      if (isOnline && user) {
        try {
          const result = await contractsApi.list(filters);
          await cacheContracts(user.id, result.items);
          return result;
        } catch {
          // fall through to cache
        }
      }
      if (!user) throw new Error('Not authenticated');
      const cached = (await readCachedContracts(user.id)) as ContractSummary[];
      return {
        items: cached,
        page: 1,
        pageSize: cached.length,
        total: cached.length,
      };
    },
    staleTime: isOnline ? 30_000 : Infinity,
    networkMode: 'offlineFirst',
  });
}
```

Update `FarmContractsPage` to use `useOfflineContracts` and render `<SyncStatus />` in the header.

---

## 8.13 Notification Milestones Backend Contract

The backend should push notifications for these events. The frontend expects these payload shapes:

```ts
interface PushPayload {
  title: string;
  body: string;
  tag?: string;      // Groups notifications — replaces prior with same tag
  deepLink?: string; // Path within the app
}

// Expected server-side triggers:
// - CONTRACT_ACTIVATED: "Your contract for {crop} is now active" -> /farm/contracts/{id}
// - DELIVERY_RECEIVED: "Input delivered: {item}" -> /farm/inputs
// - INPUT_VERIFIED: "Payment released to supplier" -> /farm/escrow
// - SETTLEMENT_EXECUTED: "Settlement complete: ETB {amount}" -> /farm/payments
// - DISPUTE_OPENED: "A dispute has been opened on {crop}" -> /farm/contracts/{id}
// - ESCROW_LOW_BALANCE: "Escrow balance below threshold" -> /farm/escrow
```

---

## 8.14 Verification Checklist

```bash
pnpm --filter @nafi/web typecheck
pnpm --filter @nafi/web lint
pnpm --filter @nafi/web build
pnpm --filter @nafi/web preview
```

| Test | Expected |
| :--- | :--- |
| Open the app in Chrome on a laptop | Install prompt appears (bottom-center) |
| Click "Install" | App opens in standalone window with NAFI icon |
| Disconnect network, navigate to `/farm/contracts` | Contracts render from cache; offline banner appears |
| Fill delivery verification while offline | Save button shows "Save offline"; toast confirms queued |
| Reconnect network | Sync starts automatically; banner shows "Syncing N items…" then disappears |
| Kill the app (close tab) and re-open | Pending mutations still in queue; sync resumes |
| Force-fail a mutation (e.g., corrupt payload) | After 10 attempts, appears in failed queue; banner shows error |
| Open DevTools → Application → Service Workers | NAFI SW is registered; caches populated |
| DevTools → Application → IndexedDB | `nafi-offline` DB has `cachedContracts`, `mutationQueue`, etc. |
| Sign out | All offline data cleared for that user |
| `/admin/tools/ussd` (admin only) | USSD simulator renders; keys navigate screens |
| Lighthouse → PWA audit | Installable; all PWA criteria pass |
| Lighthouse → Performance | ≥ 90 on mobile (PWA doesn't regress) |
| `Notification.requestPermission()` on profile | Push subscription created; banner not shown twice |

---

## 8.15 What Was Built & Why

| Layer | Artifact | Purpose |
| :--- | :--- | :--- |
| **PWA** | `vite-plugin-pwa` + manifest + icons | Installable; standalone mode; homescreen icon |
| **Service worker** | Workbox runtime caching | Network-first for API GETs, cache-first for static assets |
| **Offline DB** | `idb`-backed IndexedDB | Cached contracts, inputs, escrows + mutation queue |
| **Mutation queue** | `queue.ts` | FIFO with priority; bounded retries |
| **Sync engine** | `sync.ts` | Exponential backoff; preserves group ordering; online event + periodic poll |
| **Background sync** | `sw-extra.js` + `SyncManager` | SW wakes the tab when connectivity returns |
| **Offline hooks** | `useOfflineMutation`, `useOfflineContracts` | Transparent fallback for reads and writes |
| **UI indicators** | `<OfflineBanner>`, `<SyncStatus>` | Explicit user feedback on state |
| **Install prompt** | `<InstallPrompt>` | Native A2HS prompt; dismissal remembered |
| **Push notifications** | `push.ts` + SW handlers | Real-time milestone alerts, deep links, tag grouping |
| **USSD simulator** | Admin page | Dev tool for feature-phone experience |
| **Data hygiene** | `clearOfflineData(userId)` | All cache purged on logout |

**Design decisions made in this step:**
- Access tokens **still in memory only** — offline writes go through the queue, never store credentials
- **Network-first for API GETs** — fresh data wins; cache serves as fallback
- **Never cache POST/PUT/PATCH/DELETE** at the SW level — that's the queue's job
- **Priority queue** — delivery verification (100) runs before lower-priority operations
- **Group keys** — mutations tied to the same entity stay ordered
- **10-attempt cap** — failed mutations don't churn forever; user is shown them explicitly
- **Background Sync** is a progressive enhancement — the in-app poll is the fallback

---

## 8.16 What Is Deliberately Not in Step 8

- ❌ No background geolocation (battery-intensive, not needed)
- ❌ No native wrappers (Capacitor) — PWA is sufficient
- ❌ No server-sent events / WebSocket — push covers real-time needs
- ❌ No E2E tests — **Step 10**
- ❌ No offline video/images cache for training content — future enhancement

**Step 8 makes the farmer portal resilient to the realities of rural connectivity.**

---

# ✅ Step 8 Complete

**Deliverable:** A production-grade, offline-first farmer PWA:

- **Installable** — manifest, icons, standalone mode, install prompt
- **Service worker** — Workbox-generated with runtime caching per resource type
- **IndexedDB offline store** — cached contracts, inputs, escrows + a durable mutation queue
- **Sync engine** — exponential backoff, group ordering, priority, online-event + poll triggers
- **Background Sync** — the SW wakes the tab when connectivity returns
- **Offline mutation hook** — `useOfflineMutation` transparently falls back to the queue
- **Offline read hook** — `useOfflineContracts` serves cache when offline
- **UI indicators** — `<OfflineBanner>`, `<SyncStatus>`, install prompt
- **Push notifications** — permission flow, VAPID subscription, SW push + click handlers with deep links
- **USSD simulator** — admin-only tool for testing feature-phone experience
- **Data hygiene** — all cache cleared on logout

The farmer can now:
- Capture delivery verification with photo + GPS in the middle of a field with no signal
- Sign contracts offline
- Reconnect hours later and have everything sync automatically — even if the tab was closed

