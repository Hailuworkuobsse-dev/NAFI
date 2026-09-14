import { Loader2 } from 'lucide-react';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
} as const;

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(function Spinner(
  { size = 'md', className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <Loader2 className={cn('animate-spin text-brand-500', sizeMap[size])} />
      <span className="sr-only">Loading…</span>
    </div>
  );
});

Spinner.displayName = 'Spinner';
