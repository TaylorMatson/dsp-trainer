import { describe, expect, it } from 'vitest';

import { CONTINUOUS_BUFFER_SECONDS, DEFAULT_OUTPUT_SAMPLE_RATE_HZ } from '@/constants/AvTheme';
import type { AvRenderContext, AvSampleSource } from '@/audio/types';
import { encodeWavDataUri, fadeEdges, toFloat32 } from '@/signal/pcm';
import { generateSineSamples } from '@/signal/sine';

describe('AV sample continuity (sine source)', () => {
  it('produces a seamless-enough loop buffer at device rate', () => {
    const source: AvSampleSource = (ctx) =>
      toFloat32(
        generateSineSamples({
          frequencyHz: 220,
          sampleRateHz: ctx.outputSampleRateHz,
          amplitude: 0.5,
          sampleCount: ctx.frameCount,
        }),
      );

    const ctx: AvRenderContext = {
      outputSampleRateHz: DEFAULT_OUTPUT_SAMPLE_RATE_HZ,
      analysisSampleRateHz: 2000,
      frameCount: Math.round(CONTINUOUS_BUFFER_SECONDS * DEFAULT_OUTPUT_SAMPLE_RATE_HZ),
      timeSec: 0,
      params: { frequencyHz: 220 },
    };

    const samples = fadeEdges(source(ctx), Math.round(ctx.outputSampleRateHz * 0.008));
    expect(samples.length).toBe(ctx.frameCount);
    expect(samples[0]).toBeCloseTo(0, 5);
    expect(samples[samples.length - 1]).toBeCloseTo(0, 5);

    let peak = 0;
    for (let i = 0; i < samples.length; i += 1) {
      peak = Math.max(peak, Math.abs(samples[i] ?? 0));
    }
    expect(peak).toBeGreaterThan(0.3);
    expect(peak).toBeLessThanOrEqual(0.5);

    const uri = encodeWavDataUri(samples, ctx.outputSampleRateHz);
    expect(uri.startsWith('data:audio/wav;base64,')).toBe(true);
  });
});
