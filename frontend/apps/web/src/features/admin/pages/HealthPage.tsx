import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function AdminHealthPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Health</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Platform-wide health management.
        </p>
      </div>

      <Card>
        <CardHeader title="Health" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            Aggregated health view will appear here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
