import { Badge, type BadgeProps } from '../../primitives/Badge/Badge';

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'FULFILLED' | 'DEFAULTED' | 'DISPUTED';

const statusMap: Record<ContractStatus, { variant: BadgeProps['variant']; label: string }> = {
  DRAFT: { variant: 'default', label: 'Draft' },
  ACTIVE: { variant: 'success', label: 'Active' },
  FULFILLED: { variant: 'brand', label: 'Fulfilled' },
  DEFAULTED: { variant: 'danger', label: 'Defaulted' },
  DISPUTED: { variant: 'warning', label: 'Disputed' },
};

export interface ContractStatusBadgeProps {
  status: ContractStatus;
  size?: BadgeProps['size'];
}

export function ContractStatusBadge({ status, size }: ContractStatusBadgeProps) {
  const cfg = statusMap[status];
  return (
    <Badge variant={cfg.variant} size={size} dot>
      {cfg.label}
    </Badge>
  );
}
