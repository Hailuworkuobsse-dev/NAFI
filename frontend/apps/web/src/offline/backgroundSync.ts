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
