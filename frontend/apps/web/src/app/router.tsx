import { PERMISSIONS } from '@nafi/rbac-core';
import { ProtectedRoute } from '@nafi/ui-react';
import { createBrowserRouter } from 'react-router-dom';

import { LandingPage } from '@nafi/landing';
import { PublicLayout } from '@nafi/landing';

import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { AuthLayout } from '@/features/auth/layouts/AuthLayout';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { FarmContractsPage } from '@/features/farmer/pages/ContractsPage';
import { FarmContractDetailPage } from '@/features/farmer/pages/ContractDetailPage';
import { FarmCollateralPage } from '@/features/farmer/pages/CollateralPage';
import { FarmEscrowPage } from '@/features/farmer/pages/EscrowPage';
import { FarmHarvestPage } from '@/features/farmer/pages/HarvestPage';
import { FarmInputsPage } from '@/features/farmer/pages/InputsPage';
import { FarmPaymentsPage } from '@/features/farmer/pages/PaymentsPage';
import { FarmerProfilePage } from '@/features/farmer/pages/ProfilePage';
import { InvestorBondsPage } from '@/features/investor/pages/BondsPage';
import { InvestorInvestmentsPage } from '@/features/investor/pages/InvestmentsPage';
import { OpportunityBrowserPage } from '@/features/investor/pages/OpportunityBrowserPage';
import { OpportunityInvestPage } from '@/features/investor/pages/OpportunityInvestPage';
import { InvestorOverviewPage } from '@/features/investor/pages/OverviewPage';
import { InvestorReturnsPage } from '@/features/investor/pages/ReturnsPage';
import { InvestorStatementsPage } from '@/features/investor/pages/StatementsPage';
import { SupplierDeliveriesPage } from '@/features/supplier/pages/DeliveriesPage';
import { SupplierOrderDetailPage } from '@/features/supplier/pages/OrderDetailPage';
import { SupplierOrdersPage } from '@/features/supplier/pages/OrdersPage';
import { SupplierPaymentsPage } from '@/features/supplier/pages/PaymentsPage';
import { SupplierProfilePage } from '@/features/supplier/pages/ProfilePage';

// Admin (real pages — Step 7)
import { AdminAuditPage } from '@/features/admin/pages/AuditPage';
import { AdminConfigPage } from '@/features/admin/pages/ConfigPage';
import { AdminContractsPage } from '@/features/admin/pages/ContractsPage';
import { AdminDisputesPage } from '@/features/admin/pages/DisputesPage';
import { AdminEscrowsPage } from '@/features/admin/pages/EscrowsPage';
import { AdminHealthPage } from '@/features/admin/pages/HealthPage';
import { AdminOverviewPage } from '@/features/admin/pages/OverviewPage';
import { AdminSettlementsPage } from '@/features/admin/pages/SettlementsPage';
import { AdminUsersPage } from '@/features/admin/pages/UsersPage';
import { UssdSimulatorPage } from '@/features/admin/pages/UssdSimulatorPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Bank (real pages — Step 7)
import { BankOverviewPage } from '@/features/bank/pages/OverviewPage';
import { BankEscrowsPage } from '@/features/bank/pages/EscrowsPage';
import { BankEscrowDetailPage } from '@/features/bank/pages/EscrowDetailPage';
import { BankLoansPage } from '@/features/bank/pages/LoansPage';
import { BankCollateralPage } from '@/features/bank/pages/CollateralPage';
import { BankSettlementsPage } from '@/features/bank/pages/SettlementsPage';
import { BankNplPage } from '@/features/bank/pages/NplPage';

// DBE (real pages — Step 7)
import { DbePortfolioPage } from '@/features/dbe/pages/PortfolioPage';
import { DbeCoFinancingPage } from '@/features/dbe/pages/CoFinancingPage';
import { DbeOnLendingPage } from '@/features/dbe/pages/OnLendingPage';
import { DbeTaTrackingPage } from '@/features/dbe/pages/TaTrackingPage';
import { DbeReportsPage } from '@/features/dbe/pages/ReportsPage';

// NAFA (real pages — Step 7)
import { NafaGuaranteesPage } from '@/features/nafa/pages/GuaranteesPage';
import { NafaClaimsPage } from '@/features/nafa/pages/ClaimsPage';
import { NafaRiskSharingPage } from '@/features/nafa/pages/RiskSharingPage';
import { NafaRefinancingPage } from '@/features/nafa/pages/RefinancingPage';
import { NafaReportsPage } from '@/features/nafa/pages/ReportsPage';

