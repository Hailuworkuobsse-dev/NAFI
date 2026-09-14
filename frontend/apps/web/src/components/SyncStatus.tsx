import { CloudOff, RefreshCw } from 'lucide-react';

import { cn } from '@nafi/ui-react';

import { useOffline } from '@/offline/OfflineProvider';

export function SyncStatus({ className }: { className?: string }) {
  const { isOnline, isSyncing, pendingCount, failedCount } = useOffline();

  if (isOnline && pendingCount === 0 && failedCount === 0) return null;

  const label = !isOnline
    ? `Offline${pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`
    : isSyncing
      ? 'Syncing…'
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
