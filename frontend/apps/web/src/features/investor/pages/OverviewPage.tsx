import { ArrowUpRight, Coins, TrendingUp, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { formatCompactMoney, formatPercent } from '@nafi/formatters';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DashboardGrid,
  StatCard,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';

import { InvestmentRow } from '../components/InvestmentRow';
import { useInvestorSummary } from '../hooks/useInvestorSummary';

export function InvestorOverviewPage() {
  const { t } = useTranslation('nav');
  const { summary, investments, isLoading } = useInvestorSummary();

  const recent = investments.slice(0, 5);
  const totalReturnPct =
    summary.totalInvestedEtb > 0
      ? summary.totalExpectedReturnEtb / summary.totalInvestedEtb
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{t('portfolio.overview')}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Your agricultural investment portfolio at a glance.
          </p>
        </div>
        <Button asChild leadingIcon={<TrendingUp className="h-4 w-4" />}>
          <Link to="/opportunities">Browse opportunities</Link>
        </Button>
      </header>

      <QueryBoundary isLoading={isLoading} isError={false}>
        <DashboardGrid>
          <StatCard
            label="Total invested"
            value={formatCompactMoney(summary.totalInvestedEtb, 'ETB')}
            icon={<Coins className="h-5 w-5" />}
            hint={`${summary.investmentCount} investments`}
          />
          <StatCard
            label="Expected return"
            value={formatCompactMoney(summary.totalExpectedReturnEtb, 'ETB')}
            delta={{ value: formatPercent(totalReturnPct, 1), direction: 'up' }}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            label="Realized return"
            value={formatCompactMoney(summary.totalRealizedReturnEtb, 'ETB')}
            icon={<Wallet className="h-5 w-5" />}
            hint={`${summary.activeCount} active`}
          />
        </DashboardGrid>

        <Card>
          <CardHeader
            title="Recent investments"
            action={
              <Button
                asChild
                variant="ghost"
                size="sm"
                trailingIcon={<ArrowUpRight className="h-4 w-4" />}
              >
                <Link to="/portfolio/investments">View all</Link>
              </Button>
            }
          />
          <CardBody className="p-0">
            {recent.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-neutral-500">
                No investments yet. Start by browsing opportunities.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {recent.map((inv) => (
                  <InvestmentRow key={inv.id} investment={inv} />
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </QueryBoundary>
    </div>
  );
}
