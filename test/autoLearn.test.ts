import { describe, expect, it } from 'vitest';
import { decideAutoLearn, newAutoLearnState, AUTO_LEARN_STRIDE } from '../src/control/autoLearn';

describe('autoLearn · confidence-gated decision', () => {
  it('a STABLE field never asks to relearn and holds the streak at zero', () => {
    const s = newAutoLearnState();
    expect(decideAutoLearn(1000, 0.95, s, { patience: 2, cooldown: 1 })).toBe(false);
    expect(decideAutoLearn(1001, 0.7, s, { patience: 2, cooldown: 1 })).toBe(false);
    expect(s.lowStreak).toBe(0);
  });

  it('fires only after `patience` consecutive sub-STABLE checks', () => {
    const s = newAutoLearnState();
    expect(decideAutoLearn(10, 0.5, s, { patience: 2, cooldown: 1 })).toBe(false);
    expect(decideAutoLearn(11, 0.5, s, { patience: 2, cooldown: 1 })).toBe(true);
    expect(s.lastLearnTick).toBe(11);
  });

  it('respects the cooldown between two learns', () => {
    const s = newAutoLearnState();
    expect(decideAutoLearn(100, 0.1, s, { patience: 1, cooldown: 100 })).toBe(true);
    expect(decideAutoLearn(150, 0.1, s, { patience: 1, cooldown: 100 })).toBe(false);
    expect(decideAutoLearn(201, 0.1, s, { patience: 1, cooldown: 100 })).toBe(true);
  });

  it('a STABLE check between low checks breaks the streak (hysteresis)', () => {
    const s = newAutoLearnState();
    expect(decideAutoLearn(1, 0.5, s, { patience: 2, cooldown: 1 })).toBe(false);
    expect(decideAutoLearn(2, 0.9, s, { patience: 2, cooldown: 1 })).toBe(false);
    expect(s.lowStreak).toBe(0);
    expect(decideAutoLearn(3, 0.5, s, { patience: 2, cooldown: 1 })).toBe(false);
  });

  it('the floor override forces the low branch deterministically', () => {
    const s = newAutoLearnState();
    expect(decideAutoLearn(5, 0.99, s, { patience: 1, cooldown: 1, floor: 2 })).toBe(true);
  });

  it('exposes a sane default stride', () => {
    expect(AUTO_LEARN_STRIDE).toBe(233);
  });
});
