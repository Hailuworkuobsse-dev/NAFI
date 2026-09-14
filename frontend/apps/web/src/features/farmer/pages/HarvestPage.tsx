import { useMemo } from 'react';

import { formatDate, formatWeight } from '@nafi/formatters';
import { Card, CardBody, CardHeader, DataList } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';

export function FarmHarvestPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({ pageSize: 50 });

  const active = useMemo(
    () => (data?.items ?? []).filter((c) => c.status === 'ACTIVE'),
    [data],
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Harvest</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Log your harvest against each active contract.
        </p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={active.length === 0}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">No active contracts to harvest.</p>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {active.map((c) => (
            <Card key={c.id}>
              <CardHeader
                title={c.targetCrop}
                description={`Matures ${formatDate(c.maturityDate)}`}
              />
              <CardBody>
                <DataList
                  items={[
                    { label: 'Target yield', value: formatWeight(c.totalTargetYieldKg) },
                    { label: 'Region', value: c.region },
                  ]}
                />
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
