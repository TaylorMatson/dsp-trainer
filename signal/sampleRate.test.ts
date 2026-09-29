import { describe, expect, it } from 'vitest';

import { aliasedFrequencyHz, isAliasing, nyquistHz } from './sampleRate';

describe('nyquistHz', () => {
  it('is half the sample rate', () => {
    expect(nyquistHz(48_000)).toBe(24_000);
    expect(nyquistHz(1000)).toBe(500);
  });

  it('rejects non-positive sample rate', () => {
    expect(() => nyquistHz(0)).toThrow(/sampleRateHz/);
  });
});

describe('isAliasing', () => {
  it('is false below Nyquist and true at/above', () => {
    expect(isAliasing(200, 1000)).toBe(false);
    expect(isAliasing(500, 1000)).toBe(true);
    expect(isAliasing(900, 1000)).toBe(true);
  });
});

describe('aliasedFrequencyHz', () => {
  it('passes frequencies below Nyquist through', () => {
    expect(aliasedFrequencyHz(200, 1000)).toBe(200);
  });

  it('folds 900 Hz at 1 kHz sample rate to 100 Hz', () => {
    expect(aliasedFrequencyHz(900, 1000)).toBeCloseTo(100, 10);
  });

  it('folds exactly at sample rate toward DC', () => {
    expect(aliasedFrequencyHz(1000, 1000)).toBeCloseTo(0, 10);
  });
});
