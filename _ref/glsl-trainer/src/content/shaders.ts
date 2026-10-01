export const pulseTone = `uniform float pitch;
uniform float level;

vec2 mainAudio(vec4 time) {
  // time.x restarts every beat, so BPM changes how often this pulse speaks.
  float env = exp(-7.0 * time.x);
  float tone = sin(6.28318530718 * fract(pitch * time.w));
  return vec2(level * env * tone);
}
`;

export const sawTooth = `uniform float pitch;
uniform float level;

vec2 mainAudio(vec4 time) {
  // Absolute time. BPM cannot move this; the buzz is the raw tooth.
  float phase = fract(pitch * time.w);
  float saw = 2.0 * phase - 1.0;
  return vec2(level * saw);
}
`;

export const rowSine = `uniform float pitch;
uniform float level;

vec2 mainAudio(vec4 time) {
  float tone = sin(6.28318530718 * fract(pitch * time.w));
  return vec2(level * tone, 0.45 * level * tone);
}
`;

export const beatClick = `uniform float tickDecay;
uniform float accent;

vec2 mainAudio(vec4 time) {
  // time.x is seconds since the last beat, time.y since the last bar.
  float tick = exp(-tickDecay * time.x);
  float bar = exp(-18.0 * time.y);
  return vec2(0.45 * tick + accent * bar);
}
`;

export const hatGrid = `uniform float decay;
uniform float level;

vec2 mainAudio(vec4 time) {
  float grid = 60.0 / bpm / 4.0;
  float local = mod(time.y, grid);
  float seed = floor(time.y / grid);
  float noise = fract(sin(seed * 91.713) * 47453.5453) * 2.0 - 1.0;
  float hat = noise * exp(-decay * local);
  return vec2(level * hat);
}
`;

export const barNotes = `uniform float decay;

vec2 mainAudio(vec4 time) {
  float beatDur = 60.0 / bpm;
  float index = floor(time.y / beatDur);
  float local = mod(time.y, beatDur);
  float pitch = index < 1.0 ? 110.0
    : index < 2.0 ? 138.59
    : index < 3.0 ? 164.81
    : 220.0;
  // Phase and envelope both restart on local, so a fast decay is silent
  // at the next note. Lower Decay and the leftover amplitude clicks.
  float env = exp(-decay * local);
  float tone = sin(6.28318530718 * pitch * local);
  return vec2(0.28 * env * tone);
}
`;

export const cueSine = `uniform float pitch;

vec2 mainAudio(vec4 time) {
  float env = exp(-5.0 * time.x);
  float wave = sin(6.28318530718 * fract(pitch * time.w));
  return vec2(0.4 * env * wave);
}
`;

export const cueSquare = `uniform float pitch;

vec2 mainAudio(vec4 time) {
  float env = exp(-5.0 * time.x);
  float wave = 2.0 * fract(pitch * time.w) - 1.0;
  return vec2(0.22 * env * wave);
}
`;

export const knobTone = `uniform vec4 param_knob;
uniform float pitch;

vec2 mainAudio(vec4 time) {
  float level = paramFetch(param_knob);
  float wave = sin(6.28318530718 * fract(pitch * time.w));
  return vec2(0.35 * level * wave);
}
`;

export const sampleVoice = `uniform vec4 param_knob;
uniform float mixTom;
uniform sampler2D sample_tom;
uniform vec4 sample_tom_meta;
uniform sampler2D wavetable_waves;
uniform vec4 wavetable_waves_meta;

vec2 mainAudio(vec4 time) {
  float frame = paramFetch(param_knob);
  vec2 tom = sampleNearest(sample_tom, sample_tom_meta, time.x);
  float cycle = fract(110.0 * time.w);
  float table = wavetableNearest(wavetable_waves, wavetable_waves_meta, vec2(cycle, frame));
  float duck = smoothstep(0.0, 0.09, time.x);
  return mixTom * tom * 0.85 + vec2((1.0 - mixTom) * 0.4 * duck * table);
}
`;

export const readbackChord = `uniform float fifth;

vec2 mainAudio(vec4 time) {
  // fract keeps sin's argument in range. A raw freq * time.w grows until
  // the GPU sine turns the highs into mush; rewind only sounded cleaner
  // because it set time back to 0.
  float a = sin(6.28318530718 * fract(220.0 * time.w));
  float b = sin(6.28318530718 * fract(277.18 * time.w));
  float c = sin(6.28318530718 * fract(329.63 * time.w));
  return 0.14 * vec2(a + fifth * c, b + fifth * c);
}
`;

export const deckKick = `uniform float kickDecay;

vec2 mainAudio(vec4 time) {
  float t = time.x;
  float env = exp(-kickDecay * t);
  float phase = 46.0 * t - 3.8 * exp(-32.0 * t);
  float kick = env * sin(6.28318530718 * phase);
  return vec2(0.6 * kick);
}
`;

export const deckHat = `uniform float hatLevel;

vec2 mainAudio(vec4 time) {
  float beat = 60.0 / bpm;
  float hatT = mod(time.x - 0.5 * beat, beat);
  // Sample index inside the beat. time.x stays small, so this does not
  // collapse the way floor(time.w * sampleRate) does after a long transport.
  float tick = floor(time.x * 44100.0);
  float noise = fract(sin(tick * 91.345) * 47453.5453) * 2.0 - 1.0;
  float hat = noise * exp(-48.0 * hatT);
  float body = 2.0 * fract(55.0 * time.w) - 1.0;
  float duck = smoothstep(0.0, 0.1, time.x);
  return vec2(hatLevel * hat + 0.07 * duck * body);
}
`;

export const steadySine = `uniform float pitch;

vec2 mainAudio(vec4 time) {
  float tone = sin(6.28318530718 * fract(pitch * time.w));
  return vec2(0.2 * tone);
}
`;

export const colorField = `#version 300 es
precision highp float;

out vec4 fragColor;
uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;
uniform float speed;
uniform float cellSize;
uniform float steps;

float sphere(vec3 p, float radius) {
  return length(p) - radius;
}

float mapScene(vec3 p) {
  vec3 q = mod(p + vec3(mouse.x, 0.0, mouse.y) * 2.0, cellSize) - 0.5 * cellSize;
  float radius = 0.45 + 0.12 * sin(time + p.y);
  return sphere(q, radius);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution) / resolution.y;
  vec3 origin = vec3(0.0, 0.0, time * speed);
  vec3 ray = normalize(vec3(uv, 1.15));
  float traveled = 0.0;
  for (int i = 0; i < 64; i++) {
    if (float(i) >= steps) break;
    float distance = mapScene(origin + ray * traveled);
    if (distance < 0.002) break;
    traveled += distance;
    if (traveled > 28.0) break;
  }
  vec3 hit = origin + ray * traveled;
  vec3 normal = normalize(vec3(
    mapScene(hit + vec3(0.012, 0.0, 0.0)) - mapScene(hit - vec3(0.012, 0.0, 0.0)),
    mapScene(hit + vec3(0.0, 0.012, 0.0)) - mapScene(hit - vec3(0.0, 0.012, 0.0)),
    mapScene(hit + vec3(0.0, 0.0, 0.012)) - mapScene(hit - vec3(0.0, 0.0, 0.012))
  ));
  float diffuse = max(dot(normal, normalize(vec3(0.45, 0.75, 0.35))), 0.0);
  float arrived = step(traveled, 27.5) * exp(-0.07 * traveled);
  vec3 color = mix(vec3(0.06, 0.07, 0.05), vec3(0.62, 0.78, 0.42) * (0.15 + diffuse), arrived);
  fragColor = vec4(color, 1.0);
}
`;
