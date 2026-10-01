/** Shared AV demo shell contracts (transport + paired sample source). */

export type AvAudioMode = 'continuous' | 'oneshot';

export type AvTransportState = 'stopped' | 'playing' | 'paused';

export type AvRenderContext = {
  /** Device (or engine) sample rate for audible output. */
  outputSampleRateHz: number;
  /** Teaching / analysis rate used by plots when different from output. */
  analysisSampleRateHz: number;
  frameCount: number;
  /** Seconds since transport start (post-rewind). */
  timeSec: number;
  params: Record<string, number>;
};

/**
 * Module supplies PCM. Mono Float32 in [-1, 1].
 * Continuous: called when starting / refreshing the loop buffer.
 * Oneshot: called once on play (or param commit); shell schedules the buffer.
 */
export type AvSampleSource = (ctx: AvRenderContext) => Float32Array;
