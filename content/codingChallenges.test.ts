import { describe, expect, it } from 'vitest';

import {
  checkSignalChainOrder,
  CODING_CHALLENGES,
  getCodingChallengeForModule,
} from './codingChallenges';

describe('codingChallenges', () => {
  it('ships at least one module-linked chain challenge', () => {
    expect(CODING_CHALLENGES.length).toBeGreaterThanOrEqual(1);
    expect(getCodingChallengeForModule('sampling-aliasing')?.id).toBe('aliasing-chain');
  });

  it('validates exact signal-chain order', () => {
    const expected = ['tone', 'resample', 'play'];
    expect(checkSignalChainOrder(expected, ['tone', 'resample', 'play'])).toBe(true);
    expect(checkSignalChainOrder(expected, ['tone', 'play', 'resample'])).toBe(false);
    expect(checkSignalChainOrder(expected, ['tone', 'resample'])).toBe(false);
  });
});
