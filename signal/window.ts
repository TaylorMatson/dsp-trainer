/** Window functions for leakage demos (educational, not production DSP). */

export type WindowKind = 'rectangular' | 'hann';

export function rectangularWindow(length: number): Float64Array {
  assertPositiveLength(length);
  return new Float64Array(length).fill(1);
}

/** Hann (raised-cosine) window; endpoints are zero. */
export function hannWindow(length: number): Float64Array {
  assertPositiveLength(length);
  const w = new Float64Array(length);
  if (length === 1) {
    w[0] = 1;
    return w;
  }
  for (let i = 0; i < length; i += 1) {
    w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (length - 1)));
  }
  return w;
}

export function makeWindow(kind: WindowKind, length: number): Float64Array {
  switch (kind) {
    case 'rectangular':
      return rectangularWindow(length);
    case 'hann':
      return hannWindow(length);
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/** Pointwise multiply samples by a window of equal length. */
export function applyWindow(
  samples: ArrayLike<number>,
  window: ArrayLike<number>,
): Float64Array {
  if (samples.length !== window.length) {
    throw new Error('samples and window must have the same length');
  }
  const out = new Float64Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    out[i] = (samples[i] ?? 0) * (window[i] ?? 0);
  }
  return out;
}

function assertPositiveLength(length: number): void {
  if (!(length >= 1) || !Number.isInteger(length)) {
    throw new Error('window length must be an integer >= 1');
  }
}
