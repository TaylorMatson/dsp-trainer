import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizeProgressMap } from '@/progress/normalize';
import {
  emptyModuleProgress,
  type ModuleProgress,
  type ProgressMap,
} from '@/progress/types';

/** v2: strict boolean coerce + wipe v1 keys that could show unearned Module 6 checks. */
const STORAGE_KEY = 'dsp-trainer.progress.v2';
const LEGACY_STORAGE_KEY = 'dsp-trainer.progress.v1';

export async function loadProgressMap(): Promise<ProgressMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // Drop legacy blob so stale QA checkmarks cannot reappear as "defaults".
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeProgressMap(parsed);
  } catch {
    return {};
  }
}

export async function saveProgressMap(map: ProgressMap): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function clearProgressMap(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_STORAGE_KEY]);
}

export function getModuleProgress(map: ProgressMap, moduleId: string): ModuleProgress {
  return map[moduleId] ?? emptyModuleProgress();
}

export async function patchModuleProgress(
  moduleId: string,
  patch: Partial<ModuleProgress>,
): Promise<ProgressMap> {
  const map = await loadProgressMap();
  const current = getModuleProgress(map, moduleId);
  const next: ProgressMap = {
    ...map,
    [moduleId]: { ...current, ...patch },
  };
  await saveProgressMap(next);
  return next;
}
