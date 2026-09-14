type AnalyticsEvent =
  | { name: 'page_view'; props: { path: string } }
  | { name: 'login'; props: { role: string } }
  | { name: 'logout'; props: Record<string, never> }
  | { name: 'contract_created'; props: { crop: string; region: string } }
  | { name: 'investment_committed'; props: { currency: string; crop: string } }
  | { name: 'delivery_verified'; props: { offline: boolean } }
  | { name: 'settlement_executed'; props: { crop: string } }
  | { name: 'escrow_released'; props: { currency: string } };

const QUEUE_KEY = 'nafi.analytics.queue';
const MAX_QUEUE = 100;

interface QueuedEvent {
  event: AnalyticsEvent;
  ts: number;
}

function loadQueue(): QueuedEvent[] {
  try {
    return JSON.parse(sessionStorage.getItem(QUEUE_KEY) ?? '[]') as QueuedEvent[];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedEvent[]): void {
  try {
    sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE)));
  } catch {
    /* quota exceeded — drop */
  }
}

function isDoNotTrack(): boolean {
  return navigator.doNotTrack === '1';
}

export function track(event: AnalyticsEvent): void {
  if (isDoNotTrack()) return;
  const queue = loadQueue();
  queue.push({ event, ts: Date.now() });
  saveQueue(queue);
  void flush();
}

export async function flush(): Promise<void> {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (!endpoint || !navigator.onLine) return;

  const queue = loadQueue();
  if (queue.length === 0) return;

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: queue }),
      keepalive: true,
    });
    saveQueue([]);
  } catch {
    /* will retry */
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flush());
}
