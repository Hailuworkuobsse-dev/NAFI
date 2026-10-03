import { expect } from 'chai';
import { TenantScope } from '../src/middleware/tenantScope';

describe('Tenant scope model', () => {
  it('exposes the four scopes in widening order', () => {
    expect(TenantScope.OWN).to.equal('OWN');
    expect(TenantScope.INSTITUTION).to.equal('INSTITUTION');
    expect(TenantScope.NATIONAL).to.equal('NATIONAL');
    expect(TenantScope.ALL).to.equal('ALL');
  });
});