// Government (real pages — Step 7)
import { GovDashboardPage } from '@/features/government/pages/DashboardPage';
import { GovContractsPage } from '@/features/government/pages/ContractsPage';
import { GovForexPage } from '@/features/government/pages/ForexPage';
import { GovCreditPage } from '@/features/government/pages/CreditPage';
import { GovInputsPage } from '@/features/government/pages/InputsPage';
import { GovTaxPage } from '@/features/government/pages/TaxPage';
import { GovIncentivesPage } from '@/features/government/pages/IncentivesPage';
import { GovAuditPage } from '@/features/government/pages/AuditPage';
import { GovReportsPage } from '@/features/government/pages/ReportsPage';

// Donor (real pages — Step 7)
import { DonorGrantsPage } from '@/features/donor/pages/GrantsPage';
import { DonorDisbursementsPage } from '@/features/donor/pages/DisbursementsPage';
import { DonorImpactPage } from '@/features/donor/pages/ImpactPage';
import { DonorReportsPage } from '@/features/donor/pages/ReportsPage';
import { DonorAuditPage } from '@/features/donor/pages/AuditPage';

// Compliance (real pages — Step 7)
import { ComplianceQueuePage } from '@/features/compliance/pages/QueuePage';
import { ComplianceKycPage } from '@/features/compliance/pages/KycPage';
import { ComplianceAmlPage } from '@/features/compliance/pages/AmlPage';
import { ComplianceSarPage } from '@/features/compliance/pages/SarPage';

// Arbitrator (real pages — Step 7)
import { ArbitrationCasesPage } from '@/features/arbitrator/pages/CasesPage';
import { ArbitrationCaseDetailPage } from '@/features/arbitrator/pages/CaseDetailPage';

import {
  BuyerPurchases, BuyerSettlements,
  NotFound,
} from '@/pages/stubs';

