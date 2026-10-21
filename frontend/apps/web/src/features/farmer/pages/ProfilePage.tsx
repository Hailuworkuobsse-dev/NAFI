import { Bell, LogOut, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge, Button, Card, CardBody, CardHeader, Switch } from '@nafi/ui-react';

import { useAuthActions } from '@/auth/AuthProvider';
import { useAuth } from '@/auth/useAuth';
import { SyncStatus } from '@/components/SyncStatus';
import { subscribeToPush, unsubscribeFromPush } from '@/offline/push';

const ROLE_LABELS: Record<string, string> = {
  COMMERCIAL_FARMER: 'Commercial farmer',
  DIASPORA_INVESTOR: 'Diaspora investor',
  INPUT_SUPPLIER: 'Input supplier',
  OFF_TAKER: 'Off-taker / buyer',
  COMMERCIAL_BANK: 'Commercial bank',
  DBE_OFFICER: 'DBE officer',
  NAFA_OFFICER: 'NAFA officer',
  GOVERNMENT_REGULATOR: 'Government regulator',
  DONOR: 'Donor / DFI',
  COMPLIANCE_OFFICER: 'Compliance officer',
  ARBITRATOR: 'Arbitrator',
  NAFI_ADMIN: 'NAFI administrator',
};

export function FarmerProfilePage() {
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const navigate = useNavigate();

  const [pushEnabled, setPushEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted',
  );
  const [pushBusy, setPushBusy] = useState(false);

  if (!user) return null;

  const initials = user.fullName
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Your account details and notification preferences.
        </p>
      </header>

      <Card>
        <CardHeader title="Account" description="Your NAFI identity across the platform." />
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-lg font-semibold text-white"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-neutral-900">{user.fullName}</p>
              <p className="truncate text-sm text-neutral-500">{user.email}</p>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-3 border-t border-neutral-100 pt-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-neutral-500">NAFI ID</dt>
              <dd className="mt-0.5 font-medium text-neutral-900">{user.nafiId}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Role</dt>
              <dd className="mt-0.5">
                <Badge variant="info">{ROLE_LABELS[user.role] ?? user.role}</Badge>
              </dd>
            </div>
            {user.institutionName && (
              <div>
                <dt className="text-neutral-500">Institution</dt>
                <dd className="mt-0.5 font-medium text-neutral-900">{user.institutionName}</dd>
              </div>
            )}
            <div>
              <dt className="text-neutral-500">Two-factor authentication</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-neutral-900">
                <ShieldCheck
                  className={`h-4 w-4 ${user.mfaEnabled ? 'text-success-dark' : 'text-neutral-400'}`}
                />
                {user.mfaEnabled ? 'Enabled' : 'Not enabled'}
              </dd>
            </div>
          </dl>

          <div className="border-t border-neutral-100 pt-4">
            <SyncStatus />
          </div>

          <div className="border-t border-neutral-100 pt-4">
            <Button variant="outline" leadingIcon={<LogOut className="h-4 w-4" />} onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Notifications"
          description="Get notified about contract milestones, deliveries, and settlements."
          action={<Bell className="h-5 w-5 text-neutral-400" />}
        />
        <CardBody className="flex flex-col gap-4">
          <Switch
            checked={pushEnabled}
            disabled={pushBusy}
            onCheckedChange={async (checked) => {
              setPushBusy(true);
              try {
                if (checked) {
                  await subscribeToPush();
                  setPushEnabled(Notification.permission === 'granted');
                } else {
                  await unsubscribeFromPush();
                  setPushEnabled(false);
                }
              } finally {
                setPushBusy(false);
              }
            }}
            label="Enable push notifications"
          />
          <p className="text-xs text-neutral-500">
            Notifications are delivered even when the app is closed.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
