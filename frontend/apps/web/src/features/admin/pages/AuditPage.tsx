import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function AdminAuditPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Audit</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Platform-wide audit management.
        </p>
      </div>

      <Card>
        <CardHeader title="Audit" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            Aggregated audit view will appear here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
