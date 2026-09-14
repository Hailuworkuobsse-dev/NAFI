import { Card, CardBody, CardHeader, DataList } from '@nafi/ui-react';

import { useAuth } from '@/auth/useAuth';

export function SupplierProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">Your account details.</p>
      </div>

      <Card>
        <CardHeader title="Account" />
        <CardBody>
          <DataList
            items={[
              { label: 'NAFI ID', value: user.nafiId },
              { label: 'Full name', value: user.fullName },
              { label: 'Email', value: user.email },
              { label: 'Role', value: user.role.replace(/_/g, ' ') },
              { label: 'Institution', value: user.institutionName ?? '—' },
              { label: 'Language', value: user.locale },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
