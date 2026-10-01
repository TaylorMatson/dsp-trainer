import { describe, expect, it } from 'vitest';

import { fftMagnitude, generateSineSamples, peakBin } from '@/signal';

/** Must match SpectrumVisualizer FFT length. */
const SPECTRUM_FFT_SIZE = 128;

describe('spectrum demo leakage defaults', () => {
  it('shows measurable side energy at the curriculum default off-bin tone', () => {
    const frequencyHz = 17.5;
    const sampleRateHz = 256;
    const samples = generateSineSamples({
      frequencyHz,
      sampleRateHz,
      sampleCount: SPECTRUM_FFT_SIZE,
    });
    const magnitude = fftMagnitude(samples);
    const peak = peakBin(magnitude, 1);
    let side = 0;
    let total = 0;
    for (let i = 1; i < magnitude.length; i += 1) {
      const v = magnitude[i] ?? 0;
      const e = v * v;
      total += e;
      if (Math.abs(i - peak) > 1) side += e;
    }
    const ratio = total > 0 ? side / total : 0;
    expect(ratio).toBeGreaterThan(0.05);

    // On-bin control: integer cycles collapse most side energy.
    const clean = generateSineSamples({
      frequencyHz: 16,
      sampleRateHz,
      sampleCount: SPECTRUM_FFT_SIZE,
    });
    const cleanMag = fftMagnitude(clean);
    const cleanPeak = peakBin(cleanMag, 1);
    let cleanSide = 0;
    let cleanTotal = 0;
    for (let i = 1; i < cleanMag.length; i += 1) {
      const v = cleanMag[i] ?? 0;
      const e = v * v;
      cleanTotal += e;
      if (Math.abs(i - cleanPeak) > 1) cleanSide += e;
    }
    const cleanRatio = cleanTotal > 0 ? cleanSide / cleanTotal : 0;
    expect(ratio).toBeGreaterThan(cleanRatio * 2);
  });
});
