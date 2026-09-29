/** Radix-2 FFT magnitude spectrum for educational demos (power-of-two lengths). */

export type Complex = { re: number; im: number };

function assertPowerOfTwo(n: number): void {
  if (n < 2 || (n & (n - 1)) !== 0) {
    throw new Error('FFT length must be a power of two >= 2');
  }
}

/** In-place Cooley–Tukey radix-2 FFT. `inverse` selects the inverse transform. */
export function fftInPlace(buffer: Complex[], inverse = false): void {
  const n = buffer.length;
  assertPowerOfTwo(n);

  // Bit-reversal permutation
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      const tmp = buffer[i]!;
      buffer[i] = buffer[j]!;
      buffer[j] = tmp;
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len;
    const wLen: Complex = { re: Math.cos(ang), im: Math.sin(ang) };
    for (let i = 0; i < n; i += len) {
      let w: Complex = { re: 1, im: 0 };
      for (let j = 0; j < len / 2; j += 1) {
        const u = buffer[i + j]!;
        const v = buffer[i + j + len / 2]!;
        const t: Complex = {
          re: v.re * w.re - v.im * w.im,
          im: v.re * w.im + v.im * w.re,
        };
        buffer[i + j] = { re: u.re + t.re, im: u.im + t.im };
        buffer[i + j + len / 2] = { re: u.re - t.re, im: u.im - t.im };
        const nextW: Complex = {
          re: w.re * wLen.re - w.im * wLen.im,
          im: w.re * wLen.im + w.im * wLen.re,
        };
        w = nextW;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i += 1) {
      buffer[i] = { re: buffer[i]!.re / n, im: buffer[i]!.im / n };
    }
  }
}

/**
 * One-sided magnitude spectrum for a real-valued buffer.
 * Returns `n/2 + 1` bins covering DC through Nyquist.
 */
export function fftMagnitude(samples: ArrayLike<number>): Float64Array {
  const n = samples.length;
  assertPowerOfTwo(n);

  const buffer: Complex[] = Array.from({ length: n }, (_, i) => ({
    re: samples[i] ?? 0,
    im: 0,
  }));
  fftInPlace(buffer, false);

  const bins = n / 2 + 1;
  const magnitude = new Float64Array(bins);
  for (let k = 0; k < bins; k += 1) {
    const { re, im } = buffer[k]!;
    // Normalize so a unit-amplitude sine peaks near 0.5 (two-sided energy).
    magnitude[k] = Math.hypot(re, im) / n;
  }
  return magnitude;
}

/** Frequency in Hz for FFT bin `k` given sample rate and transform length. */
export function binFrequencyHz(bin: number, sampleRateHz: number, fftSize: number): number {
  if (!(sampleRateHz > 0) || fftSize < 2) {
    throw new Error('sampleRateHz must be > 0 and fftSize >= 2');
  }
  return (bin * sampleRateHz) / fftSize;
}

/** Index of the largest magnitude bin (excluding optional DC if desired by caller). */
export function peakBin(magnitude: ArrayLike<number>, fromBin = 0): number {
  let best = fromBin;
  let bestValue = -Infinity;
  for (let i = fromBin; i < magnitude.length; i += 1) {
    const value = magnitude[i] ?? -Infinity;
    if (value > bestValue) {
      bestValue = value;
      best = i;
    }
  }
  return best;
}
