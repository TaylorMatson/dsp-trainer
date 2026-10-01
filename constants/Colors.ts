import { AvTheme } from '@/constants/AvTheme';

/**
 * Navigation / Themed palette — always the GLSL `_ref` dark teaching surface.
 * Light and dark keys match so system scheme never reintroduces Expo defaults.
 */
const palette = {
  text: AvTheme.ink,
  background: AvTheme.bg,
  tint: AvTheme.accent,
  tabIconDefault: AvTheme.muted,
  tabIconSelected: AvTheme.accent,
};

export default {
  light: palette,
  dark: palette,
};
