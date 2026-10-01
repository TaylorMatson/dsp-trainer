import { describe, expect, it } from 'vitest';

import {
  audibleFrequencyHz,
  bytesToBase64,
  encodeWavBytes,
  encodeWavDataUri,
  fadeEdges,
  normalizePeak,
  resampleLinear,
  toFloat32,
} from './pcm';

describe('toFloat32', () => {
  it('clamps and sanitizes non-finite values', () => {
    const out = toFloat32([2, -3, Number.NaN, 0.5]);
    expect([...out]).toEqual([1, -1, 0, 0.5]);
  });
});

describe('resampleLinear', () => {
  it('preserves constant signal across rate change', () => {
    const src = new Float32Array(4).fill(0.25);
    const out = resampleLinear(src, 1000, 2000);
    expect(out.length).toBe(8);
    for (let i = 0; i < out.length; i += 1) {
      expect(out[i]).toBeCloseTo(0.25, 5);
    }
  });

  it('keeps aliased shape when upsampling (same relative samples)', () => {
    const src = new Float32Array([0, 1, 0, -1]);
    const out = resampleLinear(src, 4, 8);
    expect(out.length).toBe(8);
    expect(out[0]).toBeCloseTo(0, 5);
    expect(out[2]).toBeCloseTo(1, 5);
    expect(out[4]).toBeCloseTo(0, 5);
    expect(out[6]).toBeCloseTo(-1, 5);
  });
});

describe('fadeEdges', () => {
  it('zeros the first and last sample for a positive fade', () => {
    const samples = new Float32Array([1, 1, 1, 1, 1, 1]);
    const faded = fadeEdges(samples, 2);
    expect(faded[0]).toBeCloseTo(0, 5);
    expect(faded[faded.length - 1]).toBeCloseTo(0, 5);
    expect(faded[2]).toBeCloseTo(1, 5);
  });
});

describe('normalizePeak', () => {
  it('scales a quiet buffer up to the target peak', () => {
    const out = normalizePeak([0.1, -0.05, 0], 0.5);
    expect(Math.max(...out.map(Math.abs))).toBeCloseTo(0.5, 5);
  });
});

describe('audibleFrequencyHz', () => {
  it('passes through already-audible tones', () => {
    expect(audibleFrequencyHz(220, 2000, 44100)).toBe(220);
  });

  it('maps sub-audible teaching tones by digital frequency', () => {
    expect(audibleFrequencyHz(16, 128, 44100)).toBeCloseTo((16 / 128) * 44100, 5);
  });
});

describe('encodeWavBytes / data URI', () => {
  it('writes a valid RIFF/WAVE header and PCM payload size', () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1]);
    const bytes = encodeWavBytes(samples, 44100);
    const ascii = String.fromCharCode(...bytes.slice(0, 4));
    expect(ascii).toBe('RIFF');
    expect(String.fromCharCode(...bytes.slice(8, 12))).toBe('WAVE');
    expect(bytes.length).toBe(44 + samples.length * 2);
    const view = new DataView(bytes.buffer);
    expect(view.getUint32(24, true)).toBe(44100);
    expect(view.getUint16(22, true)).toBe(1);
  });

  it('builds a data URI with base64 payload', () => {
    const uri = encodeWavDataUri(new Float32Array([0, 0.1]), 8000);
    expect(uri.startsWith('data:audio/wav;base64,')).toBe(true);
    const b64 = uri.slice('data:audio/wav;base64,'.length);
    expect(b64.length).toBeGreaterThan(0);
    expect(bytesToBase64(new Uint8Array([0, 0, 0]))).toMatch(/^[A-Za-z0-9+/=]+$/);
  });
});
