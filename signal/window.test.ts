import { describe, expect, it } from 'vitest';

import { applyWindow, hannWindow, makeWindow, rectangularWindow } from './window';

describe('window helpers', () => {
  it('builds a rectangular window of ones', () => {
    expect(Array.from(rectangularWindow(4))).toEqual([1, 1, 1, 1]);
  });

  it('builds a Hann window that is zero at the ends', () => {
    const w = hannWindow(5);
    expect(w[0]).toBeCloseTo(0, 10);
    expect(w[4]).toBeCloseTo(0, 10);
    expect(w[2]!).toBeGreaterThan(0.9);
  });

  it('applies a window pointwise', () => {
    const samples = new Float64Array([2, 2, 2, 2]);
    const windowed = applyWindow(samples, makeWindow('rectangular', 4));
    expect(Array.from(windowed)).toEqual([2, 2, 2, 2]);
    const hanned = applyWindow(samples, hannWindow(4));
    expect(hanned[0]).toBeCloseTo(0, 10);
    expect(hanned[3]).toBeCloseTo(0, 10);
  });

  it('rejects mismatched lengths', () => {
    expect(() => applyWindow([1, 2], [1])).toThrow(/same length/);
  });
});
