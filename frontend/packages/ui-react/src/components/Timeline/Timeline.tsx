import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface TimelineItem {
  id: string;
  title: string;
  description?: ReactNode;
  timestamp?: string;
  status: 'complete' | 'active' | 'pending' | 'failed';
  icon?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const dotStyles = {
  complete: 'bg-success text-white',
  active: 'bg-brand-500 text-white ring-4 ring-brand-100',
  pending: 'bg-neutral-200 text-neutral-500',
  failed: 'bg-danger text-white',
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn('flex flex-col gap-4', className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  dotStyles[item.status],
                )}
              >
                {item.status === 'complete' ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  item.icon ?? idx + 1
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-px flex-1',
                    item.status === 'complete' ? 'bg-success/40' : 'bg-neutral-200',
                  )}
                />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-neutral-900">{item.title}</p>
                {item.timestamp && (
                  <span className="text-xs text-neutral-500">{item.timestamp}</span>
                )}
              </div>
              {item.description && (
                <div className="mt-1 text-sm text-neutral-600">{item.description}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
