import { PERMISSIONS } from '@nafi/rbac-core';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthProvider, type AuthUser } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

function renderRoute(
  user: AuthUser | null,
  permission: Parameters<typeof ProtectedRoute>[0]['permission'],
  roles?: Parameters<typeof ProtectedRoute>[0]['roles'],
) {
  return render(
    <AuthProvider value={{ user, isLoading: false, isAuthenticated: !!user }}>
      <MemoryRouter initialEntries={['/secure']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/portfolio" element={<div>Investor home</div>} />
          <Route
            path="/secure"
            element={
              <ProtectedRoute permission={permission} roles={roles}>
                <div>Secure content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('<ProtectedRoute>', () => {
  it('redirects unauthenticated users to login', () => {
    renderRoute(null, PERMISSIONS.CONTRACT_READ_OWN);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects wrong-role users to their home', () => {
    const investor: AuthUser = {
      id: 'u1',
      nafiId: 'NAFI-00000001',
      email: 'a@b.c',
      fullName: 'T',
      role: 'DIASPORA_INVESTOR',
      permissions: [],
      locale: 'en',
      mfaEnabled: false,
    };
    renderRoute(investor, PERMISSIONS.CONTRACT_APPROVE, ['COMMERCIAL_BANK']);
    expect(screen.getByText('Investor home')).toBeInTheDocument();
  });

  it('renders Forbidden when user lacks permission', () => {
    const investor: AuthUser = {
      id: 'u1',
      nafiId: 'NAFI-00000001',
      email: 'a@b.c',
      fullName: 'T',
      role: 'DIASPORA_INVESTOR',
      permissions: [PERMISSIONS.INVESTMENT_CREATE],
      locale: 'en',
      mfaEnabled: false,
    };
    renderRoute(investor, PERMISSIONS.CONTRACT_APPROVE);
    expect(screen.getByText('Access denied')).toBeInTheDocument();
  });

  it('renders children when allowed', () => {
    const farmer: AuthUser = {
      id: 'u1',
      nafiId: 'NAFI-00000001',
      email: 'a@b.c',
      fullName: 'T',
      role: 'COMMERCIAL_FARMER',
      permissions: [PERMISSIONS.CONTRACT_CREATE],
      locale: 'en',
      mfaEnabled: false,
    };
    renderRoute(farmer, PERMISSIONS.CONTRACT_CREATE);
    expect(screen.getByText('Secure content')).toBeInTheDocument();
  });
});
