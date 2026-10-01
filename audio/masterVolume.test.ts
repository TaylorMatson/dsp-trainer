import { describe, expect, it, beforeEach } from 'vitest';

import {
  getMasterVolume,
  resetMasterVolumeForTests,
  setMasterVolume,
  subscribeMasterVolume,
} from './masterVolume';

describe('masterVolume', () => {
  beforeEach(() => {
    resetMasterVolumeForTests();
  });

  it('clamps and notifies subscribers', () => {
    const seen: number[] = [];
    const unsub = subscribeMasterVolume((v) => {
      seen.push(v);
    });
    setMasterVolume(0.4);
    expect(getMasterVolume()).toBe(0.4);
    setMasterVolume(2);
    expect(getMasterVolume()).toBe(1);
    setMasterVolume(-1);
    expect(getMasterVolume()).toBe(0);
    expect(seen).toEqual([0.4, 1, 0]);
    unsub();
    setMasterVolume(0.5);
    expect(seen).toEqual([0.4, 1, 0]);
  });
});
