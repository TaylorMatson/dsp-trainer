/** Pure signal helpers for educational demos (synth-only v1). */

export type SineOptions = {
  frequencyHz: number;
  sampleRateHz: number;
  amplitude?: number;
  phaseRadians?: number;
  sampleCount: number;
};

/**
 * Generate one period-agnostic buffer of sine samples in [-amplitude, amplitude].
 */
export function generateSineSamples(options: SineOptions): Float64Array {
  const {
    frequencyHz,
    sampleRateHz,
    amplitude = 1,
    phaseRadians = 0,
    sampleCount,
  } = options;

  if (!(frequencyHz > 0) || !(sampleRateHz > 0) || sampleCount < 1) {
    throw new Error('frequencyHz, sampleRateHz must be > 0 and sampleCount >= 1');
  }

  const samples = new Float64Array(sampleCount);
  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRateHz;
    samples[i] = amplitude * Math.sin(2 * Math.PI * frequencyHz * t + phaseRadians);
  }
  return samples;
}

/** Peak absolute amplitude in a sample buffer. */
export function peakAmplitude(samples: ArrayLike<number>): number {
  let peak = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const abs = Math.abs(samples[i]!);
    if (abs > peak) peak = abs;
  }
  return peak;
}
