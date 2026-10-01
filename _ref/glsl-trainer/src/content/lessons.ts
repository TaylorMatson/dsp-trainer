import {
  barNotes,
  beatClick,
  colorField,
  cueSine,
  cueSquare,
  deckHat,
  deckKick,
  hatGrid,
  knobTone,
  pulseTone,
  readbackChord,
  rowSine,
  sampleVoice,
  sawTooth,
  steadySine,
} from './shaders';

const DECK = 'https://github.com/0b5vr/wavenerd-deck/blob/8e4914d06ef3031700edfdd00ed3ccc1f8caacd8';
const APP = 'https://github.com/0b5vr/wavenerd/blob/19059a694dc98450fdc04a6b87c719613e34ffc9';
const PLAY = 'https://github.com/0b5vr/shader-playground/blob/a1c4f22ae4996be8c1e5f4b10b30867cd0e872fe';

export interface LessonFile {
  label: string;
  href: string;
}

export interface LessonVoice {
  label: string;
  code: string;
}

export type LessonStage = 'audio' | 'color';

export type LessonControlKind = 'uniform' | 'param';

export interface LessonControl {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  kind: LessonControlKind;
}

export interface Lesson {
  id: string;
  part: string;
  title: string;
  files: LessonFile[];
  html: string;
  stage: LessonStage;
  voices: LessonVoice[];
  /** When false, the global BPM slider is hidden. bpmNote says why. */
  bpm: boolean;
  bpmNote: string | null;
  controls: LessonControl[];
  suggestions: string[];
  swapExample: string | null;
}

function file(repo: string, path: string): LessonFile {
  return { label: path.split('/').pop() ?? path, href: `${repo}/${path}` };
}

