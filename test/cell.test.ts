/**
 * Contraction certificate for the nine-term cell. Three independent proofs:
 *   1. the Jury gain is a strict contraction (< 1) and matches the frozen value;
 *   2. the undriven map is max-norm contractive and converges to the 0 fixed point;
 *   3. two trajectories on identical drives contract toward each other at the
 *      true homogeneous gain |alpha - epsilon - zeta| (Banach);
 *   4. the driven ISS bound holds for random drives.
 */
import { describe, expect, it } from 'vitest';
import { createField, maxNorm, type CField } from '../src/engine/complex';
import { cellStep, type CellTerms } from '../src/engine/cell';
import { CELL, JURY_GAIN, JURY_GAIN_REFERENCE } from '../src/engine/constants';

/** mulberry32 — deterministic PRNG so the certificate is reproducible. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randField(n: number, r: () => number, scale = 1): CField {
  const f = createField(n);
  for (let i = 0; i < n; i++) {
    f.re[i] = (r() * 2 - 1) * scale;
    f.im[i] = (r() * 2 - 1) * scale;
  }
  return f;
}

function maxNormDiff(a: CField, b: CField): number {
  let m = 0;
  for (let i = 0; i < a.n; i++) {
    const dr = a.re[i] - b.re[i];
    const di = a.im[i] - b.im[i];
    const v = Math.sqrt(dr * dr + di * di);
    if (v > m) m = v;
  }
  return m;
}

/** The true homogeneous Lipschitz gain of the map in z (drives fixed). */
const CONTRACTION = Math.abs(CELL.alpha - CELL.epsilon - CELL.zeta); // ~0.1246

describe('nine-term cell — contraction certificate', () => {
  it('the homogeneous Jury gain is a strict contraction (< 1) at the frozen value', () => {
    expect(JURY_GAIN).toBeLessThan(1);
    expect(JURY_GAIN).toBeCloseTo(JURY_GAIN_REFERENCE, 14);
    expect(CONTRACTION).toBeLessThan(JURY_GAIN); // true gain is even tighter
  });

  it('the undriven map is max-norm contractive (realized gain <= Jury gain), every trial', () => {
    const r = rng(1);
    const n = 233;
    for (let t = 0; t < 2000; t++) {
      const z = randField(n, r, 3);
      const out = createField(n);
      const rep = cellStep(z, out, {});
      expect(rep.realizedGain).toBeLessThanOrEqual(JURY_GAIN + 1e-9);
      expect(rep.issSatisfied).toBe(true);
    }
  });

  it('undriven iteration converges to the zero fixed point', () => {
    const r = rng(2);
    const n = 89;
    let z = randField(n, r, 4);
    let out = createField(n);
    for (let k = 0; k < 40; k++) {
      cellStep(z, out, {});
      [z, out] = [out, z];
    }
    expect(maxNorm(z)).toBeLessThan(1e-9);
  });

  it('two trajectories on identical drives contract at gain |alpha-epsilon-zeta| (Banach)', () => {
    const r = rng(3);
    const n = 144;
    for (let t = 0; t < 1000; t++) {
      const z1 = randField(n, r, 2);
      const z2 = randField(n, r, 2);
      const o1 = createField(n);
      const o2 = createField(n);
      cellStep(z1, o1, {});
      cellStep(z2, o2, {});
      const before = maxNormDiff(z1, z2);
      const after = maxNormDiff(o1, o2);
      expect(after).toBeLessThanOrEqual(CONTRACTION * before + 1e-9);
    }
  });

  it('the driven ISS bound holds for random drives', () => {
    const r = rng(4);
    const n = 55;
    for (let t = 0; t < 2000; t++) {
      const z = randField(n, r, 2);
      const terms: CellTerms = {
        G: randField(n, r, 1),
        P: randField(n, r, 1),
        R: randField(n, r, 1),
        U: randField(n, r, 1),
        S: randField(n, r, 1),
      };
      const out = createField(n);
      const rep = cellStep(z, out, terms);
      expect(rep.issSatisfied).toBe(true);
    }
  });
});
