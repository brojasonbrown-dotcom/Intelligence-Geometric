# Provenance — where each module came from and how it is proven

Every row is a module that meets the admission criterion (consumed · tested · recorded).

| Module | Origin | Proof (signature) | Status |
|---|---|---|---|
| `src/core/phi.ts` | RHUFT constants; METATRON `core/constants.ts` | `test/phi.test.ts` (4 identities); Wolfram exact: `GoldenRatio` → `1/φ`, `1−1/φ`, `φ²−φ−1==0` | PROVEN |
| `src/control/corridor.ts` | METATRON `omega/packages/trnn-core/src/substrate/phiSubstrate.ts` `corridor()` — inversion-fixed here (F18/P7) | `test/corridor.test.ts` (default span, inversion guard, 2601-point property); `python/test_corridor_gpu.py` (10M-point GPU sweep) | PROVEN |
| `src/control/autoLearn.ts` | New controller; wired + proven in METATRON host (`runtime/host.ts`, default-OFF, s0-oracle + P9 digest-identical) | `test/autoLearn.test.ts` (6 cases: patience, cooldown, hysteresis, floor) | PROVEN |
| `src/engine/complex.ts` | METATRON `core/complex.ts` (only the subset cellStep + tests use) | used by `cell.ts`; exercised by `test/cell.test.ts` | PROVEN |
| `src/engine/constants.ts` + `src/engine/dmath.ts` | METATRON `core/constants.ts`, `core/dmath.ts` | `test/cell.test.ts` asserts JURY_GAIN = frozen 0.7507764050037855 < 1 | PROVEN |
| `src/engine/cell.ts` | METATRON `cell/update.ts` (verbatim nine-term cell) | `test/cell.test.ts` (4 proofs: Jury gain, max-norm contraction, Banach two-trajectory at \|α−ε−ζ\|, driven ISS bound); `python/test_cell_gpu.py` (100k-field GPU certificate) | PROVEN |
| `python/opf/zero_potential.py` | RHUFT static-potential audit (M1–M3b) — the "charged void" | `python/test_opf_structures.py` (unstable origin, closed-form broken vacua ±√(μ²/λ), m²=2μ², and the M3a structural null) | PROVEN |
| `python/opf/mass_mechanism.py` | RHUFT part-3 mass mechanisms — ρ is a Lagrange multiplier, mass lives in r | `python/test_opf_structures.py` (stationary point (0,1,0), Hessian eigs {−1,+1,+2}, m_r² = 2χ₀/μ_g) | PROVEN |
| `python/opf/measurement_oscillation.py` | RHUFT measurement oscillation — closure gap | `python/test_opf_structures.py` (fixed point 1.49578157, local contraction gain < 1, vanishing residual) | PROVEN |

## Deliberately NOT yet admitted (earns entry only with a behavioural test here)

These are real candidates from the METATRON engine, held out until re-proven in this repo:

- **Memory EMA + closure** (`cell/memory.ts`, `cell/closure.ts`) — the drive terms (zhat, Pi) the full driven cell consumes.
- **Coherence measurement** (`measure/selfMeasure.ts`) — the real signal that feeds `vfeNorm = 1 − coherence`.
- **Oja plasticity** (`substrate/plasticity.ts`) — admitted only once its output is wired to something consumed (today it is computed-then-dropped in the engine).

## Explicitly excluded (dead / telemetry-only in the source engine)

Per the no-dead-code rule, these are NOT ported: unused `gateScale` wiring, causal/Granger report-only stack, orphaned modules, and the VFE envelope that was measured and shipped DISABLED.

## Not admitted (research artifacts, held out of this repo)

These are real but are either ansatz-without-behavioural-test or exploratory output and stay in
`~/Desktop/Testing/October-Research/consolidated`, not here:

- **Scale ladder** (`part1_scale_dynamics.py`) — φ-octave exponents are postulated [H], no independent test.
- **Master dashboard** (`metatron_master_physics.py`) — a report/plot, not a consumed behaviour.
- **Wolfram harness** (`opf_observer_test_harness.wl`) — derivation tooling, not a runtime behaviour.
