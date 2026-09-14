import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  delta?: { value: string; direction: 'up' | 'down' };
  icon?: ReactNode;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, delta, icon, hint, className }: StatCardProps) {
  return (
    <div className={cn('rounded-md border border-neutral-200 bg-white p-5 shadow-card', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
            {icon}
          </div>
        )}
      </div>

      {delta && (
        <div
          className={cn(
            'mt-3 inline-flex items-center gap-1 text-xs font-medium',
            delta.direction === 'up' ? 'text-success' : 'text-danger',
          )}
        >
          {delta.direction === 'up' ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {delta.value}
        </div>
      )}
    </div>
  );
}
