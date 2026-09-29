import { describe, expect, it } from 'vitest';

import { generateSineSamples, peakAmplitude } from './sine';

describe('generateSineSamples', () => {
  it('produces a unit-amplitude sine near peak ±1', () => {
    const samples = generateSineSamples({
      frequencyHz: 440,
      sampleRateHz: 48_000,
      sampleCount: 480,
      amplitude: 1,
    });

    expect(samples.length).toBe(480);
    expect(peakAmplitude(samples)).toBeGreaterThan(0.99);
    expect(peakAmplitude(samples)).toBeLessThanOrEqual(1);
  });

  it('rejects non-positive frequency', () => {
    expect(() =>
      generateSineSamples({
        frequencyHz: 0,
        sampleRateHz: 48_000,
        sampleCount: 16,
      }),
    ).toThrow(/frequencyHz/);
  });
});
