import { describe, expect, it } from 'vitest';

import { binFrequencyHz, fftMagnitude, peakBin } from './fft';
import { generateSineSamples } from './sine';

describe('fftMagnitude', () => {
  it('peaks near DC for a constant signal', () => {
    const samples = new Float64Array(64).fill(1);
    const mag = fftMagnitude(samples);
    expect(peakBin(mag)).toBe(0);
    expect(mag[0]).toBeGreaterThan(0.9);
  });

  it('peaks at the expected bin for a pure sine', () => {
    const fftSize = 256;
    const sampleRateHz = 256;
    const frequencyHz = 16;
    const samples = generateSineSamples({
      frequencyHz,
      sampleRateHz,
      sampleCount: fftSize,
    });
    const mag = fftMagnitude(samples);
    const peak = peakBin(mag, 1);
    expect(binFrequencyHz(peak, sampleRateHz, fftSize)).toBeCloseTo(frequencyHz, 6);
    expect(mag[peak]!).toBeGreaterThan(0.4);
  });

  it('rejects non power-of-two lengths', () => {
    expect(() => fftMagnitude(new Float64Array(3))).toThrow(/power of two/);
  });
});
