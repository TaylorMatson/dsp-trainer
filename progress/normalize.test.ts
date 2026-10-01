import { describe, expect, it } from 'vitest';

import { normalizeModuleProgress, normalizeProgressMap } from './normalize';

describe('progress normalize', () => {
  it('rejects truthy non-boolean completion flags', () => {
    expect(
      normalizeModuleProgress({
        lessonDone: 'yes',
        demoDone: 1,
        practiceScore: '2',
        practicePassed: 'true',
      }),
    ).toEqual({
      lessonDone: false,
      demoDone: false,
      practiceScore: null,
      practicePassed: false,
    });
  });

  it('keeps earned boolean flags and numeric scores', () => {
    expect(
      normalizeModuleProgress({
        lessonDone: true,
        demoDone: true,
        practiceScore: 3,
        practicePassed: true,
      }),
    ).toEqual({
      lessonDone: true,
      demoDone: true,
      practiceScore: 3,
      practicePassed: true,
    });
  });

  it('drops empty module ids and normalizes the map', () => {
    const map = normalizeProgressMap({
      '': { lessonDone: true, demoDone: true, practicePassed: true, practiceScore: 2 },
      'convolution-intro': {
        lessonDone: false,
        demoDone: true,
        practicePassed: false,
        practiceScore: 1,
      },
    });
    expect(map['']).toBeUndefined();
    expect(map['convolution-intro']).toEqual({
      lessonDone: false,
      demoDone: true,
      practicePassed: false,
      practiceScore: 1,
    });
  });
});
