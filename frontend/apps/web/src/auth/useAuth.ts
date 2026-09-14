import { useAuth as useUIAuth } from '@nafi/ui-react';

export const useAuth = useUIAuth;

export function useRequiredUser() {
  const { user } = useUIAuth();
  if (!user) throw new Error('useRequiredUser called outside authenticated route');
  return user;
}
