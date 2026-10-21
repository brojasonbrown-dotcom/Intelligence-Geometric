/**
 * Golden-ratio constants and the two identities the control surface relies on.
 * Class A (proven): see test/phi.test.ts and the Wolfram exact check in
 * docs/PROVENANCE.md.
 */
export const PHI = 1.618033988749895;
export const PHI_INV = 0.6180339887498949; // 1 / φ
export const PHI_INV_SQ = 0.3819660112501051; // φ^-2 == 1 - φ^-1 == (φ^-1)^2

/**
 * Operational STRESS threshold. [H] heuristic (≈ 0.7·φ^-1), explicitly NOT
 * φ-derived — kept as a named constant so it is tested, never a magic literal.
 */
export const STRESS_THRESHOLD = 0.432;
