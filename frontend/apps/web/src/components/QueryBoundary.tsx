import type { ReactNode } from 'react';

import { EmptyState, ErrorState, Skeleton } from '@nafi/ui-react';

export interface QueryBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingFallback?: ReactNode;
  emptyFallback?: ReactNode;
  children: ReactNode;
}

export function QueryBoundary({
  isLoading,
  isError,
  error,
  isEmpty,
  onRetry,
  loadingFallback,
  emptyFallback,
  children,
}: QueryBoundaryProps) {
  if (isLoading) {
    return <>{loadingFallback ?? <Skeleton className="h-40 w-full" />}</>;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return <>{emptyFallback ?? <EmptyState title="Nothing here yet" />}</>;
  }

  return <>{children}</>;
}
