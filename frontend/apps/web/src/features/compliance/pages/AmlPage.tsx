import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function ComplianceAmlPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">AML</h1>
        <p className="mt-1 text-sm text-neutral-500">
          AML review queue and workflow.
        </p>
      </div>

      <Card>
        <CardHeader title="AML" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            AML submissions will appear here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
