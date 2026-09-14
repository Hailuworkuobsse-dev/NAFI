import type { ReactNode } from 'react';

export interface DetailPageLayoutProps {
  title: string;
  subtitle?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
  sidebar?: ReactNode;
}

export function DetailPageLayout({
  title,
  subtitle,
  badge,
  actions,
  tabs,
  children,
  sidebar,
}: DetailPageLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
            {badge}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {subtitle && <div className="text-sm text-neutral-500">{subtitle}</div>}
      </header>

      {tabs}

      <div className={sidebar ? 'grid grid-cols-1 gap-6 lg:grid-cols-3' : ''}>
        <div className={sidebar ? 'lg:col-span-2' : ''}>{children}</div>
        {sidebar && <aside>{sidebar}</aside>}
      </div>
    </div>
  );
}
