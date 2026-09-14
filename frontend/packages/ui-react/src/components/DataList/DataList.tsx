import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface DataListItem {
  label: string;
  value: ReactNode;
  span?: boolean;
}

export interface DataListProps {
  items: DataListItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}

export function DataList({ items, columns = 2, className }: DataListProps) {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {items.map((item, idx) => (
        <div key={idx} className={cn('flex flex-col gap-0.5', item.span && 'sm:col-span-full')}>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            {item.label}
          </dt>
          <dd className="text-sm text-neutral-900">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
