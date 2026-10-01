import { describe, expect, it } from 'vitest';

import { DEFAULT_OUTPUT_SAMPLE_RATE_HZ } from '@/constants/AvTheme';
import {
  applyTeachingFilter,
  audibleFrequencyHz,
  generateSineSamples,
  normalizePeak,
  resampleLinear,
} from '@/signal';

describe('filter demo audible path', () => {
  it('maps teaching tones into an audible filtered mix with usable peak', () => {
    const analysisFs = 128;
    const low = 4;
    const high = 32;
    const playLow = audibleFrequencyHz(low, analysisFs, DEFAULT_OUTPUT_SAMPLE_RATE_HZ);
    const playHigh = audibleFrequencyHz(high, analysisFs, DEFAULT_OUTPUT_SAMPLE_RATE_HZ);
    expect(playLow).toBeGreaterThan(80);
    expect(playHigh).toBeGreaterThan(playLow);

    const count = Math.round(0.25 * DEFAULT_OUTPUT_SAMPLE_RATE_HZ);
    const a = generateSineSamples({
      frequencyHz: playLow,
      sampleRateHz: DEFAULT_OUTPUT_SAMPLE_RATE_HZ,
      amplitude: 0.55,
      sampleCount: count,
    });
    const b = generateSineSamples({
      frequencyHz: playHigh,
      sampleRateHz: DEFAULT_OUTPUT_SAMPLE_RATE_HZ,
      amplitude: 0.45,
      sampleCount: count,
    });
    const mixed = new Float64Array(count);
    for (let i = 0; i < count; i += 1) {
      mixed[i] = (a[i] ?? 0) + (b[i] ?? 0);
    }

    for (const family of ['fir', 'iir'] as const) {
      for (const kind of ['lowpass', 'highpass'] as const) {
        const strength = family === 'fir' ? 5 : 0.2;
        const filtered = applyTeachingFilter(mixed, family, kind, strength);
        const audible = normalizePeak(filtered, 0.55);
        let peak = 0;
        for (let i = 0; i < audible.length; i += 1) {
          peak = Math.max(peak, Math.abs(audible[i] ?? 0));
        }
        expect(peak, `${family}-${kind}`).toBeGreaterThan(0.4);
      }
    }
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
