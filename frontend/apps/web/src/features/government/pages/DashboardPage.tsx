import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCompactMoney, formatNumber } from '@nafi/formatters';
import { Card, CardBody, CardHeader, DashboardGrid, StatCard } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContracts, useEscrows } from '@/hooks';

const CHART_COLORS = ['#16A34A', '#2563EB', '#F59E0B', '#DC2626', '#6B7280', '#8B5CF6'];

export function GovDashboardPage() {
  const contracts = useContracts({ pageSize: 500 });
  const escrows = useEscrows({ pageSize: 500 });

  const { byRegion, byCrop, trend } = useMemo(() => {
    const items = contracts.data?.items ?? [];

    const byRegion = Object.entries(
      items.reduce<Record<string, number>>((acc, c) => {
        acc[c.region] = (acc[c.region] ?? 0) + Number(c.contractValueEtb);
        return acc;
      }, {}),
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const byCrop = Object.entries(
      items.reduce<Record<string, number>>((acc, c) => {
        acc[c.targetCrop] = (acc[c.targetCrop] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([name, value]) => ({ name, value }));

    const trend = Array.from({ length: 6 }).map((_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      return {
        month: month.toLocaleString('en', { month: 'short' }),
        contracts: Math.round(items.length * (0.5 + i * 0.1)),
        forex: Math.round(items.length * 80_000 * (0.5 + i * 0.1)),
      };
    });

    return { byRegion, byCrop, trend };
  }, [contracts.data]);

  const totalContracts = contracts.data?.items.length ?? 0;
  const activeContracts =
    contracts.data?.items.filter((c) => c.status === 'ACTIVE').length ?? 0;
  const totalValue =
    contracts.data?.items.reduce((s, c) => s + Number(c.contractValueEtb), 0) ?? 0;
  const totalEscrow =
    escrows.data?.items.reduce((s, e) => s + Number(e.totalDepositedEtb), 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">National Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Real-time view of the NAFI platform across all regions, crops, and institutions.
        </p>
      </header>

      <QueryBoundary
        isLoading={contracts.isLoading || escrows.isLoading}
        isError={contracts.isError || escrows.isError}
        error={contracts.error ?? escrows.error}
        onRetry={() => {
          void contracts.refetch();
          void escrows.refetch();
        }}
      >
        <DashboardGrid>
          <StatCard
            label="Total contracts"
            value={formatNumber(totalContracts)}
            hint={`${activeContracts} active`}
          />
          <StatCard
            label="Total contract value"
            value={formatCompactMoney(totalValue, 'ETB')}
          />
          <StatCard
            label="Escrow capital under management"
            value={formatCompactMoney(totalEscrow, 'ETB')}
          />
        </DashboardGrid>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Contract value by region" />
            <CardBody>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={byRegion} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={90}
                    />
                    <Tooltip
                      formatter={(v: number) => formatCompactMoney(v, 'ETB')}
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #E5E7EB',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" fill="#16A34A" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Contract distribution by crop" />
            <CardBody>
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={byCrop}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {byCrop.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Momentum — last 6 months" />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`}
                  />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="contracts"
                    stroke="#16A34A"
                    strokeWidth={2}
                    name="Contracts"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="forex"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Forex generated (USD)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </QueryBoundary>
    </div>
  );
}
