import { speak } from './voice-feedback';

export interface RestTimerCallbacks {
  onTick: (remainingSeconds: number) => void;
  onComplete: () => void;
}

export function createRestTimer(
  durationSeconds: number,
  callbacks: RestTimerCallbacks,
  voiceEnabled: boolean,
) {
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let remaining = durationSeconds;

  function start() {
    remaining = durationSeconds;
    callbacks.onTick(remaining);

    intervalId = setInterval(() => {
      remaining--;
      callbacks.onTick(remaining);

      if (voiceEnabled) {
        if (remaining === 10) speak('Deset sekund');
        if (remaining === 5) speak('Pět');
        if (remaining === 3) speak('Tři');
        if (remaining === 2) speak('Dva');
        if (remaining === 1) speak('Jedna');
      }

      if (remaining <= 0) {
        cancel();
        if (voiceEnabled) speak('Jdeme na to!');
        callbacks.onComplete();
      }
    }, 1000);
  }

  function pause() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function reset() {
    cancel();
    remaining = durationSeconds;
    callbacks.onTick(remaining);
  }

  function cancel() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return { start, pause, reset, cancel };
}
