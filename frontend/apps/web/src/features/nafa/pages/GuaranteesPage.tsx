import { Link } from 'react-router-dom';

import { formatDate, formatMoney, formatPercent } from '@nafi/formatters';
import { Badge, Button, Card, CardBody, CardHeader } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts } from '@/hooks';

export function NafaGuaranteesPage() {
  const { data, isLoading, isError, error, refetch } = useContracts({ pageSize: 100 });

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Guarantees</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Risk-sharing guarantees issued to banks against agricultural loans.
        </p>
      </header>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
      >
        <div className="flex flex-col gap-4">
          {data?.items.map((c) => (
            <Card key={c.id}>
              <CardHeader
                title={c.targetCrop}
                description={`${c.region} · Matures ${formatDate(c.maturityDate)}`}
                action={
                  <Badge variant="info" dot>
                    Guaranteed
                  </Badge>
                }
              />
              <CardBody className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500">Contract value</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatMoney(c.contractValueEtb, 'ETB')}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Guarantee coverage</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatPercent(0.7, 0)} (70%)
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Guaranteed amount</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatMoney(Number(c.contractValueEtb) * 0.7, 'ETB')}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/nafa/guarantees/${c.id}`}>View guarantee</Link>
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
