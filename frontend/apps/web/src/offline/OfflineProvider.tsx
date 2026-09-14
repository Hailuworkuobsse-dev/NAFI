import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

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

  const refreshStats = useCallback(async () => {
    if (!user) return;
    const stats = await getQueueStats(user.id);
    setPendingCount(stats.pending);
    setFailedCount(stats.failed);
  }, [user]);

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

  useEffect(() => {
    if (!user) return;
    const stop = startSyncEngine(user.id);
    return () => stop();
  }, [user]);

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
