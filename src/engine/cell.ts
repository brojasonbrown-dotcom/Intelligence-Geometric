/**
 * The certified nine-term cell. Ported verbatim from METATRON
 * `omega/packages/trnn-core/src/cell/update.ts`.
 *
 *   z+ = clamp_phi4[ a z + b G + g P + d R + e (Pi - z) + zt (zhat - z)
 *                    + eta U + mu V + xi S + rho Rf ]
 *
 * Homogeneous Jury gain g = |a| + |b| + 2|e| + |zt| = 0.7507764... < 1, so the
 * unforced map is a strict contraction in the max norm; the clamp is a
 * belt-and-braces invariant, never the thing keeping it bounded.
 *
 * No allocation on the step path: every term buffer is owned by the caller.
 * Proof: test/cell.test.ts (+ python/test_cell_gpu.py at 100k-field scale).
 */
import { CELL, CLAMP_MAX, JURY_GAIN } from './constants';
import { clampField, type CField } from './complex';

/** The nine drive terms. Any omitted term is treated as zero. */
export interface CellTerms {
  readonly G?: CField | null;
  readonly P?: CField | null;
  readonly R?: CField | null;
  readonly Pi?: CField | null;
  readonly zhat?: CField | null;
  readonly U?: CField | null;
  readonly V?: CField | null;
  readonly S?: CField | null;
  readonly Rf?: CField | null;
}

export interface CellStepReport {
  /** Elements touched by the phi^4 clamp (0 in a healthy run). */
  readonly clamped: number;
  /** ||z+ - z||_2. */
  readonly delta: number;
  /** max_i |z+_i|. */
  readonly peak: number;
  /** Realized max-norm gain ||z+||_inf / ||z||_inf, or 0 when z was zero. */
  readonly realizedGain: number;
  /** ISS bound for THIS step: ||z+||_inf <= g||z||_inf + Σ|k_i| ||term_i||_inf. */
  readonly issBound: number;
  /** Σ_i |k_i| ||term_i||_inf — the drive contribution to the bound. */
  readonly driveNorm: number;
  /** True when the realized peak respects the bound (within float64 slack). */
  readonly issSatisfied: boolean;
}

/** Relative slack allowed on the ISS comparison: pure float64 accumulation error. */
export const ISS_SLACK = 1e-9;

function addTerm(re: Float64Array, im: Float64Array, k: number, t: CField | null | undefined, n: number): number {
  if (!t) return 0;
  if (t.n !== n) {
    throw new RangeError(`cellStep: term width ${t.n} does not match the field width ${n}`);
  }
  const ak = Math.abs(k);
  let maxSq = 0;
  for (let i = 0; i < n; i++) {
    const tr = t.re[i];
    const ti = t.im[i];
    const sq = tr * tr + ti * ti;
    if (sq > maxSq) maxSq = sq;
    re[i] += k * tr;
    im[i] += k * ti;
  }
  return ak * Math.sqrt(maxSq);
}

/**
 * Advance z in place. `out` is the caller-owned destination for z+; passing the
 * same object as `z` is not allowed (the pull terms need the pre-update state).
 */
export function cellStep(z: CField, out: CField, terms: CellTerms): CellStepReport {
  if (out === z) throw new Error('cellStep: out must differ from z (Jacobi staging)');
  const n = z.n;
  if (out.n !== n) throw new RangeError(`cellStep: out width ${out.n} does not match z width ${n}`);
  const { re, im } = out;

  let inMax = 0;
  // alpha z, minus the two pull terms' z contribution (loop-invariant).
  const c = CELL.alpha - CELL.epsilon - CELL.zeta;
  for (let i = 0; i < n; i++) {
    const a = Math.sqrt(z.re[i] * z.re[i] + z.im[i] * z.im[i]);
    if (a > inMax) inMax = a;
    re[i] = c * z.re[i];
    im[i] = c * z.im[i];
  }

  let drive = 0;
  drive += addTerm(re, im, CELL.beta, terms.G, n);
  drive += addTerm(re, im, CELL.gamma, terms.P, n);
  drive += addTerm(re, im, CELL.delta, terms.R, n);
  drive += addTerm(re, im, CELL.epsilon, terms.Pi, n);
  drive += addTerm(re, im, CELL.zeta, terms.zhat, n);
  drive += addTerm(re, im, CELL.eta, terms.U, n);
  drive += addTerm(re, im, CELL.mu, terms.V, n);
  drive += addTerm(re, im, CELL.xi, terms.S, n);
  drive += addTerm(re, im, CELL.rho, terms.Rf, n);

  const clamped = clampField(out, CLAMP_MAX);

  let d = 0;
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const dr = re[i] - z.re[i];
    const di = im[i] - z.im[i];
    d += dr * dr + di * di;
    const a = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
    if (a > peak) peak = a;
  }

  const issBound = JURY_GAIN * inMax + drive;

  return {
    clamped,
    delta: Math.sqrt(d),
    peak,
    realizedGain: inMax > 0 ? peak / inMax : 0,
    issBound,
    driveNorm: drive,
    issSatisfied: peak <= issBound * (1 + ISS_SLACK) + ISS_SLACK,
  };
}
