import { CloudOff, RefreshCw, Wifi } from 'lucide-react';

import { Button, cn } from '@nafi/ui-react';

import { useOffline } from '@/offline/OfflineProvider';

export function OfflineBanner() {
  const { isOnline, isSyncing, pendingCount, failedCount, triggerSync } = useOffline();

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
              {pendingCount > 0 &&
                ` ${pendingCount} item${pendingCount === 1 ? '' : 's'} saved locally.`}
            </span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>
              Syncing {pendingCount} item{pendingCount === 1 ? '' : 's'}…
            </span>
          </>
        ) : failedCount > 0 ? (
          <>
            <CloudOff className="h-4 w-4" />
            <span>
              {failedCount} item{failedCount === 1 ? '' : 's'} failed to sync.
            </span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            <span>
              {pendingCount} item{pendingCount === 1 ? '' : 's'} waiting to sync.
            </span>
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
