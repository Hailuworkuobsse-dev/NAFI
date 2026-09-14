import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '../permissions';
import { ROLE_PERMISSIONS } from '../rolePermissions';
import { ROLES } from '../roles';

describe('ROLE_PERMISSIONS', () => {
  it('defines permissions for every role', () => {
    Object.values(ROLES).forEach((role) => {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
    });
  });

  it('NAFI_ADMIN has wildcard', () => {
    expect(ROLE_PERMISSIONS.NAFI_ADMIN).toEqual(['*']);
  });

  it('COMMERCIAL_FARMER can create contracts', () => {
    expect(ROLE_PERMISSIONS.COMMERCIAL_FARMER).toContain(PERMISSIONS.CONTRACT_CREATE);
  });

  it('COMMERCIAL_BANK can release escrow', () => {
    expect(ROLE_PERMISSIONS.COMMERCIAL_BANK).toContain(PERMISSIONS.ESCROW_RELEASE);
  });

  it('DIASPORA_INVESTOR cannot approve contracts', () => {
    expect(ROLE_PERMISSIONS.DIASPORA_INVESTOR).not.toContain(PERMISSIONS.CONTRACT_APPROVE);
  });
});
