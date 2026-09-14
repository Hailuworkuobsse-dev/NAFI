import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { ErrorState } from '@nafi/ui-react';

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="p-8">
        <ErrorState title={`${error.status}`} message={error.statusText} />
      </div>
    );
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  return (
    <div className="p-8">
      <ErrorState title="Something went wrong" message={message} />
    </div>
  );
}
