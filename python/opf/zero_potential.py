"""RHUFT "zero function" — the charged void and symmetry-breaking.

Proven structures from the OPF static-potential audit. Each function returns the
concrete quantity a downstream decision consumes (the vacuum location and the
mass-squared m^2 = V'' there), not a plot or a report.

Epistemic tags (mirror of docs/PROVENANCE.md):
  [A] proven mathematics  [H] hypothesis / ansatz  [C] quarantined null
"""

from __future__ import annotations

import math


# ---------------------------------------------------------------------------
# Z1 — Higgs quartic (canonical "0 as potential that carries charge")  [A]
# ---------------------------------------------------------------------------

def higgs_quartic(x, mu: float = 1.0, lam: float = 1.0) -> float:
    """V(x) = -mu^2 x^2/2 + lam x^4/4."""
    return -0.5 * mu * mu * x * x + 0.25 * lam * x ** 4


def higgs_quartic_d1(x, mu: float = 1.0, lam: float = 1.0) -> float:
    """V'(x) = -mu^2 x + lam x^3."""
    return -mu * mu * x + lam * x ** 3


def higgs_quartic_d2(x, mu: float = 1.0, lam: float = 1.0) -> float:
    """V''(x) = -mu^2 + 3 lam x^2."""
    return -mu * mu + 3.0 * lam * x * x


def higgs_vacua(mu: float = 1.0, lam: float = 1.0) -> list[float]:
    """Closed-form broken vacua: x = +/- sqrt(mu^2 / lam)."""
    v = math.sqrt(mu * mu / lam)
    return [-v, 0.0, v]


def higgs_mass_sq(mu: float = 1.0, lam: float = 1.0) -> float:
    """m^2 = V''(x0) = 2 mu^2 at the broken vacuum x0 = sqrt(mu^2/lam)."""
    return 2.0 * mu * mu


# ---------------------------------------------------------------------------
# Z2 — sign-flipped log-density complementarity                     [A]
# ---------------------------------------------------------------------------

def flipped_log(x, kappa: float = 0.5) -> float:
    """V(x) = -log(1 + x^2) + kappa x^2."""
    return -math.log1p(x * x) + kappa * x * x


def flipped_log_d2(x, kappa: float = 0.5) -> float:
    """V''(x) = 2(x^2 - 1)/(1 + x^2)^2 + 2 kappa."""
    return 2.0 * (x * x - 1.0) / ((1.0 + x * x) ** 2) + 2.0 * kappa


def flipped_log_vacua(kappa: float = 0.5) -> list[float]:
    """Real vacua x = +/- sqrt(1/kappa - 1) (requires 0 < kappa < 1)."""
    if not (0.0 < kappa < 1.0):
        raise ValueError("flipped-log real vacua require 0 < kappa < 1")
    v = math.sqrt(1.0 / kappa - 1.0)
    return [-v, 0.0, v]


# ---------------------------------------------------------------------------
# Structural null (quarantined): original log-density cannot do both  [C]
# ---------------------------------------------------------------------------

def logdens_d2_zero(kappa: float = 0.5) -> float:
    """V''(0) = 2(1 - kappa) for V = log(1+x^2) - kappa x^2.

    For a broken (charged) void we need V''(0) < 0 -> kappa > 1, while real
    nonzero vacua need kappa < 1. Contradiction: this is the null.
    """
    return 2.0 * (1.0 - kappa)


def logdens_nonzero_vacua(kappa: float = 0.5) -> list[float]:
    """Nonzero vacua x = +/- sqrt(1/kappa - 1): real only for kappa < 1."""
    if kappa <= 0.0:
        raise ValueError("kappa must be positive")
    arg = 1.0 / kappa - 1.0
    if arg <= 0.0:
        return []  # no real nonzero vacua
    v = math.sqrt(arg)
    return [-v, v]
