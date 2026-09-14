import { Activity, AlertTriangle, FileText, Users } from 'lucide-react';

import { formatNumber } from '@nafi/formatters';
import { DashboardGrid, StatCard } from '@nafi/ui-react';

import { useAuditLog, useContracts, useDisputes, useUsers } from '@/hooks';

export function AdminOverviewPage() {
  const users = useUsers({ pageSize: 1 });
  const contracts = useContracts({ pageSize: 1 });
  const disputes = useDisputes({ pageSize: 1 });
  const audit = useAuditLog({ pageSize: 1 });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Admin Overview</h1>
        <p className="mt-1 text-sm text-neutral-500">Platform-wide health and activity.</p>
      </header>

      <DashboardGrid>
        <StatCard
          label="Users"
          value={formatNumber(users.data?.total ?? 0)}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Contracts"
          value={formatNumber(contracts.data?.total ?? 0)}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Open disputes"
          value={formatNumber(disputes.data?.total ?? 0)}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          label="Audit events (30d)"
          value={formatNumber(audit.data?.total ?? 0)}
          icon={<Activity className="h-5 w-5" />}
        />
      </DashboardGrid>
    </div>
  );
}
