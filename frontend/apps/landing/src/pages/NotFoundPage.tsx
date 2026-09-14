import { Link } from 'react-router-dom';

import { Button } from '@nafi/ui-react';

export function NotFoundPage() {
  return (
    <div className="container-narrow flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-5xl font-bold text-neutral-900">404</h1>
      <p className="text-lg text-neutral-600">This page could not be found.</p>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
