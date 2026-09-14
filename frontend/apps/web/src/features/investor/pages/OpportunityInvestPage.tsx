import { ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { formatMoney, formatPercent } from '@nafi/formatters';
import { PERMISSIONS } from '@nafi/rbac-core';
import {
  Alert,
  Button,
  Can,
  Card,
  CardBody,
  CardHeader,
  CurrencyInput,
  DataList,
  Input,
  Select,
  Textarea,
  Timeline,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useCreateInvestment, useOpportunity } from '@/hooks';

import { useInvestFlow } from '../hooks/useInvestFlow';

const FUNDING_TYPE_OPTIONS = [
  { value: 'DEBT_FIXED_RETURN', label: 'Debt — fixed return' },
  { value: 'EQUITY_PROFIT_SHARE', label: 'Equity — profit share' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
];

export function OpportunityInvestPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: opp, isLoading, isError, error, refetch } = useOpportunity(id);
  const { state, patch, next, back, toInput } = useInvestFlow();
  const createInvestment = useCreateInvestment();

  if (!opp && !isLoading && !isError) return null;

  const steps = [
    { id: 'terms', title: 'Choose terms', status: state.step > 1 ? 'complete' : 'active' },
    {
      id: 'amount',
      title: 'Enter amount',
      status: state.step > 2 ? 'complete' : state.step === 2 ? 'active' : 'pending',
    },
    { id: 'confirm', title: 'Confirm', status: state.step === 3 ? 'active' : 'pending' },
  ] as const;

  const handleSubmit = async () => {
    if (!opp) return;
    try {
      await createInvestment.mutateAsync(toInput(opp.id));
      navigate('/portfolio/investments', { replace: true });
    } catch {
      /* toast already fired */
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/opportunities"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to opportunities
      </Link>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {opp && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <Card>
                <CardHeader
                  title={opp.targetCrop}
                  description={`${opp.region} · Matures ${new Date(
                    opp.maturityDate,
                  ).toLocaleDateString()}`}
                />
                <CardBody>
                  <Timeline
                    items={steps.map((s) => ({ id: s.id, title: s.title, status: s.status }))}
                  />
                </CardBody>
              </Card>

              {state.step === 1 && (
                <Card>
                  <CardHeader title="Investment terms" />
                  <CardBody className="flex flex-col gap-4">
                    <Select
                      label="Funding structure"
                      value={state.fundingType}
                      onValueChange={(v) => patch({ fundingType: v as typeof state.fundingType })}
                      options={FUNDING_TYPE_OPTIONS}
                    />

                    {state.fundingType === 'DEBT_FIXED_RETURN' ? (
                      <Alert variant="info" title="Fixed return">
                        You will receive your principal plus{' '}
                        {formatPercent(state.agreedReturnRate, 2)} at settlement, regardless of
                        contract yield.
                      </Alert>
                    ) : (
                      <Alert variant="warning" title="Profit share">
                        Your return depends on the contract&apos;s actual profit. Higher upside,
                        higher risk.
                      </Alert>
                    )}
                  </CardBody>
                </Card>
              )}

              {state.step === 2 && (
                <Card>
                  <CardHeader title="Amount" />
                  <CardBody className="flex flex-col gap-4">
                    <Select
                      label="Currency"
                      value={state.currency}
                      onValueChange={(v) => patch({ currency: v as typeof state.currency })}
                      options={CURRENCY_OPTIONS}
                    />

                    <CurrencyInput
                      label="Amount"
                      currency={state.currency}
                      value={state.amountForeignCurrency}
                      onChange={(v) => patch({ amountForeignCurrency: v })}
                      hint="Minimum $500 equivalent"
                    />

                    <Textarea
                      label="Source of funds"
                      value={state.sourceOfFunds}
                      onChange={(e) => patch({ sourceOfFunds: e.target.value })}
                      hint="Required for AML compliance. E.g., 'Savings', 'Salary', 'Business income'."
                      rows={3}
                    />
                  </CardBody>
                </Card>
              )}

              {state.step === 3 && (
                <Card>
                  <CardHeader title="Confirm" />
                  <CardBody className="flex flex-col gap-4">
                    <DataList
                      items={[
                        { label: 'Crop', value: opp.targetCrop },
                        { label: 'Region', value: opp.region },
                        {
                          label: 'Type',
                          value:
                            state.fundingType === 'DEBT_FIXED_RETURN'
                              ? 'Debt — fixed return'
                              : 'Equity — profit share',
                        },
                        {
                          label: 'Amount',
                          value: `${state.amountForeignCurrency} ${state.currency}`,
                        },
                        {
                          label: 'Agreed return',
                          value: formatPercent(state.agreedReturnRate, 2),
                        },
                        {
                          label: 'Maturity',
                          value: new Date(opp.maturityDate).toLocaleDateString(),
                          span: true,
                        },
                      ]}
                    />

                    <Alert
                      variant="info"
                      icon={<ShieldCheck className="h-5 w-5" />}
                      title="Escrow protected"
                    >
                      Your capital is held in a regulated bank escrow account until the contract
                      is fulfilled.
                    </Alert>
                  </CardBody>
                </Card>
              )}

              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={state.step === 1 ? () => navigate('/opportunities') : back}
                  leadingIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  {state.step === 1 ? 'Cancel' : 'Back'}
                </Button>

                {state.step < 3 ? (
                  <Button onClick={next} trailingIcon={<ArrowRight className="h-4 w-4" />}>
                    Continue
                  </Button>
                ) : (
                  <Can I={PERMISSIONS.INVESTMENT_CREATE}>
                    <Button
                      onClick={handleSubmit}
                      loading={createInvestment.isPending}
                      leadingIcon={<Check className="h-4 w-4" />}
                    >
                      Confirm investment
                    </Button>
                  </Can>
                )}
              </div>
            </div>

            <aside className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader title="Opportunity summary" />
                <CardBody>
                  <DataList
                    columns={1}
                    items={[
                      {
                        label: 'Target yield',
                        value: `${Number(opp.targetYieldKg).toLocaleString()} kg`,
                      },
                      {
                        label: 'Floor price',
                        value: `${formatMoney(opp.floorPriceEtb, 'ETB')}/kg`,
                      },
                      { label: 'Target raise', value: formatMoney(opp.targetAmountEtb, 'ETB') },
                      {
                        label: 'Committed',
                        value: formatMoney(opp.committedAmountEtb, 'ETB'),
                      },
                      { label: 'Funded', value: formatPercent(opp.fundedPercent, 0) },
                      { label: 'Investors', value: String(opp.investorCount) },
                    ]}
                  />
                </CardBody>
              </Card>
            </aside>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