function excerpt(caption: string, code: string): string {
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<figure class="excerpt"><figcaption>${caption}</figcaption><pre>${escaped}</pre></figure>`;
}

export const lessons: Lesson[] = [
  {
    id: 'deck',
    part: 'The pipeline',
    title: 'A deck is a shader that plays',
    files: [
      file(DECK, 'src/WavenerdDeck.ts'),
      file(DECK, 'src/index.ts'),
      file(APP, 'src/index.tsx'),
    ],
    stage: 'audio',
    bpm: true,
    bpmNote: null,
    controls: [
      { id: 'pitch', label: 'Pitch', min: 80, max: 880, step: 1, value: 220, kind: 'uniform' },
      { id: 'level', label: 'Level', min: 0, max: 0.8, step: 0.001, value: 0.4, kind: 'uniform' },
    ],
    suggestions: [
      'Drag Pitch, or edit the uniform. The pulse is sin of fract(pitch * time.w), gated by time.x.',
      'Change the 7.0 in exp(-7.0 * time.x) to 2.0 for a longer ring, or 20.0 for a short tick.',
      'Replace time.w inside fract with time.x so each beat also restarts the oscillator phase.',
      'The old constant 220 Hz plus 277 Hz pair beats at about 57 Hz and sounds like a soft buzz. One gated pitch is the tone.',
    ],
    swapExample: null,
    voices: [{ label: 'Shader', code: pulseTone }],
    html: `
      <p>0b5vr’s shader work that you can actually run as a library is <a href="${DECK}/README.md">wavenerd-deck</a>. Wavenerd, the live instrument, is a two-deck DJ mixer built on top of it. This course walks that engine from construction to the sample that hits the speaker. Other repos (Automaton, the VRM tools, the 4k intros) are real, and they are not this pipeline.</p>
      <p><code>WavenerdDeck</code> is the object you hold. The constructor takes an <code>AudioContext</code>, and optionally <code>hostDeck</code>, <code>latencyBlocks</code>, <code>blocksPerRender</code>, and <code>bpm</code>. It builds five things and keeps them private:</p>
      <ul>
        <li>a <code>GainNode</code> exposed as <code>deck.node</code></li>
        <li>a <code>BeatManager</code></li>
        <li>a <code>Renderer</code> whose worker owns the WebGL2 context</li>
        <li>a <code>BufferReaderNode</code> audio worklet that pulls rendered blocks</li>
        <li>a <code>TextureStore</code> for samples, wavetables, and images</li>
      </ul>
      <p>Defaults in the class are <code>latencyBlocks = 16</code> and <code>blocksPerRender = 16</code>. The Wavenerd app passes <code>latencyBlocks: 32</code> and later copies <code>SettingsManager</code>’s saved block sizes onto both decks. BPM starts at 140.</p>
      <p>Press play. The picture is not a decorative oscilloscope bolted on afterwards. It is the framebuffer the deck just rendered: one row of stereo samples. The shader on the right is the whole instrument. Its envelope is <code>exp(-7.0 * time.x)</code>, so the pulse restarts every beat and the BPM slider changes how often you hear it. Pitch and Level are uniforms on that shader.</p>
    `,
  },
  {
    id: 'main-audio',
    part: 'The pipeline',
    title: 'You write mainAudio',
    files: [file(DECK, 'src/renderer/shaderchunks.ts'), file(DECK, 'example/example.frag')],
    stage: 'audio',
    bpm: false,
    bpmNote: 'BPM is hidden. This saw reads absolute time (time.w), so tempo cannot change it. The buzz is the cheap fract tooth, not a broken buffer.',
    controls: [
      { id: 'pitch', label: 'Frequency', min: 40, max: 440, step: 1, value: 90, kind: 'uniform' },
      { id: 'level', label: 'Level', min: 0, max: 0.4, step: 0.001, value: 0.14, kind: 'uniform' },
    ],
    suggestions: [
      'Drag Frequency. The tooth is 2 * fract(pitch * time.w) - 1. Higher pitch, harsher buzz.',
      'Drop Level toward 0.05 if it is too harsh. The spectrum is the lesson.',
      'Multiply the saw by exp(-8.0 * time.x). That envelope follows the beat, which is what the BPM slider drives.',
      'Swap time.w for time.y and the tooth rate locks to the bar clock instead of the wall clock.',
    ],
    swapExample: null,
    voices: [{ label: 'Shader', code: sawTooth }],
    html: `
      <p>A deck shader is not a Shadertoy <code>mainImage</code>. <code>RendererImpl.compile</code> concatenates three strings: <code>shaderchunkPre</code>, your code, and <code>shaderchunkPost</code>. Your code has one job: define <code>vec2 mainAudio(vec4 time)</code>. The post chunk calls it and writes the stereo pair into the pixel.</p>
      ${excerpt('wavenerd-deck · src/renderer/shaderchunks.ts · shaderchunkPost', `void main() {
  vec2 out2 = mainAudio(mod(_timeHead + floor(gl_FragCoord.x) * _deltaSample, timeLength));
  if (any(isnan(out2)) || any(isinf(out2))) {
    out2 = vec2(0.0);
  }
  _fragColor = vec4(out2.x, out2.y, 0.0, 1.0);
}`)}
      <p><code>x</code> is the left channel, <code>y</code> is the right. NaN and infinity become silence so one bad sample cannot poison the worklet. The course player wraps your editor text the same way. Open “Engine wrapper” under the editor to read the preamble this page actually prepends.</p>
      <p>The saw here is the cheap one: <code>2 * fract(frequency * time) - 1</code>. <code>example/example.frag</code> uses the same <code>fract</code> trick inside richer voices, and it calls <code>wavetableSinc</code> when it wants a band-limited table instead. That file is MIT; this page uses a short original saw so the mechanism is audible without pasting the whole example.</p>
    `,
  },
  {
    id: 'framebuffer',
    part: 'The pipeline',
    title: 'A framebuffer one pixel tall',
    files: [file(DECK, 'src/renderer/RendererImpl.ts'), file(DECK, 'src/constants.ts')],
    stage: 'audio',
    bpm: false,
    bpmNote: 'BPM is hidden. Each pixel is one sample of absolute time (time.w), so the row stays a steady sine. Tempo is not what this framebuffer is showing.',
    controls: [
      { id: 'pitch', label: 'Pitch', min: 40, max: 880, step: 1, value: 220, kind: 'uniform' },
      { id: 'level', label: 'Level', min: 0, max: 0.8, step: 0.001, value: 0.35, kind: 'uniform' },
    ],
    suggestions: [
      'Drag Pitch and watch the strip. More cycles in the row means a higher sine, one sample per pixel.',
      'Change the 0.45 on the right channel so the red and green stripes diverge.',
      'Replace time.w with time.x and the tone becomes a beat-length chirp. That is the edit that would make BPM audible.',
      'Set level to 0. The row goes dark: silence is a zero sample, not a missing pixel.',
    ],
    swapExample: null,
    voices: [{ label: 'Shader', code: rowSine }],
    html: `
      <p><code>constants.ts</code> defines <code>BLOCK_SIZE = 128</code>, the Web Audio quantum the rest of the engine assumes. <code>framesPerRender</code> is <code>BLOCK_SIZE * blocksPerRender</code>. At the default of 16 blocks, that is 2048 samples.</p>
      <p><code>createFramebufferTexture</code> allocates an <code>RGBA32F</code> texture of size <code>framesPerRender × 1</code>. The vertex shader is a full-screen triangle strip. <code>gl_FragCoord.x</code> is the sample index inside this render. The fragment shader never sees a picture; the pixel’s red and green channels <em>are</em> the audio.</p>
      <p>The strip at the top of the stage is that row, drawn with red = left and green = right, each mapped from −1..1 into 0..1. The trace under it is the same numbers as a waveform. <code>RendererImpl</code> turns on <code>SCISSOR_TEST</code> in the constructor. <code>render(first, count, uniforms)</code> sets <code>scissor(first, 0, count, 1)</code> before the clear, so a later lesson can replace only part of the row when a new shader takes over mid-buffer.</p>
      <p><code>_deltaSample</code> is <code>1 / sampleRate</code>. Sample <em>i</em> is evaluated at <code>_timeHead + i * _deltaSample</code>. Moving one pixel to the right moves one sample forward in time.</p>
    `,
  },
  {
    id: 'time',
    part: 'Time',
    title: 'time is four clocks at once',
    files: [file(DECK, 'src/WavenerdDeck.ts'), file(DECK, 'src/BeatManager.ts')],
    stage: 'audio',
    bpm: true,
    bpmNote: null,
    controls: [
      { id: 'tickDecay', label: 'Tick decay', min: 4, max: 80, step: 1, value: 55, kind: 'uniform' },
      { id: 'accent', label: 'Accent', min: 0, max: 0.5, step: 0.001, value: 0.2, kind: 'uniform' },
    ],
    suggestions: [
      'Drag Tick decay. Smaller values let the click ring through the whole beat.',
      'Accent scales the bar envelope on time.y. Set it to 0 and only the beat tick remains.',
      'Change exp(-tickDecay * time.x) to exp(-tickDecay * time.y) and the click lands once per bar.',
      'Multiply the tick by sin(6.28318530718 * fract(880.0 * time.x)) to give the click a pitch.',
    ],
    swapExample: null,
    voices: [{ label: 'Shader', code: beatClick }],
    html: `
      <p>Every render, <code>WavenerdDeck.__collectUniforms</code> uploads two vec4s:</p>
      ${excerpt('wavenerd-deck · src/WavenerdDeck.ts · __collectUniforms', `{ name: 'timeLength', value: [beatSeconds, barSeconds, sixteenBarSeconds, 1E16] },
{ name: '_timeHead', value: [beat, bar, sixteenBar, time] },`)}
      <p>All four components are seconds. <code>beat</code> is how far you are into the current beat, <code>bar</code> into the current bar (4 beats), <code>sixteenBar</code> into a 16-bar phrase, and <code>time</code> is the running transport. <code>shaderchunkPost</code> adds <code>floor(gl_FragCoord.x) * _deltaSample</code> and wraps each component with <code>mod(..., timeLength)</code>. The last length is <code>1e16</code>, so absolute time practically does not wrap.</p>
      <p>Inside <code>mainAudio</code> that wrapped value arrives as the argument named <code>time</code>. The comment in <code>example/example.frag</code> says <code>time.x</code> is “a beat”: it means seconds since the downbeat, not a beat index. This click uses that directly. <code>exp(-55 * time.x)</code> is loud only at the start of each beat. Adding a slower envelope on <code>time.y</code> accents beat 1 of the bar.</p>
      <p>The four readouts under the stage are <code>BeatManager</code>’s <code>beat</code>, <code>bar</code>, <code>sixteenBar</code>, and <code>time</code> at the head of the latest rendered buffer. The speaker is a latency queue behind that head. Lesson 7 measures the gap.</p>
    `,
  },
  {
    id: 'beat-manager',
    part: 'Time',
    title: 'BeatManager folds time by BPM',
    files: [file(DECK, 'src/BeatManager.ts'), file(DECK, 'src/utils/mod.ts')],
    stage: 'audio',
    bpm: true,
    bpmNote: null,
    controls: [
      { id: 'decay', label: 'Hat decay', min: 8, max: 90, step: 1, value: 40, kind: 'uniform' },
      { id: 'level', label: 'Level', min: 0, max: 0.6, step: 0.001, value: 0.28, kind: 'uniform' },
    ],
    suggestions: [
      'Drag BPM. The grid length is 60.0 / bpm / 4.0, folded inside the bar with time.y.',
      'Hat decay is exp(-decay * local). Lower it and neighboring sixteenths blur together.',
      'Change / 4.0 to / 8.0 for a thirty-second grid, or / 2.0 for eighths.',
      'Level only scales the noise. The timing stays on the clock.',
    ],
    swapExample: null,
    voices: [{ label: 'Shader', code: hatGrid }],
    html: `
      <p><code>BeatManager</code> does not count beats as integers. It stores seconds, then folds them. The lengths are pure functions of BPM:</p>
      ${excerpt('wavenerd-deck · src/BeatManager.ts', `public static CalcBeatSeconds(bpm: number): number {
  return 60.0 / bpm;
}
public static CalcBarSeconds(bpm: number): number {
  return 240.0 / bpm;
}
public static CalcSixteenBarSeconds(bpm: number): number {
  return 3840.0 / bpm;
}`)}
      <p><code>update(time)</code> takes the absolute transport in seconds. It adds the delta onto <code>__sixteenBar</code> and folds with <code>mod</code> from <code>src/utils/mod.ts</code> (<code>value - floor(value / divisor) * divisor</code>, which stays positive for negative deltas). Then <code>__bar = mod(sixteenBar, barSeconds)</code> and <code>__beat = mod(bar, beatSeconds)</code>. That is why a shader can treat <code>time.x</code> as “position in the beat” without doing the wrap itself.</p>
      <p>Changing BPM does not restart the phrase. The setter scales <code>__sixteenBar *= previousBpm / newBpm</code> so the fractional position in the 16-bar loop survives. The next <code>update</code> refolds <code>bar</code> and <code>beat</code> from that scaled value. Drag BPM while this hat grid plays: the grid is <code>60/bpm/4</code> seconds long, so the same musical sixteenths speed up and slow down.</p>
    `,
  },
  {
    id: 'transport',
    part: 'Time',
    title: 'Play, pause, and rewind share one offset',
    files: [file(DECK, 'src/WavenerdDeck.ts'), file(APP, 'src/view/components/Header/HeaderTransport.tsx')],
    stage: 'audio',
    bpm: true,
    bpmNote: null,
    controls: [
      { id: 'decay', label: 'Decay', min: 1, max: 24, step: 0.1, value: 12, kind: 'uniform' },
    ],
    suggestions: [
      'Lower Decay until the note still has energy at the next beat. That step is the click.',
      'The four pitches are 110, 138.59, 164.81, and 220. Edit one of them.',
      'sin uses local beat time, so phase starts at 0. Change local to time.w and a click returns even with a fast decay.',
      'Rewind sets transport time to 0, so the phrase returns to the low note.',
    ],
    swapExample: null,
    voices: [{ label: 'Shader', code: barNotes }],
    html: `
      <p>The audio context clock does not stop when you pause a deck. <code>bufferReadBlocks</code> is <code>~~(sampleRate / BLOCK_SIZE * audio.currentTime)</code>, and it keeps climbing. Musical time is a different number:</p>
      ${excerpt('wavenerd-deck · src/WavenerdDeck.ts', `const genTime = BLOCK_SIZE * (this.__bufferWriteBlocks - this.blockOffset) / sampleRate;`)}
      <p><code>play</code> and <code>pause</code> both do the same assignment: <code>blockOffset = bufferReadBlocks - blockOffset</code>. Doing it twice returns you to the previous offset, which freezes <code>genTime</code> across the gap where the read head ran ahead. <code>rewind</code> sets <code>blockOffset = bufferWriteBlocks</code>, so the next render’s <code>genTime</code> is 0. It also calls <code>beatManager.reset()</code> and <code>applyCueImmediately()</code>. While this player is stopped, Play will flip that offset once, so Rewind stores the value the flip turns back into <code>bufferWriteBlocks</code>. Either way the next buffer starts at time 0.</p>
      <p>The four-note loop is written against <code>time.y</code>, so rewind is obvious: the phrase jumps back to the low note. The oscillator phase uses that same beat-local time, and the default decay has already reached silence by the next note. Lower Decay and the leftover amplitude steps — that is the click. The stage labels <code>read</code>, <code>write</code>, and <code>offset</code> in blocks of 128 samples. Wavenerd’s transport buttons live in <code>HeaderTransport</code>; the first gesture is <code>PlayOverlay</code>, which resumes the suspended <code>AudioContext</code> and calls <code>hostDeck.play()</code>.</p>
    `,
  },
  {
    id: 'latency',
    part: 'Time',
    title: 'The worklet eats blocks of 128',
    files: [
      file(DECK, 'src/BufferReaderNode.ts'),
      file(DECK, 'src/BufferReaderProcessor.worklet.js'),
      file(DECK, 'src/constants.ts'),
    ],
    stage: 'audio',
    bpm: false,
    bpmNote: 'BPM is hidden. A steady sine on time.w keeps the buffer meter readable. Tempo is not the subject of this lesson.',
    controls: [
      { id: 'pitch', label: 'Pitch', min: 80, max: 880, step: 1, value: 220, kind: 'uniform' },
    ],
    suggestions: [
      'Drag Pitch. The meter should stay full either way — it measures blocks ahead, not the note.',
      'This shader ignores the beat clock. Multiply by exp(-6.0 * time.x) if you want the buffer to pulse with BPM.',
      'Change the 0.2 gain to 0.05. The meter still measures blocks, not loudness.',
      'A compile error still fills the error line, and the previous program keeps the buffer full.',
    ],
    swapExample: null,
    voices: [{ label: 'Shader', code: steadySine }],
    html: `
      <p><code>BufferReaderNode</code> is an <code>AudioWorkletNode</code> named <code>buffer-reader-processor</code>. The processor keeps a ring of <code>BLOCKS_PER_CHANNEL = 256</code> blocks per channel. <code>write(channel, block, samples)</code> stores a rendered chunk at <code>(block % 256) * 128</code>. Each <code>process</code> call, if the node is active and <code>written > blocks</code>, copies one block into the output. Otherwise it reports an underrun.</p>
      <p><code>WavenerdDeck.update</code> is the thing that fills that ring. It bails out when <code>bufferWriteBlocks - bufferReadBlocks &gt; latencyBlocks</code>, so the GPU is not asked to run further ahead than the latency budget. If the worklet says it underran, the deck jumps the write head to a block boundary at <code>read + latency</code> and continues. The class default budget is 16 blocks. Wavenerd’s <code>SettingsManager</code> defaults to 32, and <code>SettingsItemLatencyBlocks</code> shows that as milliseconds: <code>latencyBlocks * BLOCK_SIZE / sampleRate * 1000</code>.</p>
      <p>This player uses the class defaults: 16 blocks of render, 16 blocks of latency. The teal meter is write-head minus read-head, divided by the latency budget. It should sit near full while the sine holds. The course worklet is a smaller original ring with the same block size; Wavenerd then runs the deck into <code>HardClipNode</code> and a limiter, which this page does not.</p>
    `,
  },
  {
    id: 'cue',
    part: 'Changing the sound',
    title: 'Compile now, swap on the bar',
    files: [file(DECK, 'src/WavenerdDeck.ts'), file(DECK, 'src/renderer/Renderer.ts')],
    stage: 'audio',
    bpm: true,
    bpmNote: null,
    controls: [
      { id: 'pitch', label: 'Pitch', min: 55, max: 440, step: 1, value: 110, kind: 'uniform' },
    ],
    suggestions: [
      'Drag Pitch, then Cue next bar. The square shader declares the same pitch uniform, so the new timbre keeps the note.',
      'Both versions gate with exp(-5.0 * time.x). BPM changes the pulse. Change 5.0 in the sine only, then cue it, and the pulse length changes on the bar.',
      'Replace the square’s fract tooth with sin and the cue becomes a level change instead of a timbre change.',
      'Apply now skips the bar wait. Cue next bar waits until lamp 1 lights.',
    ],
    swapExample: cueSquare,
    voices: [{ label: 'Shader', code: cueSine }],
    html: `
      <p><code>compile(code)</code> does not change what you hear. It sets <code>cueStatus</code> to <code>'compiling'</code>, asks the renderer to link the shader, and on success stores a <code>WavenerdDeckProgram</code> (<code>code</code> plus the set of texture ids the source mentions) and moves the status to <code>'ready'</code>. A compile error goes through <code>__processErrorMessage</code>, which subtracts <code>shaderchunkPreLines</code> so the line number points at your code instead of the preamble. Status returns to <code>'none'</code> and the previous program keeps playing.</p>
      <p><code>applyCue</code> is the musical one. From <code>'ready'</code> it sets <code>'applying'</code> and</p>
      ${excerpt('wavenerd-deck · src/WavenerdDeck.ts · applyCue', `this.__programSwapTime
  = this.beatManager.time - this.beatManager.bar + this.beatManager.barSeconds;`)}
      <p>That is the transport time of the next bar line. On each <code>update</code>, the deck converts the remaining time into a sample index, <code>beginNext</code>. It renders the old program on <code>[0, beginNext)</code> and, if the cue is still pending, calls <code>applyCueImmediately</code> and renders the new program on the rest of the row. The scissor from lesson 3 is what makes that split a single framebuffer.</p>
      <p><code>applyCueImmediately</code> swaps <code>programCue</code> into <code>program</code> and clears the cue. <code>rewind</code> uses it so a queued edit does not wait for a bar that just got reset.</p>
      <p>This lesson starts as a sine gated by <code>time.x</code>, so BPM changes the pulse while the cue still swaps timbre. “Load square” only edits the buffer. “Cue next bar” is <code>compile</code> plus <code>applyCue</code>. Watch the four lamps: the timbre changes when lamp 1 lights, not when you click. “Apply now” is the immediate swap. Pitch is a uniform on both shaders.</p>
    `,
  },
  {
    id: 'params',
    part: 'Changing the sound',
    title: 'Knobs are four taps and a Lagrange fetch',
    files: [file(DECK, 'src/WavenerdDeckParam.ts'), file(DECK, 'src/renderer/shaderchunks.ts')],
    stage: 'audio',
    bpm: false,
    bpmNote: 'BPM is hidden. The tone follows time.w on purpose, so the thing you hear when you move Level is the paramFetch glide, not the beat clock.',
    controls: [
      { id: 'knob', label: 'Level', min: 0, max: 1, step: 0.001, value: 0.7, kind: 'param' },
      { id: 'pitch', label: 'Pitch', min: 80, max: 880, step: 1, value: 220, kind: 'uniform' },
    ],
    suggestions: [
      'Drag Level while the tone plays. paramFetch draws a cubic across the 2048-sample row, so loudness glides instead of stepping.',
      'Pitch is an immediate uniform. It jumps on the next render. Level does not.',
      'Multiply the wave by exp(-6.0 * time.x) and the beat clock becomes audible. The Level glide is still paramFetch.',
      'Replace paramFetch(param_knob) with param_knob.x and the level steps once per render instead of interpolating.',
    ],
    swapExample: null,
    voices: [{ label: 'Shader', code: knobTone }],
    html: `
      <p><code>setParam(name, value)</code> stores a <code>WavenerdDeckParam</code>. The value is not uploaded raw. Each <code>update</code>, before rendering, <code>__updateParams</code> shifts a four-tap history: <code>y3 = y2</code>, <code>y2 = y1</code>, <code>y1 = y0</code>, <code>y0 = value</code>. The uniform is named <code>param_</code> plus the name, and its value is <code>vec4(y0, y1, y2, y3)</code>.</p>
      <p><code>shaderchunkPre</code> gives every shader <code>paramFetch</code>. The source packs a cubic Lagrange into one <code>dot</code>. The nodes sit at x = 1, 0, −1, −2, and x itself is <code>floor(gl_FragCoord.x) / _framesPerRender</code>, so it runs from 0 at the first sample of this render to just under 1 at the last. At the left edge the weight on <code>y1</code> is 1. At the right edge the weight on <code>y0</code> is 1. The result is clamped to 0..1.</p>
      ${excerpt('wavenerd-deck · src/renderer/shaderchunks.ts · paramFetch', `float x = floor(gl_FragCoord.x) / _framesPerRender;
vec4 v = x - vec4(1.0, 0.0, -1.0, -2.0);
float y = dot(vec4(
  v.y * v.z * v.w,
  v.x * v.z * v.w,
  v.x * v.y * v.w,
  v.x * v.y * v.z
), param / vec4(6.0, -2.0, 2.0, -6.0));
return clamp(y, 0.0, 1.0);`)}
      <p>So a knob does not step once per sample, and it does not step once per render either. It is quantized to render boundaries (one history shift per <code>update</code>) and then drawn as a cubic across the 2048 samples. Move Level while the tone plays. The course preamble writes the same weights on four lines; the dot product above is the file.</p>
    `,
  },
  {
    id: 'textures',
    part: 'Changing the sound',
    title: 'Samples and wavetables are textures',
    files: [
      file(DECK, 'src/TextureStore.ts'),
      file(DECK, 'src/TextureStoreEntry.ts'),
      file(DECK, 'src/renderer/TextureUploader.ts'),
    ],
    stage: 'audio',
    bpm: true,
    bpmNote: null,
    controls: [
      { id: 'knob', label: 'Frame', min: 0, max: 1, step: 0.001, value: 0.45, kind: 'param' },
      { id: 'mixTom', label: 'Tom', min: 0, max: 1, step: 0.001, value: 0.72, kind: 'uniform' },
    ],
    suggestions: [
      'Frame is paramFetch into wavetableNearest’s y. It crossfades the four stored cycles.',
      'Tom mixes the sample against the table. time.x restarts the tom every beat, so BPM changes the hit rate.',
      'Change 110.0 in fract(110.0 * time.w) to hear the table’s playback rate.',
      'Pass time.w instead of time.x to sampleNearest and the tom plays once from the start of the transport, then stays silent after meta.w.',
    ],
    swapExample: null,
    voices: [{ label: 'Shader', code: sampleVoice }],
    html: `
      <p>Audio files do not stay audio files. <code>loadSample(name, arrayBuffer)</code> decodes them and asks <code>TextureStore</code> to store id <code>sample_</code> + name. <code>loadWavetable</code> uses <code>wavetable_</code>, and <code>loadImage</code> uses <code>image_</code>. <code>compile</code> marks a texture required when <code>code.search(id) !== -1</code>.</p>
      <p>The meta vec4 is the contract the fetch functions read:</p>
      <ul>
        <li>Sample: <code>[2048, ceil(length / 2048), sampleRate, duration]</code>. <code>TextureUploader.uploadSampleTexture</code> writes left into R and right into G of an <code>RGBA32F</code> texture, <code>NEAREST</code>, row-major.</li>
        <li>Wavetable: the comment says F32, 2048 samples per cycle. Meta is <code>[2048, frameCount, 0, 0]</code>, and only R is filled.</li>
        <li>Image: <code>[width, height, 0, 0]</code>, <code>RGBA8</code>, <code>LINEAR</code>.</li>
      </ul>
      <p><code>sampleNearest</code> returns silence when <code>time</code> passes <code>meta.w</code>. Otherwise <code>x = time * sampleRate / width</code>, and the uv picks that column plus the row <code>floor(x) / height</code>, centered on the texel. <code>sampleSinc</code> is the same lookup with an 11-tap window, <code>i</code> from −5 to 5, weighted by <code>sin(deft * PI) / (deft * PI)</code>. <code>example/example.frag</code> calls <code>sampleSinc</code> and <code>wavetableSinc</code>. This lesson calls the nearest pair so the indexing is easier to see.</p>
      <p>The tom is generated in the page, not taken from Wavenerd’s amen or 909 files. It is retriggered by <code>time.x</code>, so it restarts every beat. The knob is <code>position.y</code> of <code>wavetableNearest</code>, which crossfades the four cycles stored in <code>wavetable_waves</code>. One real quirk: <code>deleteSample</code> asks the store to delete <code>success_\${name}</code>, not <code>sample_\${name}</code>, so that call does not remove the texture <code>loadSample</code> created.</p>
    `,
  },
  {
    id: 'readback',
    part: 'Leaving the GPU',
    title: 'readPixels splits RGBA into two channels',
    files: [
      file(DECK, 'src/renderer/RendererWorker.worker.ts'),
      file(DECK, 'src/renderer/RendererImpl.ts'),
      file(DECK, 'src/renderer/glslBinaryLiterals.ts'),
    ],
    stage: 'audio',
    bpm: false,
    bpmNote: 'BPM is hidden. The chord is three absolute-time sines so you can hear the readback, not the clock. Fifth is the control that changes the sound.',
    controls: [
      { id: 'fifth', label: 'Fifth', min: 0, max: 1, step: 0.001, value: 0.65, kind: 'uniform' },
    ],
    suggestions: [
      'Drag Fifth. It scales the 329.63 Hz partial on both channels. BPM is not in this shader.',
      'Each fract keeps sin’s argument in 0..1. Delete a fract and, after time.w grows, that partial turns to mush. Rewind only sounded brighter because it zeroed time.',
      'Edit 220.0, 277.18, or 329.63.',
      'Swap one time.w for time.x and that partial restarts every beat.',
    ],
    swapExample: null,
    voices: [{ label: 'Shader', code: readbackChord }],
    html: `
      <p>The <code>Renderer</code> you call from the main thread is a mailbox. <code>RendererWorker.worker.ts</code> creates an <code>OffscreenCanvas</code>, a WebGL2 context, and one <code>RendererImpl</code>. Messages are the <code>RendererRequestData</code> union: <code>dispose</code>, <code>compile</code>, <code>applyCue</code>, <code>uploadTexture</code>, <code>deleteTexture</code>, <code>clearTextures</code>, <code>updateBlocksPerRender</code>, <code>render</code>, <code>readBuffer</code>.</p>
      <p><code>readBuffer</code> is the way samples come back. <code>RendererImpl</code> keeps a <code>ReadbackPool</code> of 16 pixel-pack buffers. It binds the framebuffer, calls <code>readPixels(0, 0, framesPerRender, 1, RGBA, FLOAT)</code> into the pack buffer, waits on <code>glWaitGPUCommandsCompleteAsync</code> (a <code>fenceSync</code> polled with <code>clientWaitSync</code>), then <code>getBufferSubData</code>. The unpack is explicit:</p>
      ${excerpt('wavenerd-deck · src/renderer/RendererImpl.ts · readBuffer', `leftChannel[i] = dstArray[i * 4 + 0];
rightChannel[i] = dstArray[i * 4 + 1];`)}
      <p>Those two <code>Float32Array</code>s are transferred to <code>BufferReaderNode.write</code>. The chord you hear is that unpack. This page draws on the main thread, then does the same pack-buffer read and fence wait so the strip and the speaker share one buffer. The worker and the pool of 16 are the production version of that wait. Reading the float row straight into a JavaScript array skips the fence; on some GPUs those bits are still uninitialized, and clamping them to ±1 is full-scale noise.</p>
      <p>Each partial is <code>sin(2π * fract(freq * time.w))</code>. The <code>fract</code> keeps the sine argument in range. Without it, a long <code>time.w</code> makes the GPU sine smear the highs, and Rewind sounds cleaner only because it sets transport time back to 0.</p>
      <p>Before link, <code>compile</code> runs <code>glslBinaryLiterals</code>. It does nothing unless the source contains <code>#pragma use_binary_literals</code>. With the pragma, tokens like <code>0b1010</code> become decimal. GLSL ES has no binary literals; the pragma is a preprocess step, not a uniform.</p>
    `,
  },
  {
    id: 'host-deck',
    part: 'Leaving the GPU',
    title: 'Two decks, one BeatManager',
    files: [file(APP, 'src/index.tsx'), file(DECK, 'src/WavenerdDeck.ts'), file(DECK, 'example/example.frag')],
    stage: 'audio',
    bpm: true,
    bpmNote: null,
    controls: [
      { id: 'kickDecay', label: 'Kick decay', min: 1, max: 16, step: 0.1, value: 5, kind: 'uniform' },
      { id: 'hatLevel', label: 'Hat level', min: 0, max: 0.6, step: 0.001, value: 0.2, kind: 'uniform' },
    ],
    suggestions: [
      'Kick decay is exp(-kickDecay * time.x) on deck A. Deck B never reads that uniform.',
      'Hat level scales deck B’s noise. The kick shader does not declare it.',
      'Change 0.5 * beat in the hat’s mod to 0.0 and the hat lands on the downbeat with the kick.',
      'BPM is shared: both decks read the same BeatManager, so the offbeat hat stays on the other side of the kick.',
    ],
    swapExample: null,
    voices: [
      { label: 'Deck A · kick', code: deckKick },
      { label: 'Deck B · hat', code: deckHat },
    ],
    html: `
      <p>Wavenerd’s <code>src/index.tsx</code> builds the instrument as two decks and a mixer:</p>
      ${excerpt('wavenerd · src/index.tsx', `const deckA = new WavenerdDeck(deckOptions);
const deckB = new WavenerdDeck({ ...deckOptions, hostDeck: deckA });
deckA.node.connect(mixer.inputA);
deckB.node.connect(mixer.inputB);`)}
      <p>A guest deck does not keep its own clock. <code>isPlaying</code>, <code>blockOffset</code>, and <code>beatManager</code> all defer to <code>hostDeck</code> when it is set. Each deck still has its own renderer, program, cue, and <code>BufferReaderNode</code>. That is why two shaders can be edited and cued independently and still land on the same bar line. <code>PlayOverlay</code> calls <code>play</code> on the host. Calling it only on the guest writes a flag the getter ignores.</p>
      <p>The stage is that arrangement, scaled down: two <code>mainAudio</code> programs, one shared <code>BeatManager</code>, summed into one worklet. Deck A is a pitch-drop sine. Deck B is a noise hat on the offbeat plus a quiet saw that ducks with <code>smoothstep</code> on <code>time.x</code>. <code>example/example.frag</code> builds a full track the same way — kick, hat sample, crash, rim, amen, wavetable — each voice a block added into <code>dest</code>. Its <code>kick()</code> quantizes phase with <code>lofi</code>. The kick here is a different curve, so you can hear the idea without taking the example’s arrangement.</p>
    `,
  },
  {
    id: 'color',
    part: 'The other framebuffer',
    title: 'shader-playground writes color',
    files: [
      file(PLAY, 'src/ShaderManager.ts'),
      file(PLAY, 'src/presets/index.ts'),
      file(PLAY, 'src/presets/raymarch/main.frag'),
    ],
    stage: 'color',
    bpm: false,
    bpmNote: null,
    controls: [
      { id: 'speed', label: 'Speed', min: 0, max: 2, step: 0.01, value: 0.55, kind: 'uniform' },
      { id: 'cellSize', label: 'Cell', min: 1.2, max: 6, step: 0.01, value: 3.2, kind: 'uniform' },
      { id: 'steps', label: 'Steps', min: 8, max: 64, step: 1, value: 48, kind: 'uniform' },
    ],
    suggestions: [
      'This buffer writes color, not sound. Speed, Cell, and Steps never become audio.',
      'Speed multiplies time on the camera. Set it to 0 and the fly-through freezes.',
      'Cell is the mod spacing. Smaller cells pack more spheres. The pointer still shifts them.',
      'Steps is the march limit. Drop it to 8 and the far field stops resolving. The loop still caps at 64.',
    ],
    swapExample: null,
    voices: [{ label: 'Fragment shader', code: colorField }],
    html: `
      <p>This framebuffer writes color, not sound. Play runs the march. There is no audio on this lesson. Speed, Cell, and Steps are uniforms on the picture.</p>
      <p>The same author keeps a picture-making sandbox, <a href="${PLAY}/README.md">shader-playground</a>. <code>ShaderManager</code> is the object there: <code>attachCanvas</code>, a list of <code>ShaderManagerLayer</code>, <code>time</code> / <code>deltaTime</code> / <code>frame</code>, <code>play</code> / <code>pause</code> / <code>rewind</code>, and a <code>MouseHandler</code>. It draws through <code>GLCat</code> from <code>@0b5vr/glcat-ts</code>. The exported presets in <code>src/presets/index.ts</code> are <code>raymarch</code>, <code>raymarchSdf</code>, <code>cyclicNoise</code>, <code>pathtracer</code>, <code>blossom</code>, <code>blur</code>, and a handful of grading passes.</p>
      <p><code>presets/raymarch/main.frag</code> is a fullscreen color shader. It declares <code>MARCH_ITER 128</code>, a <code>Camera</code> struct, and uniforms <code>time</code>, <code>resolution</code>, and <code>sampler0</code>. Nothing in that preset is an audio sample. The framebuffer is the canvas, not a 1×N float row, and nobody calls <code>readPixels</code> to feed a worklet.</p>
      <p>The shader on the right is an original march of repeated spheres, written for this lesson. Move the pointer: <code>mouse</code> shifts the cells, which is the playground’s <code>mousePosition</code> in miniature. It is here so the audio framebuffer has something to be compared with. The 4k intros (Planefiller and the rest) and the public Shadertoy page are that picture practice taken on stage. Their sources are not pasted here.</p>
    `,
  },
];
