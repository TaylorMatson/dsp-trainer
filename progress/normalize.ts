import { emptyModuleProgress, type ModuleProgress, type ProgressMap } from '@/progress/types';

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asScore(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Coerce one module record; never treat truthy junk as earned completion. */
export function normalizeModuleProgress(raw: unknown): ModuleProgress {
  if (!raw || typeof raw !== 'object') {
    return emptyModuleProgress();
  }
  const record = raw as Record<string, unknown>;
  return {
    lessonDone: asBoolean(record.lessonDone),
    demoDone: asBoolean(record.demoDone),
    practiceScore: asScore(record.practiceScore),
    practicePassed: asBoolean(record.practicePassed),
  };
}

export function normalizeProgressMap(raw: unknown): ProgressMap {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  const out: ProgressMap = {};
  for (const [moduleId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof moduleId !== 'string' || moduleId.length === 0) continue;
    out[moduleId] = normalizeModuleProgress(value);
  }
  return out;
}
