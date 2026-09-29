/** Sample-rate and Nyquist helpers for educational demos. */

/** Highest frequency representable without aliasing at the given sample rate. */
export function nyquistHz(sampleRateHz: number): number {
  if (!(sampleRateHz > 0)) {
    throw new Error('sampleRateHz must be > 0');
  }
  return sampleRateHz / 2;
}

/** True when frequency sits at or above Nyquist (cannot be uniquely sampled). */
export function isAliasing(frequencyHz: number, sampleRateHz: number): boolean {
  if (!(frequencyHz > 0)) {
    throw new Error('frequencyHz must be > 0');
  }
  return frequencyHz >= nyquistHz(sampleRateHz);
}

/**
 * Fold a frequency into the principal alias band (0, Nyquist].
 * Uses repeated reflection across multiples of the Nyquist boundary.
 */
export function aliasedFrequencyHz(frequencyHz: number, sampleRateHz: number): number {
  if (!(frequencyHz > 0)) {
    throw new Error('frequencyHz must be > 0');
  }
  const nyquist = nyquistHz(sampleRateHz);
  if (frequencyHz <= nyquist) {
    return frequencyHz;
  }

  const period = sampleRateHz;
  let folded = frequencyHz % period;
  if (folded < 0) {
    folded += period;
  }
  if (folded > nyquist) {
    folded = period - folded;
  }
  return folded;
}
