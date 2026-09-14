import { Card, CardBody, CardHeader, DataList } from '@nafi/ui-react';

export function DbeOnLendingPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">On-Lending</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Wholesale funds extended to RUSACCOs and MFIs.
        </p>
      </div>

      <Card>
        <CardHeader title="Portfolio summary" />
        <CardBody>
          <DataList
            items={[
              { label: 'Active RUSACCOs', value: '—' },
              { label: 'Active MFIs', value: '—' },
              { label: 'Total outstanding', value: '—' },
              { label: 'Next disbursement', value: '—' },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
