import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3', className)}>
      {children}
    </div>
  );
}

export function DashboardGridFull({ children, className }: DashboardGridProps) {
  return <div className={cn('col-span-full', className)}>{children}</div>;
}
