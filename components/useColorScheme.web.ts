/**
 * Product chrome is always the GLSL `_ref` dark surface — ignore system scheme
 * so SSR and client match (and lesson → demo → practice stay one skin).
 */
export function useColorScheme(): 'dark' {
  return 'dark';
}
