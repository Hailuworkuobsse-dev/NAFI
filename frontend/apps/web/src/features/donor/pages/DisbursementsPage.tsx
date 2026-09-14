import { Card, CardBody, CardHeader } from '@nafi/ui-react';

export function DonorDisbursementsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Disbursements</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Grant disbursement tracking by tranche.
        </p>
      </div>

      <Card>
        <CardHeader title="Disbursement schedule" />
        <CardBody>
          <p className="text-sm text-neutral-500">
            Tranche-level disbursement records will appear here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
