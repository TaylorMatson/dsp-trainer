/**
 * Interactive demo aesthetic tokens measured from local `_ref/glsl-trainer/src/style.css`.
 * Used on demo stages so ear+eye demos match GLSL Trainer’s dark teaching surface.
 */
export const AvTheme = {
  bg: '#12140f',
  bgRaise: '#1b1e16',
  canvas: '#0c0e0a',
  line: '#313628',
  ink: '#e7e1d2',
  muted: '#a39c8b',
  accent: '#dff25a',
  accentInk: '#1a1d08',
  teal: '#8fd0c4',
  warn: '#ffb4a2',
  plotPrimary: '#dff25a',
  plotSecondary: '#8fd0c4',
  plotFiltered: '#8fd0c4',
  plotKernel: '#ffb4a2',
  grid: '#313628',
} as const;

/** Device-rate target for audible demo output (teaching fs may differ). */
export const DEFAULT_OUTPUT_SAMPLE_RATE_HZ = 44_100;

/** Continuous loops are this long before looping. */
export const CONTINUOUS_BUFFER_SECONDS = 1.25;
