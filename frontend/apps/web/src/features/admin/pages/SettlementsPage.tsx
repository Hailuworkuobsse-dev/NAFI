import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function AdminSettlementsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Settlements</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Platform-wide settlements management.
        </p>
      </div>

      <Card>
        <CardHeader title="Settlements" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            Aggregated settlements view will appear here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
