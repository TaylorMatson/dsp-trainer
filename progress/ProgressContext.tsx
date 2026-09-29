import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  clearProgressMap,
  getModuleProgress,
  loadProgressMap,
  patchModuleProgress,
} from '@/progress/store';
import {
  emptyModuleProgress,
  isModuleComplete,
  type ModuleProgress,
  type ProgressMap,
} from '@/progress/types';

type ProgressContextValue = {
  ready: boolean;
  map: ProgressMap;
  getProgress: (moduleId: string) => ModuleProgress;
  isComplete: (moduleId: string) => boolean;
  markLessonDone: (moduleId: string) => Promise<void>;
  markDemoDone: (moduleId: string) => Promise<void>;
  recordPractice: (
    moduleId: string,
    score: number,
    passed: boolean,
  ) => Promise<void>;
  resetAll: () => Promise<void>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [map, setMap] = useState<ProgressMap>({});

  useEffect(() => {
    let cancelled = false;
    loadProgressMap().then((loaded) => {
      if (!cancelled) {
        setMap(loaded);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const getProgress = useCallback(
    (moduleId: string) => getModuleProgress(map, moduleId),
    [map],
  );

  const isComplete = useCallback(
    (moduleId: string) => isModuleComplete(getModuleProgress(map, moduleId)),
    [map],
  );

  const markLessonDone = useCallback(async (moduleId: string) => {
    const next = await patchModuleProgress(moduleId, { lessonDone: true });
    setMap(next);
  }, []);

  const markDemoDone = useCallback(async (moduleId: string) => {
    const next = await patchModuleProgress(moduleId, { demoDone: true });
    setMap(next);
  }, []);

  const recordPractice = useCallback(
    async (moduleId: string, score: number, passed: boolean) => {
      const next = await patchModuleProgress(moduleId, {
        practiceScore: score,
        practicePassed: passed,
      });
      setMap(next);
    },
    [],
  );

  const resetAll = useCallback(async () => {
    await clearProgressMap();
    setMap({});
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      ready,
      map,
      getProgress,
      isComplete,
      markLessonDone,
      markDemoDone,
      recordPractice,
      resetAll,
    }),
    [
      ready,
      map,
      getProgress,
      isComplete,
      markLessonDone,
      markDemoDone,
      recordPractice,
      resetAll,
    ],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return ctx;
}

export function useModuleProgress(moduleId: string): ModuleProgress {
  const { getProgress } = useProgress();
  return getProgress(moduleId) ?? emptyModuleProgress();
}
