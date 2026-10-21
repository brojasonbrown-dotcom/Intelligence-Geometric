"""Homogeneous nine-term cell map, vectorized (numpy/torch), for GPU-scale
verification of the contraction certificate. Mirrors src/engine/cell.ts with the
drive terms zero (the homogeneous map the Jury gain certifies)."""

PHI = (1 + 5 ** 0.5) / 2
ALPHA = PHI ** -2
EPSILON = PHI ** -8
ZETA = PHI ** -3
BETA = PHI ** -5
C = ALPHA - EPSILON - ZETA  # true homogeneous gain |C| ~ 0.1246
JURY_GAIN = abs(ALPHA) + abs(BETA) + 2 * abs(EPSILON) + abs(ZETA)
CLAMP_MAX = PHI ** 4


def homo_step(xp, re, im):
    """z+ = clamp(C * z) — the undriven map."""
    re2 = C * re
    im2 = C * im
    mag = xp.sqrt(re2 * re2 + im2 * im2)
    k = xp.where(mag > CLAMP_MAX, CLAMP_MAX / xp.clip(mag, 1e-30, None), xp.ones_like(mag))
    return re2 * k, im2 * k
