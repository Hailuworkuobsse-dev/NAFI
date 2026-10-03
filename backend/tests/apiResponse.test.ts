import { expect } from 'chai';
import { idParam } from '../src/utils/apiResponse';

describe('idParam normalization', () => {
  it('passes through a plain string', () => {
    expect(idParam('abc')).to.equal('abc');
  });
  it('takes the first element of an array (Express params)', () => {
    expect(idParam(['x', 'y'])).to.equal('x');
  });
  it('throws on missing id', () => {
    expect(() => idParam(undefined)).to.throw();
    expect(() => idParam('')).to.throw();
  });
});
