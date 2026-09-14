import { useEffect } from 'react';

import type { NormalizedApiError } from '@/api/errors';
import { useToast } from '@/components/ToastProvider';

/**
 * Watches for 403 responses and emits a global toast once per unique error.
 */
export function usePermissionGuard(error: unknown) {
  const { toast } = useToast();

  useEffect(() => {
    const e = error as NormalizedApiError | null | undefined;
    if (e?.kind === 'forbidden') {
      toast({
        title: 'Access denied',
        description: e.message,
        variant: 'error',
      });
    }
  }, [error, toast]);
}
