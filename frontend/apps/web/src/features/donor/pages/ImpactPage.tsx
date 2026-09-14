import { Coins, Globe2, Sprout, TrendingUp, Users } from 'lucide-react';

import { formatCompactMoney, formatNumber } from '@nafi/formatters';
import { DashboardGrid, StatCard } from '@nafi/ui-react';

export function DonorImpactPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Impact Metrics</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Verifiable impact of donor-funded agricultural programs.
        </p>
      </div>

      <DashboardGrid>
        <StatCard
          label="Diaspora capital mobilized"
          value={formatCompactMoney(12_450_000, 'USD')}
          icon={<Coins className="h-5 w-5" />}
        />
        <StatCard
          label="Hectares under contract"
          value={formatNumber(68_200)}
          icon={<Globe2 className="h-5 w-5" />}
        />
        <StatCard
          label="Farmers reached"
          value={formatNumber(1_840)}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Forex generated"
          value={formatCompactMoney(4_180_000, 'USD')}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Jobs created"
          value={formatNumber(3_210)}
          icon={<Sprout className="h-5 w-5" />}
        />
      </DashboardGrid>
    </div>
  );
}
