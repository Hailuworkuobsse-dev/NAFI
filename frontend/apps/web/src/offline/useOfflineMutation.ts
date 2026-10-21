import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/auth/useAuth';
import { useToast } from '@/components/ToastProvider';

import { registerBackgroundSync } from './backgroundSync';
import { useOffline } from './OfflineProvider';
import { enqueueMutation } from './queue';

export interface OfflineMutationConfig<TData, TVariables> {
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  toBody?: (vars: TVariables) => unknown;
  priority?: number;
  groupKey?: string;
  invalidateKeys?: readonly (readonly unknown[])[];
  onComplete?: (data: TData | null, variables: TVariables) => void;
  successToast?: string;
  queuedToast?: string;
  onlineMutation: (vars: TVariables) => Promise<TData>;
}

export function useOfflineMutation<TData, TVariables>(
  config: OfflineMutationConfig<TData, TVariables>,
) {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<TData | null, Error, TVariables>({
    mutationFn: async (vars) => {
      if (!user) throw new Error('Not authenticated');

      if (isOnline) {
        const data = await config.onlineMutation(vars);
        if (config.invalidateKeys) {
          config.invalidateKeys.forEach((key) =>
            queryClient.invalidateQueries({ queryKey: key }),
          );
        }
        if (config.successToast) {
          toast({ title: config.successToast, variant: 'success' });
        }
        config.onComplete?.(data, vars);
        return data;
      }

      await enqueueMutation({
        userId: user.id,
        endpoint: config.endpoint,
        method: config.method,
        body: config.toBody ? config.toBody(vars) : vars,
        priority: config.priority ?? 50,
        groupKey: config.groupKey,
      });

      await registerBackgroundSync();

      if (config.queuedToast) {
        toast({
          title: config.queuedToast,
          description: "We'll sync automatically when you're back online.",
          variant: 'info',
        });
      }

      config.onComplete?.(null, vars);
      return null;
    },
  });
}
