/** Global master volume for demo playback (0–1). */

const DEFAULT_VOLUME = 0.85;

let masterVolume = DEFAULT_VOLUME;
const listeners = new Set<(value: number) => void>();

export function getMasterVolume(): number {
  return masterVolume;
}

export function setMasterVolume(next: number): void {
  const clamped = Math.min(1, Math.max(0, next));
  if (clamped === masterVolume) return;
  masterVolume = clamped;
  for (const listener of listeners) {
    listener(masterVolume);
  }
}

export function subscribeMasterVolume(listener: (value: number) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetMasterVolumeForTests(): void {
  masterVolume = DEFAULT_VOLUME;
  listeners.clear();
}
