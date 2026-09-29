import { describe, expect, it } from 'vitest';

import { getModuleById, MODULES } from './modules';

describe('Module 1 content', () => {
  it('ships Sampling & Aliasing as ready with lesson, demo, practice', () => {
    const module = getModuleById('sampling-aliasing');
    expect(module).toBeDefined();
    expect(module?.status).toBe('ready');
    expect(module?.lessons.length).toBeGreaterThan(0);
    expect(module?.demos.length).toBeGreaterThan(0);
    expect(module?.practice?.challenges.length).toBeGreaterThanOrEqual(2);
  });

  it('keeps module ids unique', () => {
    const ids = MODULES.map((module) => module.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
