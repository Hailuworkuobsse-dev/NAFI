import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function AdminConfigPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Config</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Platform-wide config management.
        </p>
      </div>

      <Card>
        <CardHeader title="Config" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            Aggregated config view will appear here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
