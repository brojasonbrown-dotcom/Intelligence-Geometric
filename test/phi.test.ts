import { describe, expect, it } from 'vitest';
import { PHI, PHI_INV, PHI_INV_SQ } from '../src/core/phi';

describe('golden-ratio constants', () => {
  it('φ^-1 = 1/φ', () => expect(PHI_INV).toBeCloseTo(1 / PHI, 15));
  it('φ^-2 = 1 - φ^-1', () => expect(PHI_INV_SQ).toBeCloseTo(1 - PHI_INV, 15));
  it('φ^-2 = (φ^-1)^2', () => expect(PHI_INV_SQ).toBeCloseTo(PHI_INV * PHI_INV, 15));
  it('φ satisfies φ^2 = φ + 1', () => expect(PHI * PHI).toBeCloseTo(PHI + 1, 14));
});
