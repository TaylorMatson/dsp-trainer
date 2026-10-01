import {
  BLOCK_SIZE,
  BeatClock,
  barSeconds,
  beatSeconds,
  catchUpWriteBlocks,
  flipBlockOffset,
  generationTime,
  rewindOffset,
  sixteenBarSeconds,
} from './beat';
import { POST, PRELUDE, VERTEX, remapShaderError, rewriteBinaryLiterals } from './prelude';
import { makeTom, makeWavetable, type PackedTexture } from './textures';

export type CueStatus = 'none' | 'compiling' | 'ready' | 'applying';

export interface VoiceSource {
  label: string;
  code: string;
}

export interface VoiceWave {
  label: string;
  left: Float32Array;
}

export interface DeckFrame {
  left: Float32Array;
  right: Float32Array;
  voices: VoiceWave[];
  cueStatus: CueStatus;
  bpm: number;
  beat: number;
  bar: number;
  sixteenBar: number;
  time: number;
  beatSeconds: number;
  barSeconds: number;
  blockAhead: number;
  readBlocks: number;
  writeBlocks: number;
  blockOffset: number;
  playing: boolean;
  sampleRate: number;
  framesPerRender: number;
  error: string | null;
}

interface ParamTap {
  value: number;
  y0: number;
  y1: number;
  y2: number;
  y3: number;
}

interface ShaderSlot {
  program: WebGLProgram;
  code: string;
}

const BLOCKS_PER_RENDER = 16;
const LATENCY_BLOCKS = 16;

function clampSample(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value > 1) return 1;
  if (value < -1) return -1;
  return value;
}

export class TeachingDeck {
  readonly blocksPerRender = BLOCKS_PER_RENDER;
  readonly latencyBlocks = LATENCY_BLOCKS;
  readonly audio: AudioContext;

  private readonly gl: WebGL2RenderingContext;
  private readonly clock = new BeatClock();
  private readonly gain: GainNode;
  private readonly quad: WebGLBuffer;
  private readonly framebuffer: WebGLFramebuffer;
  private readonly packBuffer: WebGLBuffer;
  private readonly readback: Float32Array;
  private readonly textures = new Map<string, { texture: WebGLTexture; meta: [number, number, number, number] }>();
  private readonly params = new Map<string, ParamTap>();
  private readonly uniforms = new Map<string, number>();

  private worklet: AudioWorkletNode | null = null;
  private playingFlag = false;
  private blockOffset = 0;
  private bufferWriteBlocks = 0;
  private underrun = false;
  private cueStatus: CueStatus = 'none';
  private swapTime: number | null = null;
  private active: ShaderSlot[] = [];
  private cued: ShaderSlot[] = [];
  private labels: string[] = [];
  private error: string | null = null;
  private frame: DeckFrame;

  constructor(canvas: HTMLCanvasElement) {
    this.audio = new AudioContext();
    canvas.width = BLOCK_SIZE * BLOCKS_PER_RENDER;
    canvas.height = 1;
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) throw new Error('WebGL2 is not available in this browser.');
    if (!gl.getExtension('EXT_color_buffer_float')) {
      throw new Error('EXT_color_buffer_float is required to render audio into an RGBA32F buffer.');
    }
    this.gl = gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.enable(gl.SCISSOR_TEST);

