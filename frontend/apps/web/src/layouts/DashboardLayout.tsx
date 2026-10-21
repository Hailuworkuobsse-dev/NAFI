import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Award,
  BadgeCheck,
  Banknote,
  Bell,
  ClipboardList,
  Coins,
  DollarSign,
  Eye,
  FileText,
  Gavel,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Package,
  PieChart,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Truck,
  User,
  UserCheck,
  Users,
  Wallet,
  Wheat,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Avatar, Button, Can, cn } from '@nafi/ui-react';

import { useAuth } from '@/auth/useAuth';
import { InstallPrompt } from '@/components/InstallPrompt';
import { OfflineBanner } from '@/components/OfflineBanner';
import { track } from '@/observability/analytics';
import { useAuthActions } from '@/auth/AuthProvider';

import { NAV_BY_ROLE } from './navConfig';

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Activity, AlertTriangle, ArrowLeftRight, Award, BadgeCheck, Banknote, ClipboardList,
  Coins, DollarSign, Eye, FileText, Gavel, GraduationCap, HandCoins, LayoutDashboard, Lock,
  Package, PieChart, Receipt, RefreshCw, Search, Settings, Shield, ShieldCheck, ShoppingCart,
  TrendingUp, Truck, User, UserCheck, Users, Wallet, Wheat,
};

export function DashboardLayout() {
  const { t } = useTranslation('nav');
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = useMemo(() => (user ? NAV_BY_ROLE[user.role] : []), [user]);

  const location = useLocation();
  useEffect(() => {
    track({ name: 'page_view', props: { path: location.pathname } });
  }, [location.pathname]);

  if (!user) return null;

  const fullName = user.fullName ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  const initials = fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white">
            <span className="font-bold">N</span>
          </div>
          <span className="text-base font-bold tracking-tight">NAFI</span>
        </div>
        <button
          type="button"
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {user.role === 'COMMERCIAL_FARMER' && <InstallPrompt />}

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sidebar">
        {sections.map((section) => (
          <div key={section.labelKey} className="mb-5">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {t(section.labelKey)}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = ICONS[item.icon] ?? Package;
                return (
                  <li key={item.path}>
                    <Can I={item.permission} scope={item.scope}>
                      <NavLink
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-brand-50 text-brand-700'
                              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                          )
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{t(item.labelKey)}</span>
                      </NavLink>
                    </Can>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-neutral-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
      {user.role === 'COMMERCIAL_FARMER' && <InstallPrompt />}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white lg:flex lg:flex-col">
        {sidebar}
      </aside>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-modal-backdrop bg-neutral-900/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 z-modal h-full w-64 border-r border-neutral-200 bg-white lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      <div className="flex flex-1 flex-col">
        <OfflineBanner />
        <header className="sticky top-0 z-sticky flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                {user.institutionName ?? user.role.replace(/_/g, ' ')}
              </p>
              <p className="text-sm font-semibold text-neutral-900">{user.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 rounded-full border border-neutral-200 py-1 pl-1 pr-3">
              <Avatar fallback={initials} size="sm" />
              <span className="text-xs font-medium text-neutral-700">{user.nafiId}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      {user.role === 'COMMERCIAL_FARMER' && <InstallPrompt />}
    </div>
  );
}
