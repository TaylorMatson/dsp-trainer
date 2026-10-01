import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from 'expo-audio';

import {
  CONTINUOUS_BUFFER_SECONDS,
  DEFAULT_OUTPUT_SAMPLE_RATE_HZ,
} from '@/constants/AvTheme';
import { getMasterVolume, subscribeMasterVolume } from '@/audio/masterVolume';
import type { AvAudioMode, AvRenderContext, AvSampleSource } from '@/audio/types';
import { encodeWavDataUri, fadeEdges } from '@/signal/pcm';

export type AvPlaybackOptions = {
  audioMode: AvAudioMode;
  source: AvSampleSource;
  /** Teaching / analysis rate; may change while the controller lives. */
  getAnalysisSampleRateHz: () => number;
  outputSampleRateHz?: number;
  getParams: () => Record<string, number>;
};

/**
 * Thin transport over expo-audio: synthesizes WAV from the demo sample source
 * and plays/loops it. DSP math stays in `signal/`; this only clocks and plays.
 */
export class AvPlaybackController {
  readonly outputSampleRateHz: number;
  private player: AudioPlayer | null = null;
  private modeReady = false;
  private frameCount = 0;
  private startedAtMs: number | null = null;
  private pausedAccumSec = 0;
  private playing = false;
  private muted = false;
  private unsubscribeVolume: (() => void) | null = null;

  constructor(private readonly options: AvPlaybackOptions) {
    this.outputSampleRateHz =
      options.outputSampleRateHz ?? DEFAULT_OUTPUT_SAMPLE_RATE_HZ;
    this.unsubscribeVolume = subscribeMasterVolume(() => {
      this.applyVolume();
    });
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  async ensureAudioMode(): Promise<void> {
    if (this.modeReady) return;
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      allowsRecording: false,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    });
    this.modeReady = true;
  }

  async play(): Promise<void> {
    await this.ensureAudioMode();
    await this.loadFromSource();
    if (!this.player) return;
    this.player.muted = this.muted;
    this.applyVolume();
    this.player.play();
    this.playing = true;
    this.startedAtMs = Date.now();
  }

  pause(): void {
    if (!this.player) return;
    this.player.pause();
    if (this.startedAtMs != null) {
      this.pausedAccumSec += (Date.now() - this.startedAtMs) / 1000;
      this.startedAtMs = null;
    }
    this.playing = false;
  }

  async rewind(): Promise<void> {
    this.pausedAccumSec = 0;
    this.frameCount = 0;
    this.startedAtMs = this.playing ? Date.now() : null;
    if (this.playing) {
      await this.loadFromSource();
      this.player?.play();
    } else if (this.player) {
      this.player.seekTo(0);
      this.player.pause();
    }
  }

  /**
   * Explicit pause → rebuild → play so sample-rate / buffer changes are audible
   * without requiring a manual replay.
   */
  async restartPlayback(): Promise<void> {
    this.pause();
    await this.play();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.player) {
      this.player.muted = muted;
    }
  }

  /** Rebuild the audible buffer from the current sample source (e.g. after param change). */
  async refreshIfPlaying(): Promise<void> {
    if (!this.playing) return;
    await this.loadFromSource();
    this.player?.play();
  }

  release(): void {
    this.playing = false;
    this.startedAtMs = null;
    if (this.unsubscribeVolume) {
      this.unsubscribeVolume();
      this.unsubscribeVolume = null;
    }
    if (this.player) {
      try {
        this.player.pause();
        this.player.remove();
      } catch {
        // ignore teardown races
      }
      this.player = null;
    }
  }

  timeSec(): number {
    const live =
      this.startedAtMs == null ? 0 : (Date.now() - this.startedAtMs) / 1000;
    return this.pausedAccumSec + live;
  }

  private applyVolume(): void {
    if (this.player) {
      this.player.volume = getMasterVolume();
    }
  }

  private buildContext(): AvRenderContext {
    const seconds =
      this.options.audioMode === 'continuous'
        ? CONTINUOUS_BUFFER_SECONDS
        : Math.max(0.35, CONTINUOUS_BUFFER_SECONDS);
    return {
      outputSampleRateHz: this.outputSampleRateHz,
      analysisSampleRateHz: this.options.getAnalysisSampleRateHz(),
      frameCount: Math.max(1, Math.round(seconds * this.outputSampleRateHz)),
      timeSec: this.timeSec(),
      params: this.options.getParams(),
    };
  }

  private async loadFromSource(): Promise<void> {
    const ctx = this.buildContext();
    let samples = this.options.source(ctx);
    if (samples.length === 0) {
      samples = new Float32Array(ctx.frameCount);
    }
    if (this.options.audioMode === 'continuous') {
      const fade = Math.round(this.outputSampleRateHz * 0.008);
      samples = fadeEdges(samples, fade);
    }

    const uri = encodeWavDataUri(samples, this.outputSampleRateHz);
    this.frameCount += 1;

    if (this.player) {
      this.player.replace({ uri });
    } else {
      this.player = createAudioPlayer({ uri }, { updateInterval: 200 });
    }
    this.player.loop = this.options.audioMode === 'continuous';
    this.applyVolume();
    this.player.muted = this.muted;
    this.player.seekTo(0);
  }
}
