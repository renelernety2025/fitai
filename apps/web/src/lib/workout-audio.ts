/**
 * Simple beep sounds via Web Audio API for workout mode.
 * No external files — generates tones programmatically.
 */

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

/** Short beep for exercise switch. */
export function beepSwitch(): void {
  playTone(880, 0.15);
}

/** Double beep for rest start. */
export function beepRest(): void {
  playTone(660, 0.1);
  setTimeout(() => playTone(660, 0.1), 150);
}

/** Triple ascending beep for workout start/finish. */
export function beepStart(): void {
  playTone(440, 0.1);
  setTimeout(() => playTone(660, 0.1), 200);
  setTimeout(() => playTone(880, 0.2), 400);
}

/** Countdown beep (3, 2, 1). */
export function beepCountdown(): void {
  playTone(440, 0.08);
}

function playTone(freq: number, duration: number): void {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available (SSR, permissions)
  }
}
