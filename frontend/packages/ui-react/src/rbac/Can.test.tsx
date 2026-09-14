import { PERMISSIONS } from '@nafi/rbac-core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthProvider, type AuthUser } from './AuthContext';
import { Can } from './Can';

function wrap(user: AuthUser | null, ui: React.ReactNode) {
  return render(
    <AuthProvider value={{ user, isLoading: false, isAuthenticated: !!user }}>{ui}</AuthProvider>,
  );
}

describe('<Can>', () => {
  it('renders children when user has permission', () => {
    const farmer: AuthUser = {
      id: 'u1',
      nafiId: 'NAFI-00000001',
      email: 'a@b.c',
      fullName: 'Test',
      role: 'COMMERCIAL_FARMER',
      permissions: [PERMISSIONS.CONTRACT_CREATE],
      locale: 'en',
      mfaEnabled: false,
    };
    wrap(
      farmer,
      <Can I={PERMISSIONS.CONTRACT_CREATE}>
        <span>Allowed</span>
      </Can>,
    );
    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });

  it('renders fallback when user lacks permission', () => {
    const investor: AuthUser = {
      id: 'u2',
      nafiId: 'NAFI-00000002',
      email: 'a@b.c',
      fullName: 'Test',
      role: 'DIASPORA_INVESTOR',
      permissions: [PERMISSIONS.INVESTMENT_CREATE],
      locale: 'en',
      mfaEnabled: false,
    };
    wrap(
      investor,
      <Can I={PERMISSIONS.CONTRACT_CREATE} fallback={<span>Denied</span>}>
        <span>Allowed</span>
      </Can>,
    );
    expect(screen.getByText('Denied')).toBeInTheDocument();
    expect(screen.queryByText('Allowed')).not.toBeInTheDocument();
  });

  it('denies when no user', () => {
    wrap(
      null,
      <Can I={PERMISSIONS.CONTRACT_READ_OWN} fallback={<span>Anon</span>}>
        <span>Allowed</span>
      </Can>,
    );
    expect(screen.getByText('Anon')).toBeInTheDocument();
  });
});
