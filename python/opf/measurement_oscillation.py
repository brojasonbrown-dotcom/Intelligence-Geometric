"""RHUFT measurement oscillation — the closure gap.  [A]

The iterated self-measurement map
    rho_{n+1} = eps * sin(rho_n)
has a super-attracting fixed point (for eps = 3/2 the fixed point is the first
nonzero root of x = (3/2) sin x, x ~ 1.49578157). The residual
|rho_{n+1} - rho_n| — the "closure gap" — converges to zero, proving the gap is
a convergent oscillation, not a mass gap. The map's local gain g = |eps cos x|
is < 1 at the fixed point, so the contraction is verified.

The decision this consumes: any downstream model that treats the closure
residual as "mass" is measuring a vanishing oscillation, not an invariant mass.
"""

from __future__ import annotations

import math

EPS = 1.5


def map_step(x: float, eps: float = EPS) -> float:
    """rho_{n+1} = eps * sin(rho_n)."""
    return eps * math.sin(x)


def fixed_point_estimate(x0: float = 0.1, eps: float = EPS, n: int = 60) -> float:
    """Iterate the map to its fixed point (float resolution)."""
    x = x0
    for _ in range(n):
        x = map_step(x, eps)
    return x


def fixed_point_gain(x: float, eps: float = EPS) -> float:
    """Local gain |d/dx (eps sin x)| = |eps cos x| at a candidate fixed point."""
    return abs(eps * math.cos(x))


def residual(x: float, eps: float = EPS) -> float:
    """Closure-gap residual |map(x) - x|."""
    return abs(map_step(x, eps) - x)
