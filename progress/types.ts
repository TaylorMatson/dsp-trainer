export type ModuleProgress = {
  lessonDone: boolean;
  demoDone: boolean;
  practiceScore: number | null;
  practicePassed: boolean;
};

export type ProgressMap = Record<string, ModuleProgress>;

export function emptyModuleProgress(): ModuleProgress {
  return {
    lessonDone: false,
    demoDone: false,
    practiceScore: null,
    practicePassed: false,
  };
}

export function isModuleComplete(progress: ModuleProgress): boolean {
  return progress.lessonDone && progress.demoDone && progress.practicePassed;
}

export function scorePractice(
  answers: ReadonlyArray<number | null>,
  correctIndexes: ReadonlyArray<number>,
): number {
  let score = 0;
  for (let i = 0; i < correctIndexes.length; i += 1) {
    if (answers[i] === correctIndexes[i]) {
      score += 1;
    }
  }
  return score;
}
