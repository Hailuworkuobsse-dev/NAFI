import { PERMISSIONS } from '@nafi/rbac-core';
import { ProtectedRoute } from '@nafi/ui-react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { AuthLayout } from '@/features/auth/layouts/AuthLayout';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { FarmContractDetailPage } from '@/features/farmer/pages/ContractDetailPage';
import { FarmCollateralPage } from '@/features/farmer/pages/CollateralPage';
import { FarmContractsPage } from '@/features/farmer/pages/ContractsPage';
import { FarmEscrowPage } from '@/features/farmer/pages/EscrowPage';
import { FarmHarvestPage } from '@/features/farmer/pages/HarvestPage';
import { FarmInputsPage } from '@/features/farmer/pages/InputsPage';
import { FarmPaymentsPage } from '@/features/farmer/pages/PaymentsPage';
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
import { DashboardLayout } from '@/layouts/DashboardLayout';
import {
  AdminAudit, AdminConfig, AdminContracts, AdminDisputes, AdminEscrows, AdminHealth,
  AdminOverview, AdminSettlements, AdminUsers,
  ArbitrationCases,
  BankCollateral, BankEscrows, BankLoans, BankNPL, BankOverview, BankSettlements,
  BuyerPurchases, BuyerSettlements,
  ComplianceAml, ComplianceKyc, ComplianceQueue, ComplianceSar,
  DbeCoFinancing, DbeOnLending, DbePortfolio, DbeReports, DbeTaTracking,
  DonorAudit, DonorDisbursements, DonorGrants, DonorImpact, DonorReports,
  GovAudit, GovContracts, GovCredit, GovDashboard, GovForex, GovIncentives, GovInputs,
  GovReports, GovTax,
  NafaClaims, NafaGuarantees, NafaRefinancing, NafaReports, NafaRiskSharing,
  NotFound, ProfilePage,
} from '@/pages/stubs';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
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
              { path: '/bank/overview', element: <BankOverview /> },
              { path: '/bank/escrows', element: <BankEscrows /> },
              { path: '/bank/loans', element: <BankLoans /> },
              { path: '/bank/collateral', element: <BankCollateral /> },
              { path: '/bank/settlements', element: <BankSettlements /> },
              { path: '/bank/npl', element: <BankNPL /> },
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
              { path: '/dbe/portfolio', element: <DbePortfolio /> },
              { path: '/dbe/co-financing', element: <DbeCoFinancing /> },
              { path: '/dbe/on-lending', element: <DbeOnLending /> },
              { path: '/dbe/ta-tracking', element: <DbeTaTracking /> },
              { path: '/dbe/reports', element: <DbeReports /> },
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
              { path: '/nafa/guarantees', element: <NafaGuarantees /> },
              { path: '/nafa/claims', element: <NafaClaims /> },
              { path: '/nafa/risk-sharing', element: <NafaRiskSharing /> },
              { path: '/nafa/refinancing', element: <NafaRefinancing /> },
              { path: '/nafa/reports', element: <NafaReports /> },
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
              { path: '/gov/dashboard', element: <GovDashboard /> },
              { path: '/gov/contracts', element: <GovContracts /> },
              { path: '/gov/forex', element: <GovForex /> },
              { path: '/gov/credit', element: <GovCredit /> },
              { path: '/gov/inputs', element: <GovInputs /> },
              { path: '/gov/tax', element: <GovTax /> },
              { path: '/gov/incentives', element: <GovIncentives /> },
              { path: '/gov/audit', element: <GovAudit /> },
              { path: '/gov/reports', element: <GovReports /> },
            ],
          },

          // -------- Donor --------
          {
            element: (
              <ProtectedRoute permission={PERMISSIONS.REPORT_READ_OWN} roles={['DONOR']} />
            ),
            children: [
              { path: '/donor/grants', element: <DonorGrants /> },
              { path: '/donor/disbursements', element: <DonorDisbursements /> },
              { path: '/donor/impact', element: <DonorImpact /> },
              { path: '/donor/reports', element: <DonorReports /> },
              { path: '/donor/audit', element: <DonorAudit /> },
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
              { path: '/admin/overview', element: <AdminOverview /> },
              { path: '/admin/users', element: <AdminUsers /> },
              { path: '/admin/contracts', element: <AdminContracts /> },
              { path: '/admin/escrows', element: <AdminEscrows /> },
              { path: '/admin/settlements', element: <AdminSettlements /> },
              { path: '/admin/disputes', element: <AdminDisputes /> },
              { path: '/admin/config', element: <AdminConfig /> },
              { path: '/admin/audit', element: <AdminAudit /> },
              { path: '/admin/health', element: <AdminHealth /> },
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
              { path: '/compliance/queue', element: <ComplianceQueue /> },
              { path: '/compliance/kyc', element: <ComplianceKyc /> },
              { path: '/compliance/aml', element: <ComplianceAml /> },
              { path: '/compliance/sar', element: <ComplianceSar /> },
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
            children: [{ path: '/arbitration/cases', element: <ArbitrationCases /> }],
          },

          // -------- Shared --------
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFound /> },
]);
