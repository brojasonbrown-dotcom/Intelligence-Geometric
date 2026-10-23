"""RHUFT mass mechanism — why rho cannot carry mass, and r does.  [A]

The OPF static potential is V = rho*log(chi) + chi*r^2. Varying with respect to
rho yields log(chi) = 0, i.e. rho is a Lagrange multiplier enforcing chi = 1.
A Lagrange multiplier has no kinetic independence and therefore no propagator
pole — the structural reason every "mass in rho" attempt imports physics or dies.

Mass already lives in the Lagrangian, carried by the curvature/occupation field
r. With the kinetic term (mu_g/2)(grad r)^2, linearizing about
(rho, chi, r) = (0, chi0, 0) gives the mass term chi0 r^2, hence
    m_r^2 = 2 chi0 / mu_g.
"""

from __future__ import annotations

import math


def opf_mass_sq(chi0: float, mu_g: float) -> float:
    """m_r^2 = 2 chi0 / mu_g  (honest OPF mass in the r-field)."""
    if chi0 <= 0 or mu_g <= 0:
        raise ValueError("chi0 and mu_g must be positive")
    return 2.0 * chi0 / mu_g


def opf_mass(chi0: float, mu_g: float) -> float:
    """m_r = sqrt(2 chi0 / mu_g)."""
    return math.sqrt(opf_mass_sq(chi0, mu_g))


def opf_stationary_point() -> tuple[float, float, float]:
    """grad V = 0 -> (rho, chi, r) = (0, 1, 0)."""
    return (0.0, 1.0, 0.0)


def opf_hessian_eigenvalues() -> tuple[float, float, float]:
    """Eigenvalues of the OPF static-potential Hessian at (0,1,0).

    The +2 eigenvector is pure r-axis: mass lives in r, not rho.
    """
    return (-1.0, +1.0, +2.0)
