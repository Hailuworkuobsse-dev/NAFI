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
  priority?: number;
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
