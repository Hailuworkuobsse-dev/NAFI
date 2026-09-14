import { describe, it, expect } from 'vitest';
import { can } from '../can';
import { PERMISSIONS } from '../permissions';
import type { Role } from '../roles';

describe('can()', () => {
  it('denies null subject', () => {
    expect(can(null, PERMISSIONS.CONTRACT_READ_OWN)).toBe(false);
  });

  it('allows NAFI_ADMIN for any permission (wildcard)', () => {
    const admin = { role: 'NAFI_ADMIN' as Role };
    expect(can(admin, PERMISSIONS.SYSTEM_CONFIGURE)).toBe(true);
    expect(can(admin, PERMISSIONS.CONTRACT_CREATE)).toBe(true);
  });

  it('allows farmer to create contract', () => {
    const farmer = { role: 'COMMERCIAL_FARMER' as Role };
    expect(can(farmer, PERMISSIONS.CONTRACT_CREATE)).toBe(true);
  });

  it('denies farmer escrow release', () => {
    const farmer = { role: 'COMMERCIAL_FARMER' as Role };
    expect(can(farmer, PERMISSIONS.ESCROW_RELEASE)).toBe(false);
  });

  it('allows bank to release escrow', () => {
    const bank = { role: 'COMMERCIAL_BANK' as Role };
    expect(can(bank, PERMISSIONS.ESCROW_RELEASE)).toBe(true);
  });

  it('allows diaspora investor to create investment', () => {
    const investor = { role: 'DIASPORA_INVESTOR' as Role };
    expect(can(investor, PERMISSIONS.INVESTMENT_CREATE)).toBe(true);
  });

  it('denies diaspora investor settlement execution', () => {
    const investor = { role: 'DIASPORA_INVESTOR' as Role };
    expect(can(investor, PERMISSIONS.SETTLEMENT_EXECUTE)).toBe(false);
  });

  it('respects scope when provided', () => {
    const bank = {
      role: 'COMMERCIAL_BANK' as Role,
      scopes: { [PERMISSIONS.CONTRACT_READ_ALL]: ['region:addis'] },
    };
    expect(can(bank, PERMISSIONS.CONTRACT_READ_ALL, 'region:addis')).toBe(true);
    expect(can(bank, PERMISSIONS.CONTRACT_READ_ALL, 'region:oromia')).toBe(false);
  });

  it('overrides role permissions when subject.permissions is set', () => {
    const restrictedAdmin = {
      role: 'NAFI_ADMIN' as Role,
      permissions: [PERMISSIONS.CONTRACT_READ_OWN] as const,
    };
    expect(can(restrictedAdmin, PERMISSIONS.CONTRACT_READ_OWN)).toBe(true);
  });
});