export const router = createBrowserRouter([
  // -------- Public / Landing --------
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'how-it-works', element: <LandingPage /> },
      { path: 'for-investors', element: <LandingPage /> },
      { path: 'for-farmers', element: <LandingPage /> },
      { path: 'for-banks', element: <LandingPage /> },
      { path: 'for-government', element: <LandingPage /> },
      { path: 'impact', element: <LandingPage /> },
      { path: 'security', element: <LandingPage /> },
      { path: 'about', element: <LandingPage /> },
      { path: 'contact', element: <LandingPage /> },
    ],
  },

  // -------- Auth --------
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password/:token', element: <ResetPasswordPage /> },
    ],
  },

  {
    element: <ProtectedRoute permission={PERMISSIONS.CONTRACT_READ_OWN} />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // -------- Diaspora Investor --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.INVESTMENT_READ_OWN}
                roles={['DIASPORA_INVESTOR']}
              />
            ),
            children: [
              { path: '/portfolio', element: <InvestorOverviewPage /> },
              { path: '/portfolio/investments', element: <InvestorInvestmentsPage /> },
              { path: '/portfolio/investments/:id', element: <InvestorInvestmentsPage /> },
              { path: '/portfolio/bonds', element: <InvestorBondsPage /> },
              { path: '/portfolio/returns', element: <InvestorReturnsPage /> },
              { path: '/portfolio/statements', element: <InvestorStatementsPage /> },
              { path: '/opportunities', element: <OpportunityBrowserPage /> },
              { path: '/opportunities/:id/invest', element: <OpportunityInvestPage /> },
            ],
          },

          // -------- Commercial Bank --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.ESCROW_READ_OWN}
                roles={['COMMERCIAL_BANK']}
              />
            ),
            children: [
              { path: '/bank/overview', element: <BankOverviewPage /> },
              { path: '/bank/escrows', element: <BankEscrowsPage /> },
              { path: '/bank/escrows/:id', element: <BankEscrowDetailPage /> },
              { path: '/bank/loans', element: <BankLoansPage /> },
              { path: '/bank/collateral', element: <BankCollateralPage /> },
              { path: '/bank/settlements', element: <BankSettlementsPage /> },
              { path: '/bank/npl', element: <BankNplPage /> },
            ],
          },

          // -------- DBE --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_READ_ALL}
                roles={['DBE_OFFICER']}
              />
            ),
            children: [
              { path: '/dbe/portfolio', element: <DbePortfolioPage /> },
              { path: '/dbe/co-financing', element: <DbeCoFinancingPage /> },
              { path: '/dbe/on-lending', element: <DbeOnLendingPage /> },
              { path: '/dbe/ta-tracking', element: <DbeTaTrackingPage /> },
              { path: '/dbe/reports', element: <DbeReportsPage /> },
            ],
          },

          // -------- NAFA --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_READ_ALL}
                roles={['NAFA_OFFICER']}
              />
            ),
            children: [
              { path: '/nafa/guarantees', element: <NafaGuaranteesPage /> },
              { path: '/nafa/claims', element: <NafaClaimsPage /> },
              { path: '/nafa/risk-sharing', element: <NafaRiskSharingPage /> },
              { path: '/nafa/refinancing', element: <NafaRefinancingPage /> },
              { path: '/nafa/reports', element: <NafaReportsPage /> },
            ],
          },

          // -------- Input Supplier --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.INPUT_CREATE}
                roles={['INPUT_SUPPLIER']}
              />
            ),
            children: [
              { path: '/supplier/orders', element: <SupplierOrdersPage /> },
              { path: '/supplier/orders/:id', element: <SupplierOrderDetailPage /> },
              { path: '/supplier/deliveries', element: <SupplierDeliveriesPage /> },
              { path: '/supplier/payments', element: <SupplierPaymentsPage /> },
              { path: '/supplier/profile', element: <SupplierProfilePage /> },
            ],
          },

          // -------- Commercial Farmer --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_READ_OWN}
                roles={['COMMERCIAL_FARMER']}
              />
            ),
            children: [
              { path: '/farm/contracts', element: <FarmContractsPage /> },
              { path: '/farm/contracts/:id', element: <FarmContractDetailPage /> },
              { path: '/farm/inputs', element: <FarmInputsPage /> },
              { path: '/farm/escrow', element: <FarmEscrowPage /> },
              { path: '/farm/harvest', element: <FarmHarvestPage /> },
              { path: '/farm/collateral', element: <FarmCollateralPage /> },
              { path: '/farm/payments', element: <FarmPaymentsPage /> },
            ],
          },

          // -------- Off-Taker --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_READ_OWN}
                roles={['OFF_TAKER']}
              />
            ),
            children: [
              { path: '/buyer/purchases', element: <BuyerPurchases /> },
              { path: '/buyer/settlements', element: <BuyerSettlements /> },
            ],
          },

          // -------- Government --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.REPORT_READ_OWN}
                roles={['GOVERNMENT_REGULATOR']}
              />
            ),
            children: [
              { path: '/gov/dashboard', element: <GovDashboardPage /> },
              { path: '/gov/contracts', element: <GovContractsPage /> },
              { path: '/gov/forex', element: <GovForexPage /> },
              { path: '/gov/credit', element: <GovCreditPage /> },
              { path: '/gov/inputs', element: <GovInputsPage /> },
              { path: '/gov/tax', element: <GovTaxPage /> },
              { path: '/gov/incentives', element: <GovIncentivesPage /> },
              { path: '/gov/audit', element: <GovAuditPage /> },
              { path: '/gov/reports', element: <GovReportsPage /> },
            ],
          },

          // -------- Donor --------
          {
            element: (
              <ProtectedRoute permission={PERMISSIONS.REPORT_READ_OWN} roles={['DONOR']} />
            ),
            children: [
              { path: '/donor/grants', element: <DonorGrantsPage /> },
              { path: '/donor/disbursements', element: <DonorDisbursementsPage /> },
              { path: '/donor/impact', element: <DonorImpactPage /> },
              { path: '/donor/reports', element: <DonorReportsPage /> },
              { path: '/donor/audit', element: <DonorAuditPage /> },
            ],
          },

          // -------- Admin --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.SYSTEM_CONFIGURE}
                roles={['NAFI_ADMIN']}
              />
            ),
            children: [
              { path: '/admin/overview', element: <AdminOverviewPage /> },
              { path: '/admin/users', element: <AdminUsersPage /> },
              { path: '/admin/contracts', element: <AdminContractsPage /> },
              { path: '/admin/escrows', element: <AdminEscrowsPage /> },
              { path: '/admin/settlements', element: <AdminSettlementsPage /> },
              { path: '/admin/disputes', element: <AdminDisputesPage /> },
              { path: '/admin/config', element: <AdminConfigPage /> },
              { path: '/admin/audit', element: <AdminAuditPage /> },
              { path: '/admin/health', element: <AdminHealthPage /> },
              { path: '/admin/tools/ussd', element: <UssdSimulatorPage /> },
            ],
          },

          // -------- Compliance --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_APPROVE}
                roles={['COMPLIANCE_OFFICER']}
              />
            ),
            children: [
              { path: '/compliance/queue', element: <ComplianceQueuePage /> },
              { path: '/compliance/kyc', element: <ComplianceKycPage /> },
              { path: '/compliance/aml', element: <ComplianceAmlPage /> },
              { path: '/compliance/sar', element: <ComplianceSarPage /> },
            ],
          },

          // -------- Arbitrator --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.DISPUTE_ARBITRATE}
                roles={['ARBITRATOR']}
              />
            ),
            children: [
              { path: '/arbitration/cases', element: <ArbitrationCasesPage /> },
              { path: '/arbitration/cases/:id', element: <ArbitrationCaseDetailPage /> },
            ],
          },

          // -------- Shared --------
          { path: '/profile', element: <FarmerProfilePage /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFound /> },
]);
