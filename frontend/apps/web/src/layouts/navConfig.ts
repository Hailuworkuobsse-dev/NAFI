import { PERMISSIONS, type Permission, type Role } from '@nafi/rbac-core';

export interface NavItem {
  labelKey: string;
  path: string;
  icon: string;
  permission: Permission;
  scope?: string;
}

export interface NavSection {
  labelKey: string;
  items: NavItem[];
}

export const NAV_BY_ROLE: Record<Role, NavSection[]> = {
  DIASPORA_INVESTOR: [
    {
      labelKey: 'nav.portfolio.title',
      items: [
        { labelKey: 'nav.portfolio.overview', path: '/portfolio', icon: 'LayoutDashboard', permission: PERMISSIONS.INVESTMENT_READ_OWN },
        { labelKey: 'nav.portfolio.investments', path: '/portfolio/investments', icon: 'TrendingUp', permission: PERMISSIONS.INVESTMENT_READ_OWN },
        { labelKey: 'nav.portfolio.bonds', path: '/portfolio/bonds', icon: 'Certificate', permission: PERMISSIONS.INVESTMENT_READ_OWN },
        { labelKey: 'nav.portfolio.returns', path: '/portfolio/returns', icon: 'Coins', permission: PERMISSIONS.INVESTMENT_READ_OWN },
        { labelKey: 'nav.portfolio.statements', path: '/portfolio/statements', icon: 'FileText', permission: PERMISSIONS.REPORT_READ_OWN },
      ],
    },
    {
      labelKey: 'nav.opportunities.title',
      items: [
        { labelKey: 'nav.opportunities.browse', path: '/opportunities', icon: 'Search', permission: PERMISSIONS.CONTRACT_READ_OWN },
      ],
    },
  ],

  COMMERCIAL_BANK: [
    {
      labelKey: 'nav.bank.title',
      items: [
        { labelKey: 'nav.bank.overview', path: '/bank/overview', icon: 'LayoutDashboard', permission: PERMISSIONS.ESCROW_READ_OWN },
        { labelKey: 'nav.bank.escrows', path: '/bank/escrows', icon: 'Lock', permission: PERMISSIONS.ESCROW_READ_OWN },
        { labelKey: 'nav.bank.loans', path: '/bank/loans', icon: 'Banknote', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.bank.collateral', path: '/bank/collateral', icon: 'Shield', permission: PERMISSIONS.COLLATERAL_REGISTER },
        { labelKey: 'nav.bank.settlements', path: '/bank/settlements', icon: 'ArrowLeftRight', permission: PERMISSIONS.SETTLEMENT_READ },
        { labelKey: 'nav.bank.npl', path: '/bank/npl', icon: 'AlertTriangle', permission: PERMISSIONS.REPORT_GENERATE },
      ],
    },
  ],

  DBE_OFFICER: [
    {
      labelKey: 'nav.bank.title',
      items: [
        { labelKey: 'nav.bank.overview', path: '/dbe/portfolio', icon: 'LayoutDashboard', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.bank.loans', path: '/dbe/co-financing', icon: 'HandCoins', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.bank.settlements', path: '/dbe/on-lending', icon: 'ArrowLeftRight', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.bank.collateral', path: '/dbe/ta-tracking', icon: 'GraduationCap', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.bank.npl', path: '/dbe/reports', icon: 'FileText', permission: PERMISSIONS.REPORT_GENERATE },
      ],
    },
  ],

  NAFA_OFFICER: [
    {
      labelKey: 'nav.bank.title',
      items: [
        { labelKey: 'nav.bank.escrows', path: '/nafa/guarantees', icon: 'ShieldCheck', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.bank.settlements', path: '/nafa/claims', icon: 'ClipboardList', permission: PERMISSIONS.SETTLEMENT_READ },
        { labelKey: 'nav.bank.overview', path: '/nafa/risk-sharing', icon: 'PieChart', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.bank.loans', path: '/nafa/refinancing', icon: 'RefreshCw', permission: PERMISSIONS.CONTRACT_APPROVE },
        { labelKey: 'nav.bank.npl', path: '/nafa/reports', icon: 'FileText', permission: PERMISSIONS.REPORT_GENERATE },
      ],
    },
  ],

  INPUT_SUPPLIER: [
    {
      labelKey: 'nav.farm.title',
      items: [
        { labelKey: 'nav.farm.inputs', path: '/supplier/orders', icon: 'Package', permission: PERMISSIONS.INPUT_CREATE },
        { labelKey: 'nav.farm.harvest', path: '/supplier/deliveries', icon: 'Truck', permission: PERMISSIONS.INPUT_CREATE },
        { labelKey: 'nav.farm.payments', path: '/supplier/payments', icon: 'Wallet', permission: PERMISSIONS.SETTLEMENT_READ },
        { labelKey: 'nav.farm.contracts', path: '/supplier/profile', icon: 'User', permission: PERMISSIONS.USER_MANAGE_OWN },
      ],
    },
  ],

  COMMERCIAL_FARMER: [
    {
      labelKey: 'nav.farm.title',
      items: [
        { labelKey: 'nav.farm.contracts', path: '/farm/contracts', icon: 'FileText', permission: PERMISSIONS.CONTRACT_READ_OWN },
        { labelKey: 'nav.farm.inputs', path: '/farm/inputs', icon: 'Package', permission: PERMISSIONS.INPUT_VERIFY },
        { labelKey: 'nav.farm.escrow', path: '/farm/escrow', icon: 'Lock', permission: PERMISSIONS.ESCROW_READ_OWN },
        { labelKey: 'nav.farm.harvest', path: '/farm/harvest', icon: 'Wheat', permission: PERMISSIONS.CONTRACT_READ_OWN },
        { labelKey: 'nav.farm.collateral', path: '/farm/collateral', icon: 'Shield', permission: PERMISSIONS.COLLATERAL_REGISTER },
        { labelKey: 'nav.farm.payments', path: '/farm/payments', icon: 'Wallet', permission: PERMISSIONS.SETTLEMENT_READ },
      ],
    },
  ],

  OFF_TAKER: [
    {
      labelKey: 'nav.farm.title',
      items: [
        { labelKey: 'nav.farm.contracts', path: '/buyer/purchases', icon: 'ShoppingCart', permission: PERMISSIONS.CONTRACT_READ_OWN },
        { labelKey: 'nav.farm.payments', path: '/buyer/settlements', icon: 'ArrowLeftRight', permission: PERMISSIONS.SETTLEMENT_READ },
      ],
    },
  ],

  GOVERNMENT_REGULATOR: [
    {
      labelKey: 'nav.gov.title',
      items: [
        { labelKey: 'nav.gov.dashboard', path: '/gov/dashboard', icon: 'LayoutDashboard', permission: PERMISSIONS.REPORT_READ_OWN },
        { labelKey: 'nav.gov.contracts', path: '/gov/contracts', icon: 'FileText', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.gov.forex', path: '/gov/forex', icon: 'DollarSign', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.gov.credit', path: '/gov/credit', icon: 'Banknote', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.gov.inputs', path: '/gov/inputs', icon: 'Package', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.gov.tax', path: '/gov/tax', icon: 'Receipt', permission: PERMISSIONS.TAX_READ },
        { labelKey: 'nav.gov.incentives', path: '/gov/incentives', icon: 'Award', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.gov.audit', path: '/gov/audit', icon: 'Eye', permission: PERMISSIONS.AUDIT_READ },
        { labelKey: 'nav.gov.reports', path: '/gov/reports', icon: 'FileText', permission: PERMISSIONS.REPORT_GENERATE },
      ],
    },
  ],

  DONOR: [
    {
      labelKey: 'nav.donor.title',
      items: [
        { labelKey: 'nav.donor.grants', path: '/donor/grants', icon: 'HandCoins', permission: PERMISSIONS.REPORT_READ_OWN },
        { labelKey: 'nav.donor.disbursements', path: '/donor/disbursements', icon: 'ArrowLeftRight', permission: PERMISSIONS.REPORT_READ_OWN },
        { labelKey: 'nav.donor.impact', path: '/donor/impact', icon: 'TrendingUp', permission: PERMISSIONS.REPORT_READ_OWN },
        { labelKey: 'nav.donor.reports', path: '/donor/reports', icon: 'FileText', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.donor.audit', path: '/donor/audit', icon: 'Eye', permission: PERMISSIONS.AUDIT_READ },
      ],
    },
  ],

  NAFI_ADMIN: [
    {
      labelKey: 'nav.admin.title',
      items: [
        { labelKey: 'nav.admin.overview', path: '/admin/overview', icon: 'LayoutDashboard', permission: PERMISSIONS.SYSTEM_CONFIGURE },
        { labelKey: 'nav.admin.users', path: '/admin/users', icon: 'Users', permission: PERMISSIONS.USER_MANAGE_ALL },
        { labelKey: 'nav.admin.contracts', path: '/admin/contracts', icon: 'FileText', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.admin.escrows', path: '/admin/escrows', icon: 'Lock', permission: PERMISSIONS.ESCROW_READ_OWN },
        { labelKey: 'nav.admin.settlements', path: '/admin/settlements', icon: 'ArrowLeftRight', permission: PERMISSIONS.SETTLEMENT_READ },
        { labelKey: 'nav.admin.disputes', path: '/admin/disputes', icon: 'AlertTriangle', permission: PERMISSIONS.DISPUTE_FLAG },
        { labelKey: 'nav.admin.config', path: '/admin/config', icon: 'Settings', permission: PERMISSIONS.SYSTEM_CONFIGURE },
        { labelKey: 'nav.admin.audit', path: '/admin/audit', icon: 'Eye', permission: PERMISSIONS.AUDIT_READ },
        { labelKey: 'nav.admin.health', path: '/admin/health', icon: 'Activity', permission: PERMISSIONS.SYSTEM_CONFIGURE },
      ],
    },
  ],

  COMPLIANCE_OFFICER: [
    {
      labelKey: 'nav.compliance.title',
      items: [
        { labelKey: 'nav.compliance.queue', path: '/compliance/queue', icon: 'ClipboardList', permission: PERMISSIONS.CONTRACT_APPROVE },
        { labelKey: 'nav.compliance.kyc', path: '/compliance/kyc', icon: 'UserCheck', permission: PERMISSIONS.CONTRACT_APPROVE },
        { labelKey: 'nav.compliance.aml', path: '/compliance/aml', icon: 'AlertTriangle', permission: PERMISSIONS.AUDIT_READ },
        { labelKey: 'nav.compliance.sar', path: '/compliance/sar', icon: 'FileText', permission: PERMISSIONS.AUDIT_READ },
      ],
    },
  ],

  ARBITRATOR: [
    {
      labelKey: 'nav.arbitration.title',
      items: [
        { labelKey: 'nav.arbitration.cases', path: '/arbitration/cases', icon: 'Gavel', permission: PERMISSIONS.DISPUTE_ARBITRATE },
      ],
    },
  ],
};
