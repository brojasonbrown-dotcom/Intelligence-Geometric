/**
 * Deterministic power via exact integer binary exponentiation. Math.pow is
 * implementation-approximated (differs between V8 and JavaScriptCore), so every
 * constant that reaches state routes through this instead — the integer path is
 * pure multiply/divide and therefore bit-identical across engines.
 */
export function dpow(base: number, n: number): number {
  if (!Number.isInteger(n)) return Math.pow(base, n);
  if (n < 0) return 1 / dpow(base, -n);
  let result = 1;
  let b = base;
  let e = n;
  while (e > 0) {
    if (e & 1) result *= b;
    e >>= 1;
    if (e > 0) b *= b;
  }
  return result;
}
