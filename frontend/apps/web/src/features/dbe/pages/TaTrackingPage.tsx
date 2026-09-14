import { Card, CardBody, CardHeader, DataList } from '@nafi/ui-react';

export function DbeTaTrackingPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Technical Assistance</h1>
        <p className="mt-1 text-sm text-neutral-500">
          TA activities, budget, and outcomes under RUFIP III.
        </p>
      </div>

      <Card>
        <CardHeader title="TA program" />
        <CardBody>
          <DataList
            items={[
              { label: 'Total budget', value: '€8.5M' },
              { label: 'Committed', value: '—' },
              { label: 'Beneficiaries reached', value: '—' },
              { label: 'Focus areas', value: 'Rural finance, climate, women', span: true },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