    this.quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const target = this.createTarget(this.framesPerRender);
    this.framebuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('The RGBA32F audio framebuffer is incomplete.');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.packBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.packBuffer);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, this.framesPerRender * 16, gl.STREAM_READ);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    this.readback = new Float32Array(this.framesPerRender * 4);
    this.uploadNamed('sample_tom', makeTom(this.audio.sampleRate));
    this.uploadNamed('wavetable_waves', makeWavetable());

    this.gain = this.audio.createGain();
    this.gain.gain.value = 0.9;
    this.gain.connect(this.audio.destination);
    this.params.set('knob', { value: 0.7, y0: 0.7, y1: 0.7, y2: 0.7, y3: 0.7 });
    this.frame = this.blankFrame();
  }

  get framesPerRender(): number {
    return BLOCK_SIZE * this.blocksPerRender;
  }

  get sampleRate(): number {
    return this.audio.sampleRate;
  }

  get playing(): boolean {
    return this.playingFlag;
  }

  get latest(): DeckFrame {
    return this.frame;
  }

  async init(): Promise<void> {
    await this.audio.audioWorklet.addModule(`${import.meta.env.BASE_URL}buffer-reader-worklet.js`);
    this.worklet = new AudioWorkletNode(this.audio, 'course-buffer-reader', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    this.worklet.connect(this.gain);
    this.worklet.port.onmessage = (event: MessageEvent<{ type?: string; value?: boolean }>) => {
      if (event.data?.type === 'underrun') this.underrun = Boolean(event.data.value);
    };
  }

  setBpm(bpm: number): void {
    this.clock.bpm = bpm;
    if (!this.playingFlag) this.preview();
  }

  setUniform(name: string, value: number): void {
    this.uniforms.set(name, value);
    if (!this.playingFlag) this.preview();
  }

  clearUniforms(): void {
    this.uniforms.clear();
  }

  setParam(name: string, value: number): void {
    const tap = this.params.get(name) ?? { value, y0: value, y1: value, y2: value, y3: value };
    tap.value = value;
    if (!this.playingFlag) {
      tap.y0 = value;
      tap.y1 = value;
      tap.y2 = value;
      tap.y3 = value;
    }
    this.params.set(name, tap);
    if (!this.playingFlag) this.preview();
  }

  async play(): Promise<void> {
    if (this.playingFlag) return;
    const primeWhileSuspended = this.audio.state !== 'running';
    this.blockOffset = flipBlockOffset(this.readBlocks(), this.blockOffset);
    this.playingFlag = true;
    if (primeWhileSuspended) this.renderAvailable();
    await this.audio.resume();
    this.postActive(true);
    if (!primeWhileSuspended) this.renderAvailable();
  }

  pause(): void {
    if (!this.playingFlag) return;
    this.blockOffset = flipBlockOffset(this.readBlocks(), this.blockOffset);
    this.playingFlag = false;
    this.postActive(false);
    this.frame = { ...this.frame, playing: false, blockOffset: this.blockOffset };
  }

  rewind(): void {
    this.blockOffset = rewindOffset(this.readBlocks(), this.bufferWriteBlocks, this.playingFlag);
    this.clock.reset();
    this.applyCueImmediately();
    this.preview();
  }

  applySources(voices: VoiceSource[], when: 'now' | 'bar'): void {
    this.cueStatus = 'compiling';
    const compiled: ShaderSlot[] = [];
    try {
      for (const voice of voices) {
        compiled.push({ program: this.compile(voice.code), code: voice.code });
      }
    } catch (error) {
      for (const slot of compiled) this.gl.deleteProgram(slot.program);
      this.cueStatus = 'none';
      this.error = error instanceof Error ? error.message : String(error);
      this.frame = { ...this.frame, cueStatus: this.cueStatus, error: this.error };
      return;
    }

    for (const slot of this.cued) this.gl.deleteProgram(slot.program);
    this.cued = compiled;
    this.labels = voices.map((voice) => voice.label);
    this.error = null;
    this.cueStatus = 'ready';

    if (when === 'now' || this.active.length === 0) {
      this.applyCueImmediately();
      this.preview();
      return;
    }

    this.swapTime = this.clock.time - this.clock.bar + barSeconds(this.clock.bpm);
    this.cueStatus = 'applying';
    this.frame = { ...this.frame, cueStatus: this.cueStatus, error: null };
  }

  update(): void {
    if (!this.playingFlag || !this.worklet) return;
    this.renderOne(this.readBlocks());
  }

  private renderAvailable(): void {
    if (!this.worklet) return;
    for (let guard = 0; guard < 4; guard += 1) {
      const readBlocks = this.readBlocks();
      if (this.bufferWriteBlocks - readBlocks > this.latencyBlocks) return;
      this.renderOne(readBlocks);
    }
  }

  private renderOne(readBlocks: number): void {
    if (!this.worklet || !this.playingFlag) return;
    if (this.bufferWriteBlocks - readBlocks > this.latencyBlocks) return;

    if (this.underrun || this.bufferWriteBlocks < readBlocks) {
      this.bufferWriteBlocks = catchUpWriteBlocks(readBlocks, this.latencyBlocks, this.blocksPerRender);
      this.underrun = false;
    }

    const genTime = generationTime(this.bufferWriteBlocks, this.blockOffset, this.sampleRate);
    this.clock.update(genTime);
    this.shiftParams();

    let beginNext = this.framesPerRender;
    if (this.swapTime != null) {
      beginNext = Math.min(this.framesPerRender, Math.floor((this.swapTime - genTime) * this.sampleRate));
    }
    if (beginNext < 0) {
      this.applyCueImmediately();
      beginNext = this.framesPerRender;
    }

    const swapping = beginNext < this.framesPerRender && this.cued.length > 0;
    const captured = this.capture(beginNext, swapping);
    if (swapping) this.applyCueImmediately();

    const block = this.bufferWriteBlocks;
    const left = captured.left.slice();
    const right = captured.right.slice();
    this.worklet.port.postMessage(
      { type: 'write', block, left, right },
      [left.buffer, right.buffer],
    );
    this.bufferWriteBlocks += this.blocksPerRender;
    this.frame = this.makeFrame(captured.left, captured.right, captured.voices, readBlocks);
  }

  preview(): void {
    if (this.active.length === 0) {
      this.frame = this.blankFrame();
      return;
    }
    const captured = this.capture(this.framesPerRender, false);
    this.frame = this.makeFrame(captured.left, captured.right, captured.voices, this.readBlocks());
  }

  private capture(beginNext: number, swapping: boolean): {
    left: Float32Array;
    right: Float32Array;
    voices: VoiceWave[];
  } {
    const frames = this.framesPerRender;
    const slots = Math.max(this.active.length, swapping ? this.cued.length : 0);
    const left = new Float32Array(frames);
    const right = new Float32Array(frames);
    const voices: VoiceWave[] = [];

    for (let index = 0; index < slots; index += 1) {
      const current = this.active[index];
      const next = this.cued[index];
      this.clearTarget();
      if (!swapping) {
        if (current) this.draw(current, 0, frames);
      } else {
        if (current && beginNext > 0) this.draw(current, 0, beginNext);
        if (next) {
          const start = Math.max(0, beginNext);
          if (start < frames) this.draw(next, start, frames - start);
        }
      }
      const samples = this.readSamples();
      voices.push({
        label: this.labels[index] ?? `Deck ${index + 1}`,
        left: samples.left,
      });
      for (let i = 0; i < frames; i += 1) {
        left[i] = (left[i] ?? 0) + (samples.left[i] ?? 0);
        right[i] = (right[i] ?? 0) + (samples.right[i] ?? 0);
      }
    }

    const scale = slots > 1 ? 0.85 : 1;
    for (let i = 0; i < frames; i += 1) {
      left[i] = clampSample((left[i] ?? 0) * scale);
      right[i] = clampSample((right[i] ?? 0) * scale);
    }
    return { left, right, voices };
  }

  private compile(userCode: string): WebGLProgram {
    const { gl } = this;
    const body = userCode.endsWith('\n') ? userCode : `${userCode}\n`;
    const fragmentSource = rewriteBinaryLiterals(PRELUDE + body + POST);

    const vertex = this.compileShader(gl.VERTEX_SHADER, VERTEX);
    const fragment = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program) throw new Error('Could not create a shader program.');
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program) ?? 'Link failed';
      gl.deleteProgram(program);
      throw new Error(remapShaderError(info));
    }
    return program;
  }

  private compileShader(type: number, source: string): WebGLShader {
    const { gl } = this;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Could not create a shader.');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader) ?? 'Compile failed';
      gl.deleteShader(shader);
      throw new Error(remapShaderError(info));
    }
    return shader;
  }

  private draw(slot: ShaderSlot, first: number, count: number): void {
    if (count <= 0) return;
    const { gl } = this;
    const program = slot.program;
    gl.useProgram(program);
    this.bindUniforms(program);
    this.bindTextures(program, slot.code);

    const position = gl.getAttribLocation(program, 'position');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    if (position >= 0) {
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.framesPerRender, 1);
    gl.scissor(first, 0, count, 1);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(null);
  }

  private bindUniforms(program: WebGLProgram): void {
    const { gl } = this;
    const bpm = this.clock.bpm;
    const set1 = (name: string, value: number): void => {
      gl.uniform1f(gl.getUniformLocation(program, name), value);
    };
    const set4 = (name: string, value: [number, number, number, number]): void => {
      gl.uniform4f(gl.getUniformLocation(program, name), value[0], value[1], value[2], value[3]);
    };

    set1('bpm', bpm);
    set1('_deltaSample', 1 / this.sampleRate);
    set1('_framesPerRender', this.framesPerRender);
    for (const [name, value] of this.uniforms) {
      set1(name, value);
    }
    set4('timeLength', [beatSeconds(bpm), barSeconds(bpm), sixteenBarSeconds(bpm), 1e16]);
    set4('_timeHead', [this.clock.beat, this.clock.bar, this.clock.sixteenBar, this.clock.time]);

    for (const [name, tap] of this.params) {
      set4(`param_${name}`, [tap.y0, tap.y1, tap.y2, tap.y3]);
    }
  }

  private bindTextures(program: WebGLProgram, code: string): void {
    const { gl } = this;
    let unit = 0;
    for (const [name, entry] of this.textures) {
      if (!code.includes(name)) continue;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, entry.texture);
      gl.uniform1i(gl.getUniformLocation(program, name), unit);
      gl.uniform4f(
        gl.getUniformLocation(program, `${name}_meta`),
        entry.meta[0],
        entry.meta[1],
        entry.meta[2],
        entry.meta[3],
      );
      unit += 1;
    }
  }

  private readSamples(): { left: Float32Array; right: Float32Array } {
    const { gl } = this;
    const frames = this.framesPerRender;

    // Reading an RGBA32F row straight into a client Float32Array returns
    // uninitialized bits on some GPUs. Clamped to ±1, that is full-scale
    // noise. RendererImpl reads into a pack buffer, then finishes the GPU
    // before copying the floats out.
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.packBuffer);
    gl.readPixels(0, 0, frames, 1, gl.RGBA, gl.FLOAT, 0);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.finish();
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.packBuffer);
    gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, this.readback);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

    const left = new Float32Array(frames);
    const right = new Float32Array(frames);
    for (let i = 0; i < frames; i += 1) {
      left[i] = this.readback[i * 4] ?? 0;
      right[i] = this.readback[i * 4 + 1] ?? 0;
    }
    return { left, right };
  }

  private clearTarget(): void {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.framesPerRender, 1);
    gl.scissor(0, 0, this.framesPerRender, 1);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private createTarget(width: number): WebGLTexture {
    const { gl } = this;
    const texture = gl.createTexture();
    if (!texture) throw new Error('Could not create the audio texture.');
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, 1, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
  }

  private uploadNamed(name: string, packed: PackedTexture): void {
    const { gl } = this;
    const texture = gl.createTexture();
    if (!texture) throw new Error(`Could not create texture ${name}.`);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      packed.width,
      packed.height,
      0,
      gl.RGBA,
      gl.FLOAT,
      packed.rgba,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.textures.set(name, { texture, meta: packed.meta });
  }

  private applyCueImmediately(): void {
    if (this.cued.length === 0) return;
    for (const slot of this.active) this.gl.deleteProgram(slot.program);
    this.active = this.cued;
    this.cued = [];
    this.swapTime = null;
    this.cueStatus = 'none';
  }

  private shiftParams(): void {
    for (const tap of this.params.values()) {
      tap.y3 = tap.y2;
      tap.y2 = tap.y1;
      tap.y1 = tap.y0;
      tap.y0 = tap.value;
    }
  }

  private readBlocks(): number {
    return Math.trunc(this.sampleRate / BLOCK_SIZE * this.audio.currentTime);
  }

  private postActive(active: boolean): void {
    this.worklet?.port.postMessage({ type: 'active', value: active });
  }

  private makeFrame(
    left: Float32Array,
    right: Float32Array,
    voices: VoiceWave[],
    readBlocks: number,
  ): DeckFrame {
    const bpm = this.clock.bpm;
    return {
      left,
      right,
      voices,
      cueStatus: this.cueStatus,
      bpm,
      beat: this.clock.beat,
      bar: this.clock.bar,
      sixteenBar: this.clock.sixteenBar,
      time: this.clock.time,
      beatSeconds: beatSeconds(bpm),
      barSeconds: barSeconds(bpm),
      blockAhead: this.bufferWriteBlocks - readBlocks,
      readBlocks,
      writeBlocks: this.bufferWriteBlocks,
      blockOffset: this.blockOffset,
      playing: this.playingFlag,
      sampleRate: this.sampleRate,
      framesPerRender: this.framesPerRender,
      error: this.error,
    };
  }

  private blankFrame(): DeckFrame {
    const frames = this.framesPerRender;
    const bpm = this.clock.bpm;
    return {
      left: new Float32Array(frames),
      right: new Float32Array(frames),
      voices: [],
      cueStatus: this.cueStatus,
      bpm,
      beat: 0,
      bar: 0,
      sixteenBar: 0,
      time: 0,
      beatSeconds: beatSeconds(bpm),
      barSeconds: barSeconds(bpm),
      blockAhead: 0,
      readBlocks: 0,
      writeBlocks: 0,
      blockOffset: 0,
      playing: this.playingFlag,
      sampleRate: this.sampleRate,
      framesPerRender: frames,
      error: this.error,
    };
  }
}
