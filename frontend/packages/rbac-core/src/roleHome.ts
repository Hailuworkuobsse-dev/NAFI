import type { Role } from './roles';

export const ROLE_HOME: Record<Role, string> = {
  DIASPORA_INVESTOR: '/portfolio',
  COMMERCIAL_BANK: '/bank/overview',
  DBE_OFFICER: '/dbe/portfolio',
  NAFA_OFFICER: '/nafa/guarantees',
  INPUT_SUPPLIER: '/supplier/orders',
  COMMERCIAL_FARMER: '/farm/contracts',
  OFF_TAKER: '/buyer/purchases',
  GOVERNMENT_REGULATOR: '/gov/dashboard',
  DONOR: '/donor/grants',
  NAFI_ADMIN: '/admin/overview',
  COMPLIANCE_OFFICER: '/compliance/queue',
  ARBITRATOR: '/arbitration/cases',
};
