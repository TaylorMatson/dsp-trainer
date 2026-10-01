import { describe, expect, it } from 'vitest';

import { DEFAULT_OUTPUT_SAMPLE_RATE_HZ } from '@/constants/AvTheme';
import {
  applyTeachingFilter,
  generateSineSamples,
  normalizePeak,
  resampleLinear,
} from '@/signal';

/** Estimate dominant frequency via zero-crossing rate (rough but stable for sines). */
function estimateHz(buf: ArrayLike<number>, sampleRateHz: number): number {
  let crossings = 0;
  for (let i = 1; i < buf.length; i += 1) {
    const a = buf[i - 1] ?? 0;
    const b = buf[i] ?? 0;
    if (a === 0 || a * b < 0) crossings += 1;
  }
  const durationSec = buf.length / sampleRateHz;
  return crossings / 2 / durationSec;
}

describe('filter demo audible path', () => {
  it('keeps labeled tone Hz as heard pitch after filter+resample', () => {
    const analysisFs = 8000;
    const low = 220;
    const high = 2000;
    const outRate = DEFAULT_OUTPUT_SAMPLE_RATE_HZ;
    const teachingCount = Math.round(0.25 * analysisFs);

    const mix = (fLow: number, fHigh: number) => {
      const a = generateSineSamples({
        frequencyHz: fLow,
        sampleRateHz: analysisFs,
        amplitude: 0.55,
        sampleCount: teachingCount,
      });
      const b = generateSineSamples({
        frequencyHz: fHigh,
        sampleRateHz: analysisFs,
        amplitude: 0.45,
        sampleCount: teachingCount,
      });
      const mixed = new Float64Array(teachingCount);
      for (let i = 0; i < teachingCount; i += 1) {
        mixed[i] = (a[i] ?? 0) + (b[i] ?? 0);
      }
      return mixed;
    };

    // Unfiltered low alone → resample must preserve absolute Hz (±tolerance).
    const lowOnly = generateSineSamples({
      frequencyHz: low,
      sampleRateHz: analysisFs,
      amplitude: 0.55,
      sampleCount: teachingCount,
    });
    const audibleLow = resampleLinear(lowOnly, analysisFs, outRate);
    expect(estimateHz(audibleLow, outRate)).toBeGreaterThan(low * 0.85);
    expect(estimateHz(audibleLow, outRate)).toBeLessThan(low * 1.15);

    const highOnly = generateSineSamples({
      frequencyHz: high,
      sampleRateHz: analysisFs,
      amplitude: 0.55,
      sampleCount: teachingCount,
    });
    const audibleHigh = resampleLinear(highOnly, analysisFs, outRate);
    expect(estimateHz(audibleHigh, outRate)).toBeGreaterThan(high * 0.85);
    expect(estimateHz(audibleHigh, outRate)).toBeLessThan(high * 1.15);

    const mixed = mix(low, high);
    for (const family of ['fir', 'iir'] as const) {
      for (const kind of ['lowpass', 'highpass'] as const) {
        const strength = family === 'fir' ? 5 : 0.2;
        const filtered = applyTeachingFilter(mixed, family, kind, strength);
        const audible = normalizePeak(
          resampleLinear(filtered, analysisFs, outRate),
          0.55,
        );
        let peak = 0;
        for (let i = 0; i < audible.length; i += 1) {
          peak = Math.max(peak, Math.abs(audible[i] ?? 0));
        }
        expect(peak, `${family}-${kind}`).toBeGreaterThan(0.4);

        const heard = estimateHz(audible, outRate);
        if (kind === 'lowpass') {
          // LP should land near the low labeled tone, not a remapped kHz value.
          expect(heard, `${family}-${kind}`).toBeLessThan(800);
          expect(heard, `${family}-${kind}`).toBeGreaterThan(100);
        } else {
          // HP should emphasize the high labeled tone.
          expect(heard, `${family}-${kind}`).toBeGreaterThan(800);
        }
      }
    }
  });
});

describe('convolution burst audible path', () => {
  it('preserves burst frequency through resample so pitch matches the slider', () => {
    const analysisFs = 4000;
    const frequencyHz = 400;
    const burstLen = 320;
    const live = Math.floor((burstLen * 3) / 4);
    const signal = generateSineSamples({
      frequencyHz,
      sampleRateHz: analysisFs,
      amplitude: 0.9,
      sampleCount: burstLen,
    });
    const burst = new Float64Array(burstLen);
    for (let i = 0; i < live; i += 1) {
      burst[i] = signal[i] ?? 0;
    }
    const audible = resampleLinear(burst, analysisFs, DEFAULT_OUTPUT_SAMPLE_RATE_HZ);
    const heard = estimateHz(audible.slice(0, Math.floor(audible.length * 0.7)), DEFAULT_OUTPUT_SAMPLE_RATE_HZ);
    expect(heard).toBeGreaterThan(frequencyHz * 0.8);
    expect(heard).toBeLessThan(frequencyHz * 1.2);
  });
});

describe('sine generator teaching-rate path', () => {
  it('changes audible content when sample rate crosses Nyquist for a fixed tone', () => {
    const frequencyHz = 600;
    const durationSec = 0.2;
    const outRate = DEFAULT_OUTPUT_SAMPLE_RATE_HZ;

    const render = (fs: number) => {
      const count = Math.max(64, Math.round(fs * durationSec));
      const teaching = generateSineSamples({
        frequencyHz,
        sampleRateHz: fs,
        amplitude: 0.55,
        sampleCount: count,
      });
      return resampleLinear(teaching, fs, outRate);
    };

    const aboveNyquist = render(800); // Nyquist 400 < 600 → alias
    const belowNyquist = render(2000); // Nyquist 1000 > 600 → true tone
    expect(aboveNyquist.length).toBeGreaterThan(100);
    expect(belowNyquist.length).toBeGreaterThan(100);

    const crossings = (buf: Float32Array) => {
      let n = 0;
      for (let i = 1; i < buf.length; i += 1) {
        const a = buf[i - 1] ?? 0;
        const b = buf[i] ?? 0;
        if (a === 0 || a * b < 0) n += 1;
      }
      return n;
    };
    expect(Math.abs(crossings(aboveNyquist) - crossings(belowNyquist))).toBeGreaterThan(10);
  });
});
