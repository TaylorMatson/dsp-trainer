import { DarkTheme, type Theme } from 'expo-router';

import { AvTheme } from '@/constants/AvTheme';

/** React Navigation theme aligned with AvDemoShell / lesson chrome. */
export const AvNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: AvTheme.accent,
    background: AvTheme.bg,
    card: AvTheme.bg,
    text: AvTheme.ink,
    border: AvTheme.line,
    notification: AvTheme.warn,
  },
};
