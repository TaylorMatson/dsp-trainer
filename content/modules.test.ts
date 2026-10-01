import { describe, expect, it } from 'vitest';

import { getModuleById, getNextModule, listReadyModules, MODULES } from './modules';
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

  it('gives each lesson substantial reading (paragraphs + equations/examples)', () => {
    for (const module of MODULES) {
      for (const lesson of module.lessons) {
        const paragraphs = lesson.blocks.filter((b) => b.type === 'paragraph');
        const callouts = lesson.blocks.filter((b) => b.type === 'callout');
        expect(paragraphs.length, module.id).toBeGreaterThanOrEqual(2);
        expect(callouts.length + paragraphs.length, module.id).toBeGreaterThanOrEqual(3);
        const joined = lesson.blocks.map((b) => b.text).join(' ');
        expect(joined.length, module.id).toBeGreaterThan(400);
      }
    }
  });

  it('explains Module 2 sine symbols in the lesson', () => {
    const lesson = getModuleById('discrete-sine')!.lessons[0]!;
    const text = lesson.blocks.map((b) => b.text).join(' ');
    expect(text).toMatch(/x\[n\]/);
    expect(text).toMatch(/\bfs\b/);
    expect(text).toMatch(/amplitude|A:/i);
    expect(text).toMatch(/phase|φ/i);
  });

  it('uses audible windowing demo defaults', () => {
    const demo = getModuleById('windowing')!.demos[0]!;
    const f = demo.params.find((p) => p.id === 'frequencyHz')!;
    const fs = demo.params.find((p) => p.id === 'sampleRateHz')!;
    expect(f.defaultValue).toBeGreaterThanOrEqual(200);
    expect(fs.defaultValue).toBeGreaterThanOrEqual(2048);
  });

  it('renames filter module UI away from playground', () => {
    const module = getModuleById('fir-iir-filters')!;
    const blob = [
      module.title,
      module.summary,
      ...module.lessons.flatMap((l) => l.blocks.map((b) => b.text)),
      ...module.demos.map((d) => `${d.title} ${d.summary}`),
    ].join(' ');
    expect(blob.toLowerCase()).not.toMatch(/playground/);
    expect(module.demos[0]!.title.toLowerCase()).toMatch(/demo/);
  });

  it('spectrum demo defaults to a non-integer cycle count (leakage visible)', () => {
    const demo = getModuleById('frequency-domain')!.demos[0]!;
    const f = demo.params.find((p) => p.id === 'frequencyHz')!.defaultValue;
    const fs = demo.params.find((p) => p.id === 'sampleRateHz')!.defaultValue;
    const n = 128;
    const cycles = (f * n) / fs;
    expect(Math.abs(cycles - Math.round(cycles))).toBeGreaterThan(0.2);
  });

  it('convolution demo exposes frequency slider and no useEcho param slider', () => {
    const demo = getModuleById('convolution-intro')!.demos[0]!;
    expect(demo.params.some((p) => p.id === 'frequencyHz')).toBe(true);
    expect(demo.params.some((p) => p.id === 'useEcho')).toBe(false);
  });

  it('puts plain-English lead-ins before equation callouts', () => {
    for (const module of MODULES) {
      for (const lesson of module.lessons) {
        for (let i = 0; i < lesson.blocks.length; i += 1) {
          const block = lesson.blocks[i]!;
          if (block.type !== 'callout') continue;
          if (!/[·×/=]|sin\(|y\[n\]|fN|fs\s*\/\s*N|Σ/.test(block.text)) continue;
          const prev = lesson.blocks[i - 1];
          expect(prev?.type, `${module.id} callout needs lead-in`).toBe('paragraph');
          expect(prev && 'text' in prev ? prev.text.length : 0).toBeGreaterThan(40);
        }
      }
    }
  });

  it('keeps spectrum-check equation question that points back to reading', () => {
    const practice = getModuleById('frequency-domain')!.practice!;
    const bin = practice.challenges.find((c) => c.id === 'bin-freq')!;
    expect(bin.prompt).toMatch(/fs\s*=/);
    expect(bin.explanation.toLowerCase()).toMatch(/formula|lesson|peek/);
  });

  it('resolves next module in curriculum order', () => {
    expect(getNextModule('sampling-aliasing')?.id).toBe('discrete-sine');
    expect(getNextModule('convolution-intro')).toBeUndefined();
  });
});
