import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { formatMoney, formatWeight } from '@nafi/formatters';

import { Card, CardBody } from '../../components/Card/Card';
import {
  ContractStatusBadge,
  type ContractStatus,
} from '../ContractStatusBadge/ContractStatusBadge';

export interface ContractCardData {
  id: string;
  targetCrop: string;
  region: string;
  farmerName: string;
  totalTargetYieldKg: string;
  guaranteedFloorPriceEtb: string;
  status: ContractStatus;
  maturityDate: string;
}

export interface ContractCardProps {
  contract: ContractCardData;
  href?: string;
}

export function ContractCard({ contract, href }: ContractCardProps) {
  const total = (
    Number(contract.totalTargetYieldKg) * Number(contract.guaranteedFloorPriceEtb)
  ).toFixed(2);

  const inner = (
    <Card className="transition-shadow hover:shadow-dropdown">
      <CardBody className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-neutral-900">
              {contract.targetCrop}
            </h3>
            <ContractStatusBadge status={contract.status} size="sm" />
          </div>
          <p className="mt-0.5 truncate text-sm text-neutral-500">
            {contract.farmerName} · {contract.region}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <span className="text-neutral-500">Target yield</span>
              <p className="mt-0.5 font-medium text-neutral-900">
                {formatWeight(contract.totalTargetYieldKg)}
              </p>
            </div>
            <div>
              <span className="text-neutral-500">Floor price</span>
              <p className="mt-0.5 font-medium text-neutral-900">
                {formatMoney(contract.guaranteedFloorPriceEtb, 'ETB')}/kg
              </p>
            </div>
            <div>
              <span className="text-neutral-500">Contract value</span>
              <p className="mt-0.5 font-medium text-neutral-900">{formatMoney(total, 'ETB')}</p>
            </div>
            <div>
              <span className="text-neutral-500">Maturity</span>
              <p className="mt-0.5 font-medium text-neutral-900">
                {new Date(contract.maturityDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        {href && <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />}
      </CardBody>
    </Card>
  );

  return href ? <Link to={href}>{inner}</Link> : inner;
}
