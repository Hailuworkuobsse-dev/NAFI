import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function ComplianceKycPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">KYC</h1>
        <p className="mt-1 text-sm text-neutral-500">
          KYC review queue and workflow.
        </p>
      </div>

      <Card>
        <CardHeader title="KYC" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            KYC submissions will appear here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
