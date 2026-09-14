import { describe, expect, it } from 'vitest';

import { contractCreateSchema } from '../contract';

describe('contractCreateSchema', () => {
  const valid = {
    commercialFarmerId: '00000000-0000-4000-8000-000000000000',
    targetCrop: 'Sesame',
    totalTargetYieldKg: 1000,
    guaranteedFloorPriceEtb: 45.5,
    maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    governmentWitnessId: '00000000-0000-4000-8000-000000000001',
    regionCode: 'ET-AM',
  };

  it('accepts valid input', () => {
    expect(() => contractCreateSchema.parse(valid)).not.toThrow();
  });

  it('rejects past maturity date', () => {
    expect(() =>
      contractCreateSchema.parse({ ...valid, maturityDate: new Date('2020-01-01') }),
    ).toThrow(/future/);
  });

  it('rejects negative yield', () => {
    expect(() =>
      contractCreateSchema.parse({ ...valid, totalTargetYieldKg: -10 }),
    ).toThrow();
  });
});
