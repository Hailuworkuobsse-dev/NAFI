import { formatDate } from '@nafi/formatters';
import { Badge } from '@nafi/ui-react';

import { DataTable, type Column } from '@/components/DataTable';
import { QueryBoundary } from '@/components/QueryBoundary';
import { useUsers } from '@/hooks';
import type { UserSummary } from '@/api/types/user';

export function AdminUsersPage() {
  const { data, isLoading, isError, error, refetch } = useUsers({ pageSize: 100 });

  const columns: Column<UserSummary>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (r) => (
        <div>
          <p className="font-medium text-neutral-900">{r.fullName}</p>
          <p className="text-xs text-neutral-500">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (r) => (
        <span className="text-xs text-neutral-700">{r.role.replace(/_/g, ' ')}</span>
      ),
      hideBelow: 'sm',
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.isActive ? 'success' : 'danger'} dot>
          {r.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      align: 'right',
      hideBelow: 'md',
      render: (r) => formatDate(r.createdAt),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Users</h1>
        <p className="mt-1 text-sm text-neutral-500">
          All platform users across every role.
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
