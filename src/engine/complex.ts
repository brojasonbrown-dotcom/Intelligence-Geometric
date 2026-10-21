/**
 * Split complex field: two Float64Arrays (re/im), zero per-step allocation.
 * Ported from METATRON `core/complex.ts` — only the pieces the cell step and its
 * certificate actually use (no dead code).
 */
export interface CField {
  readonly re: Float64Array;
  readonly im: Float64Array;
  readonly n: number;
}

export function createField(n: number): CField {
  return { re: new Float64Array(n), im: new Float64Array(n), n };
}

/** max_i |z_i| (the max norm the contraction certificate is stated in). */
export function maxNorm(f: CField): number {
  let m = 0;
  for (let i = 0; i < f.n; i++) {
    const a = Math.sqrt(f.re[i] * f.re[i] + f.im[i] * f.im[i]);
    if (a > m) m = a;
  }
  return m;
}

/** Per-element max-norm clamp to `limit`, preserving phase (Law L8). Returns the
 *  number of elements touched. The clamp is non-expansive, so it can only
 *  shrink distances — it never breaks the contraction, it backstops it. */
export function clampField(f: CField, limit: number): number {
  let clamped = 0;
  for (let i = 0; i < f.n; i++) {
    const a = Math.sqrt(f.re[i] * f.re[i] + f.im[i] * f.im[i]);
    if (a > limit && a > 0) {
      const k = limit / a;
      f.re[i] *= k;
      f.im[i] *= k;
      clamped++;
    }
  }
  return clamped;
}
