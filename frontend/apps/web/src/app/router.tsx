import { PERMISSIONS } from '@nafi/rbac-core';
import { ProtectedRoute } from '@nafi/ui-react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AuthLayout } from '@/features/auth/layouts/AuthLayout';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import {
  AdminAudit, AdminConfig, AdminContracts, AdminDisputes, AdminEscrows, AdminHealth,
  AdminOverview, AdminSettlements, AdminUsers,
  ArbitrationCases,
  BankCollateral, BankEscrows, BankLoans, BankNPL, BankOverview, BankSettlements,
  BuyerPurchases, BuyerSettlements,
  ComplianceAml, ComplianceKyc, ComplianceQueue, ComplianceSar,
  DbeCoFinancing, DbeOnLending, DbePortfolio, DbeReports, DbeTaTracking,
  DonorAudit, DonorDisbursements, DonorGrants, DonorImpact, DonorReports,
  FarmCollateral, FarmContracts, FarmEscrow, FarmHarvest, FarmInputs, FarmPayments,
  GovAudit, GovContracts, GovCredit, GovDashboard, GovForex, GovIncentives, GovInputs,
  GovReports, GovTax,
  InvestorBonds, InvestorInvestments, InvestorOverview, InvestorReturns, InvestorStatements,
  NafaClaims, NafaGuarantees, NafaRefinancing, NafaReports, NafaRiskSharing,
  NotFound, OpportunityBrowser, ProfilePage,
  SupplierDeliveries, SupplierOrders, SupplierPayments, SupplierProfile,
} from '@/pages/stubs';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
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
              { path: '/portfolio', element: <InvestorOverview /> },
              { path: '/portfolio/investments', element: <InvestorInvestments /> },
              { path: '/portfolio/bonds', element: <InvestorBonds /> },
              { path: '/portfolio/returns', element: <InvestorReturns /> },
              { path: '/portfolio/statements', element: <InvestorStatements /> },
              { path: '/opportunities', element: <OpportunityBrowser /> },
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
              { path: '/supplier/orders', element: <SupplierOrders /> },
              { path: '/supplier/deliveries', element: <SupplierDeliveries /> },
              { path: '/supplier/payments', element: <SupplierPayments /> },
              { path: '/supplier/profile', element: <SupplierProfile /> },
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
              { path: '/farm/contracts', element: <FarmContracts /> },
              { path: '/farm/inputs', element: <FarmInputs /> },
              { path: '/farm/escrow', element: <FarmEscrow /> },
              { path: '/farm/harvest', element: <FarmHarvest /> },
              { path: '/farm/collateral', element: <FarmCollateral /> },
              { path: '/farm/payments', element: <FarmPayments /> },
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
