import { describe, expect, it } from 'vitest';

import {
  applyTeachingFilter,
  firFirstDifference,
  firMovingAverage,
  iirOnePoleHighpass,
  iirOnePoleLowpass,
} from './filters';
import { generateSineSamples } from './sine';

describe('filter helpers', () => {
  it('FIR moving average smooths a spike', () => {
    const samples = new Float64Array([0, 0, 10, 0, 0]);
    const out = firMovingAverage(samples, 3);
    // Causal taps: y[n] averages x[n], x[n-1], x[n-2].
    expect(out[2]!).toBeCloseTo(10 / 3, 6);
    expect(out[4]!).toBeCloseTo(10 / 3, 6);
    expect(out[0]!).toBeCloseTo(0, 6);
  });

  it('FIR first difference zeros a constant', () => {
    const samples = new Float64Array([3, 3, 3, 3]);
    const out = firFirstDifference(samples);
    expect(out[0]).toBe(3);
    expect(out[1]).toBeCloseTo(0, 10);
    expect(out[3]).toBeCloseTo(0, 10);
  });

  it('IIR lowpass attenuates a high-frequency sine vs a low one', () => {
    const n = 128;
    const low = generateSineSamples({
      frequencyHz: 2,
      sampleRateHz: 128,
      sampleCount: n,
    });
    const high = generateSineSamples({
      frequencyHz: 40,
      sampleRateHz: 128,
      sampleCount: n,
    });
    const lowOut = iirOnePoleLowpass(low, 0.05);
    const highOut = iirOnePoleHighpass(high, 0.05);
    const lowEnergy = energy(lowOut);
    const highHpEnergy = energy(highOut);
    expect(lowEnergy).toBeGreaterThan(1);
    expect(highHpEnergy).toBeGreaterThan(1);
    const highLp = iirOnePoleLowpass(high, 0.05);
    expect(energy(highLp)).toBeLessThan(energy(lowOut));
  });

  it('applyTeachingFilter routes FIR and IIR kinds', () => {
    const samples = new Float64Array([1, 2, 3, 4]);
    expect(applyTeachingFilter(samples, 'fir', 'lowpass', 2).length).toBe(4);
    expect(applyTeachingFilter(samples, 'fir', 'highpass', 1).length).toBe(4);
    expect(applyTeachingFilter(samples, 'iir', 'lowpass', 0.2).length).toBe(4);
    expect(applyTeachingFilter(samples, 'iir', 'highpass', 0.2).length).toBe(4);
  });
});

function energy(samples: ArrayLike<number>): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const v = samples[i] ?? 0;
    sum += v * v;
  }
  return sum;
}
