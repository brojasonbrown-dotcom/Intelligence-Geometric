import { describe, expect, it } from 'vitest';
import { corridor } from '../src/control/corridor';
import { PHI_INV, PHI_INV_SQ } from '../src/core/phi';

describe('Confidence Corridor', () => {
  it('the default corridor spans [φ^-2, φ^-1]', () => {
    const c = corridor();
    expect(c.lower).toBeCloseTo(PHI_INV_SQ, 15);
    expect(c.upper).toBeCloseTo(PHI_INV, 15);
    expect(c.classify(0.9)).toBe('STABLE');
    expect(c.classify(0.5)).toBe('WATCH');
    expect(c.classify(0.1)).toBe('STRESS');
  });

  it('does not hallucinate certainty when it inverts (F18/P7)', () => {
    // Low VFE lifts the floor to 0.9; high lambda drops the ceiling below it.
    const c = corridor({ vfeNorm: 0.1, lambdaNorm: 1, phiCaution: 1 });
    expect(c.lower).toBeCloseTo(0.9, 12);
    expect(c.upper).toBeLessThan(c.lower);
    expect(c.inverted).toBe(true);
    expect(c.width).toBeLessThan(0);
    expect(c.effective).toBeCloseTo(c.upper, 12); // the cautious bound wins
    expect(c.state).not.toBe('STABLE');
  });

  it('property: bounds stay sane and effective never exceeds the floor', () => {
    for (let i = 0; i <= 50; i++) {
      for (let j = 0; j <= 50; j++) {
        const c = corridor({ vfeNorm: i / 50, lambdaNorm: j / 50, phiCaution: 1 });
        expect(c.lower).toBeGreaterThanOrEqual(PHI_INV_SQ - 1e-12);
        expect(c.lower).toBeLessThanOrEqual(1 + 1e-12);
        expect(c.upper).toBeLessThanOrEqual(1 + 1e-12);
        expect(c.effective).toBeLessThanOrEqual(c.lower + 1e-12);
      }
    }
  });
});
