import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function AdminContractsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Contracts</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Platform-wide contracts management.
        </p>
      </div>

      <Card>
        <CardHeader title="Contracts" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            Aggregated contracts view will appear here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
