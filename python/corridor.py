"""Confidence Corridor — vectorized reference (numpy/torch), bit-parallel to the
TypeScript src/control/corridor.ts. Used for GPU-scale property testing."""

PHI_INV = 0.6180339887498949
PHI_INV_SQ = 0.3819660112501051


def corridor(xp, vfe, lam, phi_caution=1.0):
    """xp is numpy or torch. vfe, lam are arrays in [0,1]. Returns a dict of
    lower, upper, effective, inverted — the same quantities as the TS version."""
    lower = xp.maximum(xp.full_like(vfe, PHI_INV_SQ), 1.0 - vfe)
    upper = xp.minimum(xp.full_like(lam, phi_caution), 1.0 - lam * PHI_INV)
    effective = xp.minimum(lower, upper)
    inverted = upper < lower
    return {"lower": lower, "upper": upper, "effective": effective, "inverted": inverted}
