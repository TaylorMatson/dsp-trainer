import { describe, expect, it } from 'vitest';

import { practiceNavActions, practiceNavMode } from './practiceNav';

describe('practiceNav', () => {
  it('hides Next module on the last curriculum module when passed', () => {
    const mode = practiceNavMode({ passed: true, hasNextModule: false });
    expect(mode).toBe('passed-last');
    expect(practiceNavActions(mode)).toEqual({
      showNextModule: false,
      showBackToMenu: true,
      showBackToReading: false,
      showRetry: false,
    });
  });

  it('shows Next module only when passed with a successor', () => {
    const mode = practiceNavMode({ passed: true, hasNextModule: true });
    expect(mode).toBe('passed-mid');
    expect(practiceNavActions(mode).showNextModule).toBe(true);
  });

  it('on fail shows back to reading + menu, never Next module', () => {
    const withNext = practiceNavActions(
      practiceNavMode({ passed: false, hasNextModule: true }),
    );
    const last = practiceNavActions(
      practiceNavMode({ passed: false, hasNextModule: false }),
    );
    expect(withNext).toEqual({
      showNextModule: false,
      showBackToMenu: true,
      showBackToReading: true,
      showRetry: true,
    });
    expect(last.showNextModule).toBe(false);
    expect(last.showBackToReading).toBe(true);
  });
});
