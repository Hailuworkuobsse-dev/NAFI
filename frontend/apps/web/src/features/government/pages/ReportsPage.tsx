import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function GovReportsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Reports</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Real-time view for national oversight.
        </p>
      </div>

      <Card>
        <CardHeader title="Reports" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            Detailed reports metrics will be surfaced here once the backend exposes aggregated
            endpoints.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
