"""Behavioural tests for the admitted OPF math structures.

Assertions mirror the closed-form results from the symbolic audit
(October-Research consolidated findings). Every asserted number is a real
behaviour, not telemetry.

Run: python python/test_opf_structures.py
"""

import math
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "opf"))

from zero_potential import (higgs_quartic_d2, higgs_vacua, higgs_mass_sq,
                            flipped_log_d2, flipped_log_vacua,
                            logdens_d2_zero, logdens_nonzero_vacua)
from mass_mechanism import (opf_mass_sq, opf_mass, opf_stationary_point,
                            opf_hessian_eigenvalues)
from measurement_oscillation import (fixed_point_estimate, fixed_point_gain,
                                     residual, map_step)


def main() -> None:
    # --- Z1 Higgs quartic: charged void -----------------------------------
    # origin is an unstable maximum (V''(0) < 0)
    assert higgs_quartic_d2(0.0) == -1.0, "Higgs origin must be unstable (V''(0) = -mu^2)"
    # broken vacua exactly +/- sqrt(mu^2/lam) = +/-1, and 0 is the excluded origin
    v = higgs_vacua()
    assert all(abs(x) < 1e-12 or abs(abs(x) - 1.0) < 1e-12 for x in v), f"unexpected vacua {v}"
    # mass-squared at the broken vacuum = 2 mu^2 = 2
    assert abs(higgs_mass_sq() - 2.0) < 1e-12, "Higgs broken-vacuum m^2 must be 2 mu^2"

    # --- Z2 flipped log-density: charged void, complementarity ------------
    # origin unstable: V''(0) = 2(kappa - 1) = -1 at kappa = 1/2
    assert abs(flipped_log_d2(0.0) + 1.0) < 1e-12, "flipped-log origin must be unstable"
    # real vacua at +/- sqrt(1/kappa - 1) = +/-1
    vfl = [x for x in flipped_log_vacua() if abs(x) > 1e-12]
    assert len(vfl) == 2 and all(abs(abs(x) - 1.0) < 1e-12 for x in vfl), f"flipped-log vacua wrong {vfl}"

    # --- Z-null: original log-density is a structural contradiction -------
    # V''(0) = 2(1 - kappa); instability of origin needs kappa > 1,
    # real nonzero vacua need kappa < 1 -> cannot have both.
    assert logdens_d2_zero(0.5) == 1.0, "log-density V''(0) at kappa=1/2 must be +1"
    assert len(logdens_nonzero_vacua(2.0)) == 0, "kappa=2 gives origin unstable but no real vacua"
    assert len(logdens_nonzero_vacua(0.5)) == 2, "kappa=1/2 gives real vacua but stable origin"

    # --- Mass mechanism: rho is a Lagrange multiplier, r carries mass -----
    assert opf_stationary_point() == (0.0, 1.0, 0.0), "OPF stationary point must be (0,1,0)"
    # Hessian eigenvalues {-1, +1, +2}; +2 is the r-axis (mass lives in r)
    assert opf_hessian_eigenvalues() == (-1.0, 1.0, 2.0), "Hessian eigs must be {-1,+1,+2}"
    # m_r^2 = 2 chi0 / mu_g; chi0=1, mu_g=1 -> 2, m_r = sqrt(2)
    assert abs(opf_mass_sq(1.0, 1.0) - 2.0) < 1e-12, "m_r^2 must be 2 chi0 / mu_g"
    assert abs(opf_mass(1.0, 2.0) - 1.0) < 1e-12, "m_r = sqrt(2*1/2) = 1"

    # --- Measurement oscillation: closure gap is convergent ---------------
    xstar = fixed_point_estimate()
    # fixed point of x = (3/2) sin x ~ 1.49578157
    assert abs(xstar - 1.49578157) < 1e-6, f"fixed point off: {xstar}"
    # local contraction: |eps cos x*| < 1
    g = fixed_point_gain(xstar)
    assert g < 1.0, f"fixed point must be a contraction (gain {g})"
    # residual at the fixed point is ~0 (closure, not a mass gap)
    assert residual(xstar) < 1e-6, "closure residual must vanish at the fixed point"
    # the map truly contracts: |r_{n+1} - x*| < |r_n - x*|
    x0 = 0.7
    x1 = map_step(x0)
    assert abs(x1 - xstar) < abs(x0 - xstar), "one map step must shrink distance to fixed point"

    print("zero-potential:   charged void + structural null    OK")
    print("mass-mechanism:   rho = multiplier, r carries mass  OK")
    print("measurement:      closure gap converges (not a mass gap) OK")
    print("ALL OPF STRUCTURE TESTS PASS")


if __name__ == "__main__":
    main()
