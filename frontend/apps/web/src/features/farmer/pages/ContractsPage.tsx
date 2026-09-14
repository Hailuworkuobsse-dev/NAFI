import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatDate, formatMoney, formatWeight } from '@nafi/formatters';
import { PERMISSIONS } from '@nafi/rbac-core';
import { Button, Can, Card, CardBody, ContractStatusBadge } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';

export function FarmContractsPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({ pageSize: 50 });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">My Contracts</h1>
          <p className="mt-1 text-sm text-neutral-500">
            All production contracts you are part of.
          </p>
        </div>
        <Can I={PERMISSIONS.CONTRACT_CREATE}>
          <Button asChild leadingIcon={<Plus className="h-4 w-4" />}>
            <Link to="/farm/contracts/new">New contract</Link>
          </Button>
        </Can>
      </header>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">You have no contracts yet.</p>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          {data?.items.map((c) => (
            <Link key={c.id} to={`/farm/contracts/${c.id}`}>
              <Card className="transition-shadow hover:shadow-dropdown">
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900">{c.targetCrop}</h3>
                      <p className="text-xs text-neutral-500">
                        {c.region} · Matures {formatDate(c.maturityDate)}
                      </p>
                    </div>
                    <ContractStatusBadge status={c.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-t border-neutral-100 pt-3 text-xs">
                    <div>
                      <span className="text-neutral-500">Target yield</span>
                      <p className="mt-0.5 font-medium text-neutral-900">
                        {formatWeight(c.totalTargetYieldKg)}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Floor price</span>
                      <p className="mt-0.5 font-medium text-neutral-900">
                        {formatMoney(c.guaranteedFloorPriceEtb, 'ETB')}/kg
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Contract value</span>
                      <p className="mt-0.5 font-medium text-neutral-900">
                        {formatMoney(c.contractValueEtb, 'ETB')}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
