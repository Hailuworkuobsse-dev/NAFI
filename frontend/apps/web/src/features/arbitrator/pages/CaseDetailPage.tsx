import { ArrowLeft, Calendar, FileText, Gavel } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { formatDate } from '@nafi/formatters';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataList,
  Modal,
  Select,
  Textarea,
  Timeline,
} from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useDecideDispute, useDispute, useScheduleHearing } from '@/hooks';

export function ArbitrationCaseDetailPage() {
  const { id = '' } = useParams();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [decideOpen, setDecideOpen] = useState(false);
  const [hearingAt, setHearingAt] = useState('');
  const [decision, setDecision] = useState('');
  const [outcome, setOutcome] = useState<'UPHOLD' | 'REJECT' | 'PARTIAL'>('UPHOLD');

  const dispute = useDispute(id);
  const schedule = useScheduleHearing();
  const decide = useDecideDispute();

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/arbitration/cases"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to cases
      </Link>

      <QueryBoundary
        isLoading={dispute.isLoading}
        isError={dispute.isError}
        error={dispute.error}
        onRetry={dispute.refetch}
      >
        {dispute.data && (
          <>
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-neutral-900">
                    {dispute.data.contractCrop}
                  </h1>
                  <Badge
                    variant={
                      dispute.data.status === 'DECIDED' || dispute.data.status === 'CLOSED'
                        ? 'success'
                        : 'warning'
                    }
                    dot
                  >
                    {dispute.data.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  Case {dispute.data.id.slice(0, 8)} · Filed {formatDate(dispute.data.filedAt)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  leadingIcon={<Calendar className="h-4 w-4" />}
                  onClick={() => setScheduleOpen(true)}
                >
                  Schedule hearing
                </Button>
                <Button
                  leadingIcon={<Gavel className="h-4 w-4" />}
                  onClick={() => setDecideOpen(true)}
                >
                  Record decision
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-6 lg:col-span-2">
                <Card>
                  <CardHeader title="Case summary" />
                  <CardBody>
                    <DataList
                      columns={2}
                      items={[
                        {
                          label: 'Category',
                          value: dispute.data.category.replace(/_/g, ' '),
                        },
                        { label: 'Filed by', value: dispute.data.filedByName },
                        { label: 'Summary', value: dispute.data.summary, span: true },
                      ]}
                    />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Evidence" />
                  <CardBody className="flex flex-col gap-3">
                    {dispute.data.evidence.length === 0 ? (
                      <p className="text-sm text-neutral-500">No evidence submitted yet.</p>
                    ) : (
                      dispute.data.evidence.map((e) => (
                        <a
                          key={e.id}
                          href={e.fileUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="flex items-center gap-3 rounded-md border border-neutral-200 p-3 hover:bg-neutral-50"
                        >
                          <FileText className="h-4 w-4 text-neutral-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-900">{e.label}</p>
                            <p className="text-xs text-neutral-500">
                              Uploaded {formatDate(e.uploadedAt)}
                            </p>
                          </div>
                        </a>
                      ))
                    )}
                  </CardBody>
                </Card>

                {dispute.data.decision && (
                  <Card>
                    <CardHeader title="Decision" />
                    <CardBody>
                      <p className="text-sm text-neutral-700">{dispute.data.decision}</p>
                      {dispute.data.decisionAt && (
                        <p className="mt-2 text-xs text-neutral-500">
                          Recorded {formatDate(dispute.data.decisionAt)}
                        </p>
                      )}
                    </CardBody>
                  </Card>
                )}
              </div>

              <aside className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Timeline" />
                  <CardBody>
                    <Timeline
                      items={[
                        {
                          id: '1',
                          title: 'Dispute filed',
                          status: 'complete',
                          timestamp: formatDate(dispute.data.filedAt),
                        },
                        ...(dispute.data.hearingAt
                          ? [
                              {
                                id: '2',
                                title: 'Hearing scheduled',
                                status: 'complete' as const,
                                timestamp: formatDate(dispute.data.hearingAt),
                              },
                            ]
                          : []),
                        ...(dispute.data.decisionAt
                          ? [
                              {
                                id: '3',
                                title: 'Decision recorded',
                                status: 'complete' as const,
                                timestamp: formatDate(dispute.data.decisionAt),
                              },
                            ]
                          : [
                              {
                                id: '3',
                                title: 'Awaiting decision',
                                status: 'pending' as const,
                              },
                            ]),
                      ]}
                    />
                  </CardBody>
                </Card>
              </aside>
            </div>

            <Modal
              open={scheduleOpen}
              onOpenChange={setScheduleOpen}
              title="Schedule hearing"
              footer={
                <>
                  <Button variant="ghost" onClick={() => setScheduleOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await schedule.mutateAsync({
                        id,
                        hearingAt,
                        arbitratorId: 'me',
                      });
                      setScheduleOpen(false);
                    }}
                    loading={schedule.isPending}
                  >
                    Confirm
                  </Button>
                </>
              }
            >
              <div className="flex flex-col gap-4">
                <label className="text-sm font-medium text-neutral-700">
                  Hearing date & time
                </label>
                <input
                  type="datetime-local"
                  value={hearingAt}
                  onChange={(e) => setHearingAt(e.target.value)}
                  className="h-10 rounded border border-neutral-300 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </Modal>

            <Modal
              open={decideOpen}
              onOpenChange={setDecideOpen}
              title="Record decision"
              footer={
                <>
                  <Button variant="ghost" onClick={() => setDecideOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await decide.mutateAsync({ disputeId: id, decision, outcome });
                      setDecideOpen(false);
                    }}
                    disabled={decision.length < 10}
                    loading={decide.isPending}
                  >
                    Record decision
                  </Button>
                </>
              }
            >
              <div className="flex flex-col gap-4">
                <Select
                  label="Outcome"
                  value={outcome}
                  onValueChange={(v) => setOutcome(v as typeof outcome)}
                  options={[
                    { value: 'UPHOLD', label: 'Uphold the complaint' },
                    { value: 'REJECT', label: 'Reject the complaint' },
                    { value: 'PARTIAL', label: 'Partially uphold' },
                  ]}
                />
                <Textarea
                  label="Decision"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  rows={6}
                  hint="At least 10 characters. This becomes part of the permanent record."
                />
              </div>
            </Modal>
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
