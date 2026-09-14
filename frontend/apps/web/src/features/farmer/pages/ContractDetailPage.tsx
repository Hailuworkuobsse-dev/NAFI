import { ArrowLeft, PenLine } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { formatDate, formatMoney, formatWeight } from '@nafi/formatters';
import { PERMISSIONS } from '@nafi/rbac-core';
import {
  Button,
  Can,
  Card,
  CardBody,
  CardHeader,
  ContractStatusBadge,
  DataList,
  Timeline,
  type TimelineItem,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useContract, useContractSignatures, useContractTimeline } from '@/hooks';

import { ContractSignDialog } from '../components/ContractSignDialog';

export function FarmContractDetailPage() {
  const { id = '' } = useParams();
  const [signOpen, setSignOpen] = useState(false);

  const contract = useContract(id);
  const timeline = useContractTimeline(id);
  const signatures = useContractSignatures(id);

  const hasSigned = signatures.data?.some((s) => s.role === 'FARMER');

  const timelineItems: TimelineItem[] =
    timeline.data?.map((e) => ({
      id: e.id,
      title: e.label,
      description: e.description,
      timestamp: new Date(e.timestamp).toLocaleDateString(),
      status: 'complete',
    })) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/farm/contracts"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to contracts
      </Link>

      <QueryBoundary
        isLoading={contract.isLoading}
        isError={contract.isError}
        error={contract.error}
        onRetry={contract.refetch}
      >
        {contract.data && (
          <>
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-neutral-900">
                    {contract.data.targetCrop}
                  </h1>
                  <ContractStatusBadge status={contract.data.status} />
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {contract.data.region} · Matures {formatDate(contract.data.maturityDate)}
                </p>
              </div>

              {!hasSigned && contract.data.status === 'DRAFT' && (
                <Can I={PERMISSIONS.CONTRACT_UPDATE}>
                  <Button
                    leadingIcon={<PenLine className="h-4 w-4" />}
                    onClick={() => setSignOpen(true)}
                  >
                    Sign contract
                  </Button>
                </Can>
              )}
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-6 lg:col-span-2">
                <Card>
                  <CardHeader title="Contract terms" />
                  <CardBody>
                    <DataList
                      items={[
                        {
                          label: 'Target yield',
                          value: formatWeight(contract.data.totalTargetYieldKg),
                        },
                        {
                          label: 'Floor price',
                          value: `${formatMoney(
                            contract.data.guaranteedFloorPriceEtb,
                            'ETB',
                          )}/kg`,
                        },
                        {
                          label: 'Contract value',
                          value: formatMoney(contract.data.contractValueEtb, 'ETB'),
                        },
                        {
                          label: 'Committed funding',
                          value: formatMoney(contract.data.committedAmountEtb, 'ETB'),
                        },
                        {
                          label: 'Government witness',
                          value: contract.data.governmentWitnessName,
                          span: true,
                        },
                        {
                          label: 'Managing bank',
                          value: contract.data.bankName ?? '—',
                          span: true,
                        },
                        {
                          label: 'Ledger hash',
                          value: (
                            <code className="text-xs">{contract.data.onChainHash}</code>
                          ),
                          span: true,
                        },
                      ]}
                    />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Timeline" />
                  <CardBody>
                    {timelineItems.length === 0 ? (
                      <p className="text-sm text-neutral-500">No events yet.</p>
                    ) : (
                      <Timeline items={timelineItems} />
                    )}
                  </CardBody>
                </Card>
              </div>

              <aside className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Signatures" />
                  <CardBody>
                    <ul className="flex flex-col gap-3">
                      {signatures.data?.map((s) => (
                        <li
                          key={s.role}
                          className="flex items-start justify-between gap-2 text-sm"
                        >
                          <div>
                            <p className="font-medium text-neutral-900">{s.signerName}</p>
                            <p className="text-xs text-neutral-500">
                              {s.role.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <span className="text-xs text-neutral-500">
                            {new Date(s.signedAt).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                      {!signatures.data?.length && (
                        <p className="text-xs text-neutral-500">No signatures yet.</p>
                      )}
                    </ul>
                  </CardBody>
                </Card>
              </aside>
            </div>

            <ContractSignDialog
              contractId={id}
              open={signOpen}
              onOpenChange={setSignOpen}
            />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
