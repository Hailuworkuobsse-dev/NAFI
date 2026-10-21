import { createContext, useContext, type ReactNode } from 'react';

import type { Permission, Role } from '@nafi/rbac-core';

export interface AuthUser {
  id: string;
  nafiId: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  institutionId?: string;
  institutionName?: string;
  permissions: Permission[];
  scopes?: Record<string, string[]>;
  locale: 'en' | 'am' | 'om' | 'ti';
  mfaEnabled: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  value,
  children,
}: {
  value: AuthContextValue;
  children: ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
