import { Landmark, Lock, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatCompactMoney } from '@nafi/formatters';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DashboardGrid,
  StatCard,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';

import { useBankSummary } from '../hooks/useBankSummary';

export function BankOverviewPage() {
  const { summary, escrows, isLoading } = useBankSummary();
  const recent = escrows.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Bank Overview</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Escrow portfolio and lending position.
          </p>
        </div>
      </header>

      <QueryBoundary isLoading={isLoading} isError={false}>
        <DashboardGrid>
          <StatCard
            label="Active escrows"
            value={String(summary.escrowCount)}
            icon={<Landmark className="h-5 w-5" />}
            hint={`${summary.locked} locked · ${summary.frozen} frozen`}
          />
          <StatCard
            label="Total ETB under escrow"
            value={formatCompactMoney(summary.totalEtb, 'ETB')}
            icon={<Lock className="h-5 w-5" />}
          />
          <StatCard
            label="Total USD under escrow"
            value={formatCompactMoney(summary.totalUsd, 'USD')}
            icon={<Unlock className="h-5 w-5" />}
          />
        </DashboardGrid>

        <Card>
          <CardHeader
            title="Recent escrows"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/bank/escrows">View all</Link>
              </Button>
            }
          />
          <CardBody className="p-0">
            <ul className="divide-y divide-neutral-100">
              {recent.map((e) => (
                <li key={e.id}>
                  <Link
                    to={`/bank/escrows/${e.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-neutral-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{e.contractCrop}</p>
                      <p className="text-xs text-neutral-500">
                        Contract {e.contractId.slice(0, 8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm tabular-nums text-neutral-900">
                        {formatCompactMoney(e.totalDepositedEtb, 'ETB')}
                      </p>
                      <p className="text-xs text-neutral-500">{e.status}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </QueryBoundary>
    </div>
  );
}
