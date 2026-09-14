import { QRCodeSVG } from 'qrcode.react';

import { formatDate, formatWeight } from '@nafi/formatters';

import { Card, CardBody, CardHeader } from '../../components/Card/Card';
import { Badge } from '../../primitives/Badge/Badge';

export interface WarehouseReceiptData {
  id: string;
  quantityKg: string;
  grade: string;
  warehouseName: string;
  issuedAt: string;
  expiresAt: string;
  hasLien: boolean;
}

export interface WarehouseReceiptCardProps {
  receipt: WarehouseReceiptData;
}

export function WarehouseReceiptCard({ receipt }: WarehouseReceiptCardProps) {
  return (
    <Card>
      <CardHeader
        title="Warehouse Receipt"
        description={`ID ${receipt.id.slice(0, 12)}`}
        action={
          <Badge variant={receipt.hasLien ? 'warning' : 'success'} dot>
            {receipt.hasLien ? 'Lien registered' : 'Free'}
          </Badge>
        }
      />
      <CardBody className="flex items-start gap-4">
        <div className="shrink-0 rounded border border-neutral-200 bg-white p-2">
          <QRCodeSVG value={receipt.id} size={88} level="M" />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <span className="text-xs text-neutral-500">Quantity</span>
            <p className="font-medium text-neutral-900">{formatWeight(receipt.quantityKg)}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Grade</span>
            <p className="font-medium text-neutral-900">{receipt.grade}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Warehouse</span>
            <p className="font-medium text-neutral-900">{receipt.warehouseName}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Issued</span>
            <p className="font-medium text-neutral-900">{formatDate(receipt.issuedAt)}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Expires</span>
            <p className="font-medium text-neutral-900">{formatDate(receipt.expiresAt)}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
