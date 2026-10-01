import { describe, expect, it, beforeEach } from 'vitest';

import {
  activeDemoAudioCountForTests,
  registerDemoAudio,
  resetDemoAudioBusForTests,
  stopAllDemoAudio,
  subscribeDemoAudioStop,
} from './demoAudioBus';

describe('demoAudioBus', () => {
  beforeEach(() => {
    resetDemoAudioBusForTests();
  });

  it('registers controllers and stops them globally', () => {
    const pauses: string[] = [];
    const a = { pause: () => pauses.push('a') };
    const b = { pause: () => pauses.push('b') };
    const unregA = registerDemoAudio(a);
    registerDemoAudio(b);
    expect(activeDemoAudioCountForTests()).toBe(2);

    let stops = 0;
    const unsub = subscribeDemoAudioStop(() => {
      stops += 1;
    });

    stopAllDemoAudio();
    expect(pauses.sort()).toEqual(['a', 'b']);
    expect(stops).toBe(1);

    unregA();
    expect(activeDemoAudioCountForTests()).toBe(1);
    unsub();
  });
});
