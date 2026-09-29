import { describe, expect, it } from 'vitest';

import {
  emptyModuleProgress,
  isModuleComplete,
  scorePractice,
} from './types';

describe('progress helpers', () => {
  it('scores practice answers', () => {
    expect(scorePractice([0, 1, 1], [0, 1, 2])).toBe(2);
    expect(scorePractice([null, 1], [0, 1])).toBe(1);
  });

  it('requires lesson, demo, and practice pass for completion', () => {
    expect(isModuleComplete(emptyModuleProgress())).toBe(false);
    expect(
      isModuleComplete({
        lessonDone: true,
        demoDone: true,
        practiceScore: 2,
        practicePassed: true,
      }),
    ).toBe(true);
  });
});
