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

function scheduleNextSync(userId: string): void {
  if (syncTimeout) window.clearTimeout(syncTimeout);

  void (async () => {
    const db = await getDb();
    const all = await db.getAllFromIndex('mutationQueue', 'byUser', userId);
    const pending = all.filter((m) => m.priority >= 0 && m.attempts < MAX_ATTEMPTS);

    if (pending.length === 0) {
      syncTimeout = window.setTimeout(() => void processQueue(userId), 30_000);
      return;
    }

    const maxAttempts = Math.max(...pending.map((m) => m.attempts));
    const backoff = Math.min(BACKOFF_BASE_MS * Math.pow(2, maxAttempts), BACKOFF_MAX_MS);

    syncTimeout = window.setTimeout(() => void processQueue(userId), backoff);
  })();
}

export function startSyncEngine(userId: string): () => void {
  const onOnline = () => void processQueue(userId);

  window.addEventListener('online', onOnline);

  void processQueue(userId);

  const poll = window.setInterval(() => {
    if (navigator.onLine) void processQueue(userId);
  }, 60_000);

  return () => {
    window.removeEventListener('online', onOnline);
    window.clearInterval(poll);
    if (syncTimeout) window.clearTimeout(syncTimeout);
  };
}
