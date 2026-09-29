/** Discrete convolution helpers for impulse-response intuition. */

/**
 * Full linear convolution of `signal` with `kernel`.
 * Output length is signal.length + kernel.length - 1 (or 0 if either is empty).
 */
export function convolve(
  signal: ArrayLike<number>,
  kernel: ArrayLike<number>,
): Float64Array {
  const n = signal.length;
  const m = kernel.length;
  if (n === 0 || m === 0) {
    return new Float64Array(0);
  }
  const out = new Float64Array(n + m - 1);
  for (let i = 0; i < n; i += 1) {
    const x = signal[i] ?? 0;
    for (let k = 0; k < m; k += 1) {
      out[i + k] += x * (kernel[k] ?? 0);
    }
  }
  return out;
}

/** Unit impulse (Dirac) of given length at `position` (default 0). */
export function makeImpulse(length: number, position = 0): Float64Array {
  if (!(length >= 1) || !Number.isInteger(length)) {
    throw new Error('length must be an integer >= 1');
  }
  if (position < 0 || position >= length) {
    throw new Error('position must be in [0, length)');
  }
  const out = new Float64Array(length);
  out[position] = 1;
  return out;
}

/** Simple echo kernel: identity plus a delayed, attenuated tap. */
export function makeEchoKernel(delaySamples: number, decay: number): Float64Array {
  if (!(delaySamples >= 1) || !Number.isInteger(delaySamples)) {
    throw new Error('delaySamples must be an integer >= 1');
  }
  if (!(decay >= 0) || decay > 1) {
    throw new Error('decay must be in [0, 1]');
  }
  const out = new Float64Array(delaySamples + 1);
  out[0] = 1;
  out[delaySamples] = decay;
  return out;
}

/** Convolve with an impulse — output matches the input (padded by IR length − 1). */
export function applyImpulseResponse(
  signal: ArrayLike<number>,
  impulseResponse: ArrayLike<number>,
): Float64Array {
  return convolve(signal, impulseResponse);
}
