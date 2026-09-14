import { HandCoins, TrendingUp, Users } from 'lucide-react';

import { formatCompactMoney, formatNumber } from '@nafi/formatters';
import {
  Card,
  CardBody,
  CardHeader,
  DashboardGrid,
  DataList,
  StatCard,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useReports } from '@/hooks';

export function DonorGrantsPage() {
  const { data, isLoading, isError, error, refetch } = useReports({
    type: 'DONOR_EIB',
    pageSize: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Grants & Programs</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Grants managed by your institution through NAFI.
        </p>
      </header>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <DashboardGrid>
          <StatCard
            label="Active programs"
            value={String(data?.items.length ?? 0)}
            icon={<HandCoins className="h-5 w-5" />}
          />
          <StatCard
            label="Total disbursed"
            value={formatCompactMoney(45_000_000, 'USD')}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            label="Beneficiaries"
            value={formatNumber(12_400)}
            icon={<Users className="h-5 w-5" />}
          />
        </DashboardGrid>

        <Card>
          <CardHeader title="Program details" />
          <CardBody>
            <DataList
              items={[
                { label: 'Facility', value: 'RUFIP III' },
                { label: 'Total commitment', value: formatCompactMoney(110_000_000, 'EUR') },
                {
                  label: 'Technical assistance',
                  value: formatCompactMoney(8_500_000, 'EUR'),
                },
                {
                  label: 'Focus areas',
                  value: 'Rural finance, climate adaptation, women inclusion',
                  span: true,
                },
              ]}
            />
          </CardBody>
        </Card>
      </QueryBoundary>
    </div>
  );
}
