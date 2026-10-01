/** Audio-shader sandwich for the course player.
 *
 * Uniform names and the main() contract follow wavenerd-deck
 * src/renderer/shaderchunks.ts (MIT, © 0b5vr). The helpers below are
 * written out as the Lagrange / sample formulas that file implements,
 * so a lesson shader can call paramFetch, sampleNearest, and
 * wavetableNearest the same way example/example.frag does.
 * See ATTRIBUTION.md.
 */

export const VERTEX = `#version 300 es
precision highp float;
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const PRELUDE = `#version 300 es
precision highp float;

uniform float bpm;
uniform float sampleRate;
uniform float _deltaSample;
uniform float _framesPerRender;
uniform vec4 timeLength;
uniform vec4 _timeHead;

out vec4 _fragColor;

float paramFetch(vec4 param) {
  float x = floor(gl_FragCoord.x) / _framesPerRender;
  float w0 = ((x - 0.0) * (x + 1.0) * (x + 2.0)) / 6.0;
  float w1 = ((x - 1.0) * (x + 1.0) * (x + 2.0)) / -2.0;
  float w2 = ((x - 1.0) * (x - 0.0) * (x + 2.0)) / 2.0;
  float w3 = ((x - 1.0) * (x - 0.0) * (x + 1.0)) / -6.0;
  return clamp(dot(param, vec4(w0, w1, w2, w3)), 0.0, 1.0);
}

vec2 sampleNearest(sampler2D s, vec4 meta, float time) {
  if (meta.w < time) {
    return vec2(0.0);
  }
  float x = time * meta.z / meta.x;
  vec2 uv = fract(vec2(x, floor(x) / meta.y)) + 0.5 / meta.xy;
  return texture(s, uv).xy;
}

float wavetableNearest(sampler2D w, vec4 meta, vec2 position) {
  float frame = floor(fract(position.y) * (meta.y - 1.0));
  float along = fract(position.y * (meta.y - 1.0));
  vec2 uv0 = fract(vec2(position.x, (frame + 0.5) / meta.y));
  vec2 uv1 = uv0 + vec2(0.0, 1.0 / meta.y);
  return mix(texture(w, uv0).x, texture(w, uv1).x, along);
}
`;

export const POST = `void main() {
  vec2 out2 = mainAudio(mod(_timeHead + floor(gl_FragCoord.x) * _deltaSample, timeLength));
  if (any(isnan(out2)) || any(isinf(out2))) {
    out2 = vec2(0.0);
  }
  _fragColor = vec4(out2.x, out2.y, 0.0, 1.0);
}
`;

export const PRELUDE_LINES = PRELUDE.split('\n').length;

/** RendererImpl.compile runs glslBinaryLiterals() before linking. */
export function rewriteBinaryLiterals(code: string): string {
  const pragma = /^[\t ]*#pragma\s+use_binary_literals[\t ]*$/m;
  if (!pragma.test(code)) return code;
  const stripped = code.replace(/^[\t ]*#pragma\s+use_binary_literals[\t ]*$/mg, '');
  return stripped.replace(/\b(0b[01]+)([u]?)\b/g, (_match, binary: string, modifier: string) => {
    return Number.parseInt(binary.slice(2), 2).toString() + modifier;
  });
}

export function remapShaderError(message: string): string {
  const clean = message.replace(/\0/g, '').trim();
  return clean.replace(/ERROR: (\d+):(\d+)/g, (_match, column: string, line: string) => {
    const userLine = Number.parseInt(line, 10) - PRELUDE_LINES + 1;
    return `ERROR: ${column}:${userLine}`;
  });
}
