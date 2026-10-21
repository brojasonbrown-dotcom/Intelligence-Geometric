/**
 * The one constants source for the cell step. Every constant derives from PHI
 * via the deterministic power `phiPow`. Ported verbatim from METATRON
 * `core/constants.ts` (only the cell + certificate constants).
 */
import { dpow } from './dmath';

/** Golden ratio, float64-nearest. */
export const PHI = (1 + Math.sqrt(5)) / 2;

/** Canonical phi power; all derived constants route through this. */
export function phiPow(n: number): number {
  return dpow(PHI, n);
}

/** Closure coupling kappa = 1/(phi*pi). */
export const KAPPA = 1 / (PHI * Math.PI);
/** Self-reflection coupling kappa_r = 1/(phi^2*pi); |kappa_r| < phi^-3. */
export const REFLECT_GAIN = KAPPA / PHI;

/** Always-on max-norm clamp (Law L8). */
export const CLAMP_MAX = phiPow(4);

/**
 * The nine-term cell coefficients:
 *   z+ = clamp[ a z + b G + g P + d R + e (Pi - z) + zt (zhat - z) + eta U + mu V + xi S + rho Rf ]
 */
export const CELL = {
  alpha: phiPow(-2), // self / recurrence
  beta: phiPow(-5), // geometric drive G
  gamma: phiPow(-3), // phase term P
  delta: phiPow(-3), // resonance term R
  epsilon: phiPow(-8), // Pi (closure) pull
  zeta: phiPow(-3), // zhat (prediction) pull
  eta: phiPow(-5), // external input U
  mu: phiPow(-5), // web / cross-rung V
  xi: phiPow(-5), // sensory S
  rho: REFLECT_GAIN, // self-reflection Rf
} as const;

/**
 * Jury contraction certificate for the homogeneous part:
 *   g = |alpha| + |beta| + 2|epsilon| + |zeta| = 0.7507764050037855 < 1
 * so the unforced map is a strict contraction in the max norm.
 */
export const JURY_GAIN =
  Math.abs(CELL.alpha) + Math.abs(CELL.beta) + 2 * Math.abs(CELL.epsilon) + Math.abs(CELL.zeta);

/** Frozen reference value of the certificate. */
export const JURY_GAIN_REFERENCE = 0.7507764050037855;
