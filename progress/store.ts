import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  emptyModuleProgress,
  type ModuleProgress,
  type ProgressMap,
} from '@/progress/types';

const STORAGE_KEY = 'dsp-trainer.progress.v1';

export async function loadProgressMap(): Promise<ProgressMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function saveProgressMap(map: ProgressMap): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function clearProgressMap(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
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
