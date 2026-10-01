/** Registry so leaving a demo (e.g. Continue to practice) can stop all shell audio. */

type Stoppable = {
  pause: () => void;
  stop?: () => void;
};

const active = new Set<Stoppable>();
const stopListeners = new Set<() => void>();

export function registerDemoAudio(controller: Stoppable): () => void {
  active.add(controller);
  return () => {
    active.delete(controller);
  };
}

/** Stop every registered demo player and notify shells to reset transport UI. */
export function stopAllDemoAudio(): void {
  for (const controller of [...active]) {
    try {
      if (controller.stop) {
        controller.stop();
      } else {
        controller.pause();
      }
    } catch {
      // ignore teardown races
    }
  }
  for (const listener of stopListeners) {
    listener();
  }
}

export function subscribeDemoAudioStop(listener: () => void): () => void {
  stopListeners.add(listener);
  return () => {
    stopListeners.delete(listener);
  };
}

export function resetDemoAudioBusForTests(): void {
  active.clear();
  stopListeners.clear();
}

export function activeDemoAudioCountForTests(): number {
  return active.size;
}
