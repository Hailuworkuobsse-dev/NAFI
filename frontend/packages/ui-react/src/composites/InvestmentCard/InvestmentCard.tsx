import { formatMoney, formatPercent, formatDate } from '@nafi/formatters';

import { Card, CardBody } from '../../components/Card/Card';
import { Badge } from '../../primitives/Badge/Badge';

export interface InvestmentData {
  id: string;
  contractCrop: string;
  amountForeignCurrency: string;
  currency: string;
  fundingType: 'DEBT_FIXED_RETURN' | 'EQUITY_PROFIT_SHARE';
  agreedReturnRate: string;
  investedAt: string;
}

export function InvestmentCard({ investment }: { investment: InvestmentData }) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">{investment.contractCrop}</h3>
            <p className="text-xs text-neutral-500">
              Invested {formatDate(investment.investedAt)}
            </p>
          </div>
          <Badge
            variant={investment.fundingType === 'DEBT_FIXED_RETURN' ? 'info' : 'brand'}
            size="sm"
          >
            {investment.fundingType === 'DEBT_FIXED_RETURN' ? 'Debt' : 'Equity'}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-neutral-500">Principal</span>
            <p className="font-mono font-medium text-neutral-900">
              {formatMoney(investment.amountForeignCurrency, investment.currency as 'USD')}
            </p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Agreed return</span>
            <p className="font-medium text-neutral-900">
              {formatPercent(Number(investment.agreedReturnRate), 2)}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
