import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

import { formatMoney } from '@nafi/formatters';

export interface SettlementDistribution {
  recipient: string;
  role: string;
  payoutAmountEtb: string;
}

export interface SettlementWaterfallChartProps {
  distributions: SettlementDistribution[];
}

const ROLE_COLORS: Record<string, string> = {
  DIASPORA_INVESTOR: '#16A34A',
  INPUT_SUPPLIER: '#6B7280',
  COMMERCIAL_BANK: '#2563EB',
  DBE_OFFICER: '#F59E0B',
  NAFA_OFFICER: '#F59E0B',
  COMMERCIAL_FARMER: '#15803D',
};

export function SettlementWaterfallChart({ distributions }: SettlementWaterfallChartProps) {
  const data = distributions.map((d) => ({
    name: d.recipient,
    role: d.role,
    amount: Number(d.payoutAmountEtb),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 40, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            angle={-25}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickFormatter={(v) => formatMoney(v, 'ETB', 'en-ET').replace('Br', '')}
          />
          <Tooltip
            formatter={(value: number) => formatMoney(value, 'ETB')}
            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={ROLE_COLORS[entry.role] ?? '#16A34A'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
