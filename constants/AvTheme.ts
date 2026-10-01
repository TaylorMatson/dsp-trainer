/**
 * Shared product aesthetic tokens from local `_ref/glsl-trainer/src/style.css`.
 * Used across lesson / demo / practice so the loop feels like one product.
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
  danger: '#ff8f7a',
  dangerFill: 'rgba(255, 143, 122, 0.16)',
  success: '#8fd0c4',
  successFill: 'rgba(143, 208, 196, 0.18)',
  accentFill: 'rgba(223, 242, 90, 0.12)',
  raiseFill: 'rgba(49, 54, 40, 0.55)',
  lampOff: '#2a2e22',
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
