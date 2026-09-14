import { MapPin, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatCompactMoney, formatDate, formatPercent, formatWeight } from '@nafi/formatters';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  InvestmentPoolProgress,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useOpportunities } from '@/hooks';

export function OpportunityBrowserPage() {
  const { data, isLoading, isError, error, refetch } = useOpportunities();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Opportunities</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Live agricultural contracts open for investment.
        </p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.length === 0)}
        emptyFallback={<EmptyState title="No open opportunities right now" />}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((opp) => (
            <Card key={opp.id} className="flex flex-col">
              <CardHeader
                title={opp.targetCrop}
                description={
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {opp.region}
                  </span>
                }
              />
              <CardBody className="flex flex-1 flex-col gap-4">
                <InvestmentPoolProgress
                  targetAmountEtb={opp.targetAmountEtb}
                  committedAmountEtb={opp.committedAmountEtb}
                  investorCount={opp.investorCount}
                />

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500">Target yield</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatWeight(opp.targetYieldKg)}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Floor price</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatCompactMoney(opp.floorPriceEtb, 'ETB')}/kg
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Maturity</span>
                    <p className="mt-0.5 font-medium text-neutral-900">
                      {formatDate(opp.maturityDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Funded</span>
                    <p className="mt-0.5 font-medium text-brand-600">
                      {formatPercent(opp.fundedPercent, 0)}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <Button asChild fullWidth trailingIcon={<TrendingUp className="h-4 w-4" />}>
                    <Link to={`/opportunities/${opp.id}/invest`}>Invest</Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
