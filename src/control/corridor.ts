/**
 * The Confidence Corridor — a bounded epistemic control surface. Given a
 * normalized variational free energy (vfeNorm) and an uncertainty term
 * (lambdaNorm), it returns the honest confidence envelope and a regime label.
 *
 * INVERSION-FIXED (defect F18 / redesign P7): the raw bounds cross when the
 * evidence floor says "confident" (low VFE) while the caution ceiling says
 * "uncertain" (high lambda). Reporting the high floor there is exactly how a
 * confidence system hallucinates certainty. The honest scalar is therefore the
 * MORE cautious of the two bounds (`effective = min(lower, upper)`), and `width`
 * goes negative precisely when inverted — a usable alarm.
 *
 * Pure and deterministic. Proof: test/corridor.test.ts (+ GPU-scale property
 * test in python/test_corridor_gpu.py).
 */
import { PHI_INV, PHI_INV_SQ, STRESS_THRESHOLD } from '../core/phi';

export type CorridorClass = 'STABLE' | 'WATCH' | 'STRESS';

export interface CorridorOptions {
  /** Normalized variational free energy in [0,1]; 1 − coherence. */
  vfeNorm?: number;
  /** Confidence ceiling (φ_caution). Defaults to φ^-1. */
  phiCaution?: number;
  /** Normalized uncertainty in [0,1]; shrinks the ceiling. */
  lambdaNorm?: number;
}

export interface CorridorReading {
  readonly lower: number;
  readonly upper: number;
  readonly width: number;
  readonly effective: number;
  readonly inverted: boolean;
  readonly state: CorridorClass;
  classify(score: number): CorridorClass;
}

export function corridor(opts: CorridorOptions = {}): CorridorReading {
  const vfeNorm = opts.vfeNorm ?? 1;
  const phiCaution = opts.phiCaution ?? PHI_INV;
  const lambdaNorm = opts.lambdaNorm ?? 0;
  const lower = Math.max(PHI_INV_SQ, 1 - vfeNorm);
  const upper = Math.min(phiCaution, 1 - lambdaNorm * PHI_INV);
  const inverted = upper < lower;
  const effective = Math.min(lower, upper);
  const width = upper - lower;
  const classify = (score: number): CorridorClass =>
    score >= PHI_INV ? 'STABLE' : score >= STRESS_THRESHOLD ? 'WATCH' : 'STRESS';
  return { lower, upper, width, effective, inverted, classify, state: classify(effective) };
}
