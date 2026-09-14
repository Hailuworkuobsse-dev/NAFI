import { Construction } from 'lucide-react';

import { Card, CardBody } from '@nafi/ui-react';

export interface PagePlaceholderProps {
  title: string;
  description?: string;
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>

      <Card>
        <CardBody className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Construction className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-neutral-900">Coming in a later step</p>
          <p className="max-w-md text-xs text-neutral-500">
            This page is stubbed for now. It will be fully implemented in Steps 5–8 of the build.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
