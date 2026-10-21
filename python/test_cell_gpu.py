"""GPU-scale contraction certificate for the nine-term cell.

Runs 100,000 random complex fields (233 nodes each) through the undriven cell map
on the GPU and asserts, for every field, that the realized max-norm gain never
exceeds the Jury gain (and in fact the tighter true gain |C|), then iterates to
confirm they all converge to the zero fixed point.

Run: "C:/Users/user-pc/venvs/torch/Scripts/python.exe" python/test_cell_gpu.py
"""
import torch

from cell import homo_step, C, JURY_GAIN


def main() -> None:
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    g = torch.Generator(device=dev).manual_seed(1618)
    B, n = 100_000, 233
    # float64 to match the TS reference precision (float32 ~1e-7 is too coarse
    # for the gain <= |C| + 1e-9 certificate).
    re = (torch.rand(B, n, generator=g, device=dev, dtype=torch.float64) * 2 - 1) * 3
    im = (torch.rand(B, n, generator=g, device=dev, dtype=torch.float64) * 2 - 1) * 3

    inmax = torch.sqrt(re * re + im * im).amax(dim=1)
    re1, im1 = homo_step(torch, re, im)
    peak = torch.sqrt(re1 * re1 + im1 * im1).amax(dim=1)
    gain = peak / torch.clamp(inmax, min=1e-30)

    # every field contracts by <= the true gain |C| (and hence <= JURY_GAIN)
    assert bool((gain <= abs(C) + 1e-9).all()), "homogeneous |C| contraction violated"
    assert bool((gain <= JURY_GAIN + 1e-9).all()), "Jury gain violated"

    # iterate the undriven map: all 100k fields must collapse to the 0 fixed point
    r, i = re, im
    for _ in range(40):
        r, i = homo_step(torch, r, i)
    final = float(torch.sqrt(r * r + i * i).amax())

    print(f"device={dev}  B={B:,}  n={n}")
    print(f"max realized gain over all fields = {float(gain.max()):.6f}  |C|={abs(C):.6f}  JURY={JURY_GAIN:.6f}")
    print(f"after 40 undriven steps, max |z| across all fields = {final:.3e}")
    assert final < 1e-9, "did not converge to the zero fixed point"
    print("CONTRACTION CERTIFICATE HOLDS at 100,000-field scale (gain <= |C| everywhere, converges to 0)")


if __name__ == "__main__":
    main()
