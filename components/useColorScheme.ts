/**
 * Product chrome is always the GLSL `_ref` dark surface — ignore system scheme
 * so lesson → demo → practice never flip to Expo light defaults.
 */
export function useColorScheme(): 'dark' {
  return 'dark';
}
