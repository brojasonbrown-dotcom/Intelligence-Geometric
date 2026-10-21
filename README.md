# Intelligence-Geometric — the proven-functional core

This repo holds **only code that carries a verification signature** — every module
has a passing test that asserts *real behaviour*, not telemetry. Nothing enters
"because it exists elsewhere." No dead outputs, no code for show.

> Governing rule (from the RHUFT vision): *nothing is asserted unless it carries a
> verification signature.*

## Admission criterion

A module may be committed here **only** when all three hold:

1. **It does something consumed** — its output changes a decision or a state, not just a report.
2. **A test asserts that behaviour** — deterministic, in `test/` (TS) or `python/` (Py).
3. **Provenance is recorded** — where it came from and its proof, in `docs/PROVENANCE.md`.

If a piece fails any of these, it stays out until it earns its place.

## What's in (today)

| Module | What it does | Proof |
|---|---|---|
| `src/core/phi.ts` | Golden-ratio constants + the two identities the control surface relies on | `test/phi.test.ts`, Wolfram exact (PROVENANCE) |
| `src/control/corridor.ts` | Confidence Corridor — bounded epistemic control; **inversion-fixed** (F18/P7) | `test/corridor.test.ts` |
| `src/control/autoLearn.ts` | Confidence-gated decision: *when* to trigger a held-out learn() | `test/autoLearn.test.ts` |

## Run the tests

Node is at `C:\Program Files\nodejs`. If `npm` fails with `'"node"' is not
recognized`, add that dir to the Windows **system** PATH (one-time). Until then,
invoke the binaries through node directly:

```bash
# install dev deps
node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" install
# typecheck + tests
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
node node_modules/vitest/vitest.mjs run
```

GPU-scale property test (uses the torch venv — see `python/`):

```bash
"C:/Users/user-pc/venvs/torch/Scripts/python.exe" python/test_corridor_gpu.py
```
