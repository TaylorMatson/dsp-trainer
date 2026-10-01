/**
 * Thin coding-lab MVP: ordered signal-chain puzzles checked against an expected graph.
 * Full sandboxed code judge is deferred — see av-engine-port-plan §6.
 */

export type ChainNode = {
  id: string;
  label: string;
};

export type CodingChallenge = {
  id: string;
  moduleId: string;
  title: string;
  prompt: string;
  /** Distractors + correct nodes; UI presents as a pool to tap in order. */
  pool: ChainNode[];
  expectedOrder: string[];
  successExplanation: string;
  failHint: string;
};

export const CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'aliasing-chain',
    moduleId: 'sampling-aliasing',
    title: 'Build the aliasing demo chain',
    prompt:
      'Tap nodes in the order the Sampling & Aliasing demo builds audible output. Order matters.',
    pool: [
      { id: 'tone', label: 'Generate teaching-rate sine' },
      { id: 'resample', label: 'Resample to device rate' },
      { id: 'play', label: 'Play continuous buffer' },
      { id: 'fft', label: 'Run FFT magnitude' },
      { id: 'window', label: 'Apply Hann window' },
    ],
    expectedOrder: ['tone', 'resample', 'play'],
    successExplanation:
      'Correct: synthesize at teaching fs, upsample for the device, then loop playback. FFT/window belong to later spectrum modules.',
    failHint: 'Think about what must exist before you can hear the aliased pitch.',
  },
];

export function getCodingChallengeById(id: string): CodingChallenge | undefined {
  return CODING_CHALLENGES.find((challenge) => challenge.id === id);
}

export function getCodingChallengeForModule(
  moduleId: string,
): CodingChallenge | undefined {
  return CODING_CHALLENGES.find((challenge) => challenge.moduleId === moduleId);
}

/** Validate a user-built node order against the expected signal chain. */
export function checkSignalChainOrder(
  expectedOrder: ReadonlyArray<string>,
  submitted: ReadonlyArray<string>,
): boolean {
  if (submitted.length !== expectedOrder.length) return false;
  return expectedOrder.every((id, index) => submitted[index] === id);
}
