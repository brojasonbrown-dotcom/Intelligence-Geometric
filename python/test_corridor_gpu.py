"""GPU-scale property test of the Confidence Corridor.

Demonstrates how the CUDA/torch stack assists verification: it runs 10 million
random (vfe, lambda) points through the corridor on the GPU and asserts the
proven invariants hold at EVERY point — a far larger sweep than a unit test can
do, in a fraction of a second. It also reports the inversion rate, reproducing
the F18 observation that the raw bounds cross for a large fraction of inputs
(which is exactly why `effective = min(lower, upper)` is the honest scalar).

Run: "C:/Users/user-pc/venvs/torch/Scripts/python.exe" python/test_corridor_gpu.py
"""
import torch

from corridor import corridor, PHI_INV_SQ


def main() -> None:
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    g = torch.Generator(device=dev).manual_seed(1618)
    n = 10_000_000
    vfe = torch.rand(n, generator=g, device=dev)
    lam = torch.rand(n, generator=g, device=dev)

    r = corridor(torch, vfe, lam, phi_caution=1.0)
    lower, upper, effective, inverted = r["lower"], r["upper"], r["effective"], r["inverted"]

    eps = 1e-6
    # P1 — lower bound stays in [φ^-2, 1]
    assert bool((lower >= PHI_INV_SQ - eps).all()) and bool((lower <= 1 + eps).all())
    # P2 — upper bound stays in [φ^-2, 1]
    assert bool((upper >= PHI_INV_SQ - eps).all()) and bool((upper <= 1 + eps).all())
    # P6 — the honest scalar never exceeds the floor (no hallucinated certainty)
    assert bool((effective <= lower + eps).all())

    inv = int(inverted.sum())
    print(f"device={dev}  n={n:,}  inverted={inv:,} ({100 * inv / n:.1f}%)")
    print("ALL INVARIANTS HOLD at 10,000,000 points (P1 bounds, P2 bounds, P6 no-hallucinated-certainty)")


if __name__ == "__main__":
    main()
