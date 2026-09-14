import type { ReactNode } from 'react';

export interface ListPageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function ListPageLayout({
  title,
  description,
  actions,
  filters,
  children,
  footer,
}: ListPageLayoutProps) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>

      {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}

      <div>{children}</div>

      {footer && <div>{footer}</div>}
    </div>
  );
}
