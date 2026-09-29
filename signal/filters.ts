/** Simple FIR / IIR helpers for LP/HP teaching demos. */

/** FIR moving-average lowpass (uniform taps, normalized). */
export function firMovingAverage(
  samples: ArrayLike<number>,
  tapCount: number,
): Float64Array {
  if (!(tapCount >= 1) || !Number.isInteger(tapCount)) {
    throw new Error('tapCount must be an integer >= 1');
  }
  const n = samples.length;
  const out = new Float64Array(n);
  const gain = 1 / tapCount;
  for (let i = 0; i < n; i += 1) {
    let sum = 0;
    for (let k = 0; k < tapCount; k += 1) {
      const idx = i - k;
      sum += idx >= 0 ? (samples[idx] ?? 0) : 0;
    }
    out[i] = sum * gain;
  }
  return out;
}

/**
 * First-difference FIR highpass (emphasizes rapid changes).
 * y[n] = x[n] - x[n-1]
 */
export function firFirstDifference(samples: ArrayLike<number>): Float64Array {
  const n = samples.length;
  const out = new Float64Array(n);
  out[0] = samples[0] ?? 0;
  for (let i = 1; i < n; i += 1) {
    out[i] = (samples[i] ?? 0) - (samples[i - 1] ?? 0);
  }
  return out;
}

/**
 * One-pole IIR lowpass.
 * y[n] = y[n-1] + alpha * (x[n] - y[n-1]), with alpha in (0, 1].
 */
export function iirOnePoleLowpass(
  samples: ArrayLike<number>,
  alpha: number,
): Float64Array {
  assertAlpha(alpha);
  const n = samples.length;
  const out = new Float64Array(n);
  let y = 0;
  for (let i = 0; i < n; i += 1) {
    const x = samples[i] ?? 0;
    y += alpha * (x - y);
    out[i] = y;
  }
  return out;
}

/**
 * One-pole IIR highpass (complement of the lowpass smoother).
 * y[n] = x[n] - lowpass(x)[n]
 */
export function iirOnePoleHighpass(
  samples: ArrayLike<number>,
  alpha: number,
): Float64Array {
  const low = iirOnePoleLowpass(samples, alpha);
  const out = new Float64Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    out[i] = (samples[i] ?? 0) - (low[i] ?? 0);
  }
  return out;
}

export type FilterFamily = 'fir' | 'iir';
export type FilterKind = 'lowpass' | 'highpass';

/** Apply a teaching filter given family + kind. */
export function applyTeachingFilter(
  samples: ArrayLike<number>,
  family: FilterFamily,
  kind: FilterKind,
  strength: number,
): Float64Array {
  switch (family) {
    case 'fir': {
      const taps = Math.max(1, Math.round(strength));
      switch (kind) {
        case 'lowpass':
          return firMovingAverage(samples, taps);
        case 'highpass':
          return firFirstDifference(samples);
        default: {
          const _exhaustive: never = kind;
          return _exhaustive;
        }
      }
    }
    case 'iir': {
      const alpha = Math.min(1, Math.max(0.02, strength));
      switch (kind) {
        case 'lowpass':
          return iirOnePoleLowpass(samples, alpha);
        case 'highpass':
          return iirOnePoleHighpass(samples, alpha);
        default: {
          const _exhaustive: never = kind;
          return _exhaustive;
        }
      }
    }
    default: {
      const _exhaustive: never = family;
      return _exhaustive;
    }
  }
}

function assertAlpha(alpha: number): void {
  if (!(alpha > 0) || alpha > 1) {
    throw new Error('alpha must be in (0, 1]');
  }
}
