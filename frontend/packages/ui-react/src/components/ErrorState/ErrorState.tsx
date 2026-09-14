import { AlertCircle } from 'lucide-react';

import { Button } from '../../primitives/Button/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  error?: unknown;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  error,
}: ErrorStateProps) {
  const detail =
    message ??
    (error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-md border border-danger/30 bg-danger-light/40 px-6 py-10 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-light text-danger">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div>
        <p className="text-base font-semibold text-neutral-900">{title}</p>
        <p className="mt-1 max-w-md text-sm text-neutral-600">{detail}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
