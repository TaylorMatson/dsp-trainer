/** PCM helpers for dual-rate teaching demos (analysis fs vs device output). */

/** Copy any numeric buffer into Float32 in [-1, 1] (clamped, non-finite → 0). */
export function toFloat32(samples: ArrayLike<number>): Float32Array {
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    const value = samples[i] ?? 0;
    if (!Number.isFinite(value)) {
      out[i] = 0;
      continue;
    }
    if (value > 1) out[i] = 1;
    else if (value < -1) out[i] = -1;
    else out[i] = value;
  }
  return out;
}

/**
 * Linear resample from one rate to another.
 * Preserves waveform shape so undersampled (aliased) buffers stay aliased after upsample.
 */
export function resampleLinear(
  samples: ArrayLike<number>,
  fromRateHz: number,
  toRateHz: number,
): Float32Array {
  if (!(fromRateHz > 0) || !(toRateHz > 0)) {
    throw new Error('fromRateHz and toRateHz must be > 0');
  }
  const source = toFloat32(samples);
  if (source.length === 0) {
    return new Float32Array(0);
  }
  if (fromRateHz === toRateHz) {
    return source;
  }

  const durationSec = source.length / fromRateHz;
  const outCount = Math.max(1, Math.round(durationSec * toRateHz));
  const out = new Float32Array(outCount);
  const last = source.length - 1;
  for (let i = 0; i < outCount; i += 1) {
    const srcPos = (i * fromRateHz) / toRateHz;
    const i0 = Math.min(last, Math.floor(srcPos));
    const i1 = Math.min(last, i0 + 1);
    const frac = srcPos - i0;
    const a = source[i0] ?? 0;
    const b = source[i1] ?? 0;
    out[i] = a + (b - a) * frac;
  }
  return out;
}

/** Apply a short linear fade at both ends to hide loop seams. */
export function fadeEdges(samples: Float32Array, fadeSamples: number): Float32Array {
  if (samples.length === 0 || fadeSamples <= 0) {
    return samples;
  }
  const fade = Math.min(fadeSamples, Math.floor(samples.length / 2));
  const out = new Float32Array(samples);
  for (let i = 0; i < fade; i += 1) {
    const g = i / fade;
    out[i] = (out[i] ?? 0) * g;
    const j = out.length - 1 - i;
    out[j] = (out[j] ?? 0) * g;
  }
  return out;
}

/**
 * When a teaching tone sits below an audible floor, map digital frequency
 * (f / fs) onto the output rate so the ear still hears the same relative pitch.
 */
export function audibleFrequencyHz(
  frequencyHz: number,
  analysisSampleRateHz: number,
  outputSampleRateHz: number,
  audibleFloorHz = 80,
): number {
  if (!(frequencyHz > 0) || !(analysisSampleRateHz > 0) || !(outputSampleRateHz > 0)) {
    throw new Error('frequencies and rates must be > 0');
  }
  if (frequencyHz >= audibleFloorHz) {
    return frequencyHz;
  }
  return (frequencyHz / analysisSampleRateHz) * outputSampleRateHz;
}

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Encode bytes to base64 without relying on Node `Buffer` (RN / web safe). */
export function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const a = bytes[i] ?? 0;
    const b = i + 1 < len ? (bytes[i + 1] ?? 0) : 0;
    const c = i + 2 < len ? (bytes[i + 2] ?? 0) : 0;
    const triple = (a << 16) | (b << 8) | c;
    out += BASE64_ALPHABET[(triple >> 18) & 63];
    out += BASE64_ALPHABET[(triple >> 12) & 63];
    out += i + 1 < len ? BASE64_ALPHABET[(triple >> 6) & 63] : '=';
    out += i + 2 < len ? BASE64_ALPHABET[triple & 63] : '=';
  }
  return out;
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

/** Pack mono float samples into a 16-bit PCM WAV byte buffer. */
export function encodeWavBytes(
  samples: ArrayLike<number>,
  sampleRateHz: number,
): Uint8Array {
  if (!(sampleRateHz > 0) || !Number.isFinite(sampleRateHz)) {
    throw new Error('sampleRateHz must be > 0');
  }
  const pcm = toFloat32(samples);
  const dataBytes = pcm.length * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, Math.round(sampleRateHz), true);
  view.setUint32(28, Math.round(sampleRateHz) * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataBytes, true);

  let offset = 44;
  for (let i = 0; i < pcm.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, pcm[i] ?? 0));
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, Math.round(int16), true);
    offset += 2;
  }

  return new Uint8Array(buffer);
}

/** data: URI usable by expo-audio `AudioSource.uri`. */
export function encodeWavDataUri(
  samples: ArrayLike<number>,
  sampleRateHz: number,
): string {
  const bytes = encodeWavBytes(samples, sampleRateHz);
  return `data:audio/wav;base64,${bytesToBase64(bytes)}`;
}
