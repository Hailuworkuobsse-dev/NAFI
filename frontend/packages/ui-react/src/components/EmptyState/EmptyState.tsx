import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-neutral-500">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <div>
        <p className="text-base font-medium text-neutral-900">{title}</p>
        {description && <p className="mt-1 max-w-md text-sm text-neutral-500">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
