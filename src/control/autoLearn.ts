/**
 * Confidence-gated auto-learning decision: decides WHEN a system should run a
 * (held-out-gated) learning pass, from the live coherence read through the
 * Confidence Corridor. A STABLE field exploits and never relearns; a field that
 * stays below the corridor's φ^-1 ceiling is under-confident and, once that
 * persists for `patience` checks and the `cooldown` has elapsed, asks to learn.
 *
 * Deterministic: the decision depends only on (tick, confidence, state). This is
 * the control policy only — the actual learning pass it gates is responsible for
 * its own held-out safety, so this can only change cadence, never correctness.
 *
 * Proof: test/autoLearn.test.ts.
 */
import { corridor } from './corridor';

export interface AutoLearnOptions {
  /** Ticks between checks (coarse — learning is costly). Default 233. */
  stride?: number;
  /** Consecutive sub-STABLE checks required before learning. Default 2. */
  patience?: number;
  /** Minimum ticks between two learning passes. Default 1597. */
  cooldown?: number;
  /**
   * Optional confidence floor. Omitted (the real path) → the corridor's STABLE
   * classification decides. Set → a check is "low" iff confidence < floor.
   */
  floor?: number;
}

export interface AutoLearnState {
  lowStreak: number;
  lastLearnTick: number;
}

export const AUTO_LEARN_STRIDE = 233;
export const AUTO_LEARN_PATIENCE = 2;
export const AUTO_LEARN_COOLDOWN = 1597;

export function newAutoLearnState(): AutoLearnState {
  return { lowStreak: 0, lastLearnTick: Number.NEGATIVE_INFINITY };
}

/**
 * Returns true iff a learning pass should fire this tick. Mutates `state`
 * (streak + last-learn tick) so repeated calls form the control loop.
 */
export function decideAutoLearn(
  tick: number,
  confidence: number,
  state: AutoLearnState,
  opts: AutoLearnOptions = {},
): boolean {
  const patience = opts.patience ?? AUTO_LEARN_PATIENCE;
  const cooldown = opts.cooldown ?? AUTO_LEARN_COOLDOWN;
  const stable =
    opts.floor === undefined
      ? corridor().classify(confidence) === 'STABLE'
      : confidence >= opts.floor;
  if (stable) {
    state.lowStreak = 0;
    return false;
  }
  state.lowStreak += 1;
  if (state.lowStreak < patience) return false;
  if (tick - state.lastLearnTick < cooldown) return false;
  state.lowStreak = 0;
  state.lastLearnTick = tick;
  return true;
}
