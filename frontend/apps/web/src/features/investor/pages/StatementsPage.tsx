import { FileText, Download } from 'lucide-react';

import { formatDate } from '@nafi/formatters';
import { Button, Card, CardBody, CardHeader } from '@nafi/ui-react';

import { QueryBoundary } from '@/components/QueryBoundary';
import { useReports } from '@/hooks';

export function InvestorStatementsPage() {
  const { data, isLoading, isError, error, refetch } = useReports({
    type: 'PORTFOLIO',
    pageSize: 50,
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Statements</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Downloadable statements for tax, records, and reconciliation.
        </p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={Boolean(data && data.items.length === 0)}
        emptyFallback={
          <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-sm text-neutral-500">No statements yet.</p>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          {data?.items.map((r) => (
            <Card key={r.id}>
              <CardHeader
                title={r.title}
                description={`${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}`}
                action={
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    leadingIcon={<Download className="h-4 w-4" />}
                  >
                    <a href={r.fileUrl} target="_blank" rel="noreferrer noopener">
                      {r.format}
                    </a>
                  </Button>
                }
              />
              <CardBody className="flex items-center gap-3 text-xs text-neutral-500">
                <FileText className="h-4 w-4" />
                Generated {formatDate(r.generatedAt)} by {r.generatedByName}
              </CardBody>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
