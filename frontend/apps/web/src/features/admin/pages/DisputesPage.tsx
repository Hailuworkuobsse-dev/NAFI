import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function AdminDisputesPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Disputes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Platform-wide disputes management.
        </p>
      </div>

      <Card>
        <CardHeader title="Disputes" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            Aggregated disputes view will appear here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
