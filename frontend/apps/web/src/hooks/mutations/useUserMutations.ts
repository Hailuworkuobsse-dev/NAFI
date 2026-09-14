import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usersApi } from '@/api/domains/users';
import type { NormalizedApiError } from '@/api/errors';
import type { InviteUserInput, UserSummary } from '@/api/types/user';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useInviteUser() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<UserSummary, NormalizedApiError, InviteUserInput>({
    mutationFn: (input) => usersApi.invite(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.users.root });
      toast({ title: 'Invitation sent', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Invite failed', description: err.message, variant: 'error' });
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.users.root });
      toast({ title: 'User deactivated', variant: 'success' });
    },
  });
}
