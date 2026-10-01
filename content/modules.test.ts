import { describe, expect, it } from 'vitest';

import { getModuleById, listReadyModules, MODULES } from './modules';
import { isModuleReady } from './schema';

const REQUIRED_READY_IDS = [
  'sampling-aliasing',
  'discrete-sine',
  'frequency-domain',
  'windowing',
  'fir-iir-filters',
  'convolution-intro',
] as const;

describe('curriculum pack content', () => {
  it('ships all v1 must-have topics as ready modules', () => {
    for (const id of REQUIRED_READY_IDS) {
      const module = getModuleById(id);
      expect(module, id).toBeDefined();
      expect(isModuleReady(module!)).toBe(true);
      expect(module!.lessons.length).toBeGreaterThan(0);
      expect(module!.demos.length).toBeGreaterThan(0);
      expect(module!.practice?.challenges.length).toBeGreaterThanOrEqual(2);
    }
    expect(listReadyModules().length).toBe(REQUIRED_READY_IDS.length);
  });

  it('keeps module ids unique and ordered', () => {
    const ids = MODULES.map((module) => module.id);
    expect(new Set(ids).size).toBe(ids.length);
    const orders = MODULES.map((module) => module.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('uses a known demo component for every demo', () => {
    const allowed = new Set([
      'aliasing-visualizer',
      'sine-generator',
      'spectrum-visualizer',
      'windowing-visualizer',
      'filter-visualizer',
      'convolution-visualizer',
    ]);
    for (const module of MODULES) {
      for (const demo of module.demos) {
        expect(allowed.has(demo.componentId)).toBe(true);
      }
    }
  });

  it('declares audio mode on every curriculum demo', () => {
    for (const module of MODULES) {
      for (const demo of module.demos) {
        expect(demo.audio?.mode === 'continuous' || demo.audio?.mode === 'oneshot').toBe(
          true,
        );
      }
    }
  });
});
