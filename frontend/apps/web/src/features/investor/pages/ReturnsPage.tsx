import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCompactMoney, formatMoney } from '@nafi/formatters';
import { Card, CardBody, CardHeader, DataList } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useMyInvestments } from '@/hooks';

export function InvestorReturnsPage() {
  const { data, isLoading, isError, error, refetch } = useMyInvestments({ pageSize: 500 });

  const { chart, totals } = useMemo(() => {
    const items = data?.items ?? [];
    const chart = items.map((i) => ({
      name: i.contractCrop,
      expected: Number(i.expectedReturnEtb),
      realized: Number(i.realizedReturnEtb ?? 0),
    }));
    const totals = {
      expected: items.reduce((s, i) => s + Number(i.expectedReturnEtb), 0),
      realized: items.reduce((s, i) => s + Number(i.realizedReturnEtb ?? 0), 0),
    };
    return { chart, totals };
  }, [data]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Returns Tracker</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Expected vs. realized returns across your portfolio.
        </p>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Return by investment" />
            <CardBody>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip
                      formatter={(v: number) => formatMoney(v, 'ETB')}
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #E5E7EB',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="expected" fill="#16A34A" radius={[4, 4, 0, 0]} name="Expected" />
                    <Bar dataKey="realized" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Realized" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Summary" />
            <CardBody>
              <DataList
                columns={1}
                items={[
                  { label: 'Expected total', value: formatCompactMoney(totals.expected, 'ETB') },
                  { label: 'Realized total', value: formatCompactMoney(totals.realized, 'ETB') },
                  {
                    label: 'Outstanding',
                    value: formatCompactMoney(totals.expected - totals.realized, 'ETB'),
                  },
                ]}
              />
            </CardBody>
          </Card>
        </div>
      </QueryBoundary>
    </div>
  );
}
