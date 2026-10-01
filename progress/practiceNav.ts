export type PracticeNavMode = 'passed-mid' | 'passed-last' | 'failed';

export type PracticeNavActions = {
  showNextModule: boolean;
  showBackToMenu: boolean;
  showBackToReading: boolean;
  showRetry: boolean;
};

export function practiceNavMode(options: {
  passed: boolean;
  hasNextModule: boolean;
}): PracticeNavMode {
  if (!options.passed) return 'failed';
  if (!options.hasNextModule) return 'passed-last';
  return 'passed-mid';
}

export function practiceNavActions(mode: PracticeNavMode): PracticeNavActions {
  switch (mode) {
    case 'failed':
      return {
        showNextModule: false,
        showBackToMenu: true,
        showBackToReading: true,
        showRetry: true,
      };
    case 'passed-last':
      return {
        showNextModule: false,
        showBackToMenu: true,
        showBackToReading: false,
        showRetry: false,
      };
    case 'passed-mid':
      return {
        showNextModule: true,
        showBackToMenu: true,
        showBackToReading: false,
        showRetry: false,
      };
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
