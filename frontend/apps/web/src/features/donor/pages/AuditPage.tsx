import { formatDate } from '@nafi/formatters';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useAuditLog } from '@/hooks';
import type { AuditLogEntry } from '@/api/domains/audit';

export function DonorAuditPage() {
  const { data, isLoading, isError, error, refetch } = useAuditLog({ pageSize: 100 });

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'actor',
      header: 'Actor',
      render: (r) => <span className="font-medium text-neutral-900">{r.actorName}</span>,
    },
    { key: 'action', header: 'Action', render: (r) => r.action },
    { key: 'resource', header: 'Resource', render: (r) => r.resource, hideBelow: 'sm' },
    {
      key: 'date',
      header: 'Timestamp',
      align: 'right',
      hideBelow: 'md',
      render: (r) => formatDate(r.createdAt),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Audit Access</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Immutable log of actions on your grant programs.
        </p>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {data && (
          <DataTable columns={columns} rows={data.items} keyExtractor={(r) => r.id} />
        )}
      </QueryBoundary>
    </div>
  );
}
