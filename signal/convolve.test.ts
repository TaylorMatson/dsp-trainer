import { describe, expect, it } from 'vitest';

import {
  applyImpulseResponse,
  convolve,
  makeEchoKernel,
  makeImpulse,
} from './convolve';

describe('convolve helpers', () => {
  it('convolves two short sequences', () => {
    const out = convolve([1, 2, 3], [1, 1]);
    expect(Array.from(out)).toEqual([1, 3, 5, 3]);
  });

  it('returns the signal when convolved with a unit impulse', () => {
    const signal = new Float64Array([0.5, -1, 2]);
    const out = applyImpulseResponse(signal, makeImpulse(1));
    expect(Array.from(out)).toEqual([0.5, -1, 2]);
  });

  it('builds an echo kernel and adds a delayed copy', () => {
    const kernel = makeEchoKernel(2, 0.5);
    expect(Array.from(kernel)).toEqual([1, 0, 0.5]);
    const out = convolve([1, 0, 0, 0], kernel);
    expect(out[0]).toBeCloseTo(1, 10);
    expect(out[2]).toBeCloseTo(0.5, 10);
  });

  it('returns empty output for empty inputs', () => {
    expect(convolve([], [1, 2]).length).toBe(0);
    expect(convolve([1], []).length).toBe(0);
  });
});
