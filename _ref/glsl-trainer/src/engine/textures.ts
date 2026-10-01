/** Procedural stand-ins for TextureStore sample and wavetable uploads.
 *  Layout matches TextureStore.loadSample / loadWavetable: width 2048,
 *  RGBA float, sample meta [width, height, sampleRate, duration]. */

export const TEX_WIDTH = 2048;

export interface PackedTexture {
  width: number;
  height: number;
  rgba: Float32Array;
  meta: [number, number, number, number];
}

export function packSample(mono: Float32Array, sampleRate: number): PackedTexture {
  const height = Math.max(1, Math.ceil(mono.length / TEX_WIDTH));
  const rgba = new Float32Array(TEX_WIDTH * height * 4);
  for (let i = 0; i < mono.length; i += 1) {
    rgba[i * 4] = mono[i] ?? 0;
    rgba[i * 4 + 1] = mono[i] ?? 0;
  }
  return {
    width: TEX_WIDTH,
    height,
    rgba,
    meta: [TEX_WIDTH, height, sampleRate, mono.length / sampleRate],
  };
}

export function makeTom(sampleRate: number): PackedTexture {
  const seconds = 0.26;
  const count = Math.floor(sampleRate * seconds);
  const mono = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-9 * t);
    const freq = 46 + 150 * Math.exp(-7 * t);
    mono[i] = 0.9 * env * Math.sin(2 * Math.PI * freq * t);
  }
  return packSample(mono, sampleRate);
}

export function makeWavetable(): PackedTexture {
  const frames = 4;
  const rgba = new Float32Array(TEX_WIDTH * frames * 4);
  const harmonics = [1, 2, 4, 8];
  for (let frame = 0; frame < frames; frame += 1) {
    for (let i = 0; i < TEX_WIDTH; i += 1) {
      const p = i / TEX_WIDTH;
      let sum = 0;
      const count = harmonics[frame] ?? 1;
      for (let h = 1; h <= count; h += 1) {
        sum += Math.sin(2 * Math.PI * p * h) / h;
      }
      rgba[(frame * TEX_WIDTH + i) * 4] = sum * 0.45;
    }
  }
  return {
    width: TEX_WIDTH,
    height: frames,
    rgba,
    meta: [TEX_WIDTH, frames, 0, 0],
  };
}
