/**
 * Voice Coach v8 — hardware-AEC TTS playback via VoiceEngine native module.
 *
 * Phase A v2 migration: `expo-audio` has been replaced by our custom
 * `VoiceEngine` native module which routes playback through a shared
 * AVAudioEngine with voiceProcessingEnabled = true. The mic physically
 * no longer hears the coach's own voice from the speaker, so the echo
 * loop that software gates in v1.4 could only mitigate is now solved
 * at the hardware level.
 *
 * What this file still owns (preserved from v7):
 * - Queue discipline (QUEUE_MAX=2, lastSpokenText dedup)
 * - isDraining single-flight guard
 * - paused state machine + paused re-check after TTS fetch
 * - Grace window logic (isSpeakingOrJustStopped, POST_SPEAKING_GRACE_MS,
 *   lastSpeakingEndedAt) — still useful as a defensive backstop during
 *   the first week of device testing, can be shrunk or removed later
 *
 * What moved to native:
 * - Audio playback (was expo-audio's createAudioPlayer)
 * - Playback completion detection (was playbackStatusUpdate listener)
 *
 * Public API unchanged:
 *   speak / cancelCurrent / pauseCoach / resumeCoach / stopVoice
 *   isSpeaking / isSpeakingOrJustStopped
 */

import { synthesizeVoice } from './api';
import {
  play as enginePlay,
  stopPlayback as engineStopPlayback,
  onPlaybackFinished,
  isAvailable as isVoiceEngineAvailable,
} from './voice-engine';

// ─── Module state ───────────────────────────────────────────────────────────
const cache = new Map<string, string>();
const CACHE_MAX = 30;
const queue: string[] = [];
const QUEUE_MAX = 2;
const POST_SPEAKING_GRACE_MS = 1200;
const SAFETY_TIMEOUT_MS = 60_000;

let speaking = false;
let isDraining = false; // single-flight guard for playNext()
let lastSpeakingEndedAt = 0;
let lastSpokenText = '';
let paused = false; // true when MIC is active

// Holds a callback that interrupts the currently playing phrase. Set inside
// awaitPlaybackEnd() while a phrase is playing; null otherwise.
let cancelCurrentPlayback: (() => void) | null = null;

// ─── Queue drain loop ───────────────────────────────────────────────────────
async function playNext(): Promise<void> {
  // Single-flight guard: only one drain loop runs at a time, even if a
  // recursive call fires from a completion callback while we are
  // mid-iteration.
  if (isDraining || queue.length === 0 || speaking || paused) return;

  if (!isVoiceEngineAvailable()) {
    console.warn('[VoiceCoach] VoiceEngine native module not available, clearing queue');
    queue.length = 0;
    return;
  }

  isDraining = true;
  try {
    while (queue.length > 0 && !paused) {
      const text = queue.shift()!;
      await playOnePhrase(text);
    }
  } finally {
    isDraining = false;
  }
}

async function playOnePhrase(text: string): Promise<void> {
  speaking = true;
  console.log('[VoiceCoach] Playing:', text.substring(0, 40));

  try {
    const base64 = await fetchOrCacheAudio(text);
    if (!base64) return;

    // Re-check the paused flag AFTER the fetch: pauseCoach() may have been
    // called while we were awaiting the TTS response. Unshift the text
    // back to the front of the queue so resumeCoach() replays it.
    if (paused) {
      queue.unshift(text);
      lastSpokenText = '';
      return;
    }

    await enginePlay(base64);
    console.log('[VoiceCoach] Playing audio...');
    await awaitPlaybackEnd(text);
  } catch (e: any) {
    console.warn('[VoiceCoach] playOnePhrase error:', e.message);
    // Allow the same phrase to be re-emitted after an error — without this,
    // a one-off network blip could silently mute the same phrase forever.
    lastSpokenText = '';
  } finally {
    speaking = false;
    lastSpeakingEndedAt = Date.now();
    cancelCurrentPlayback = null;
  }
}

// ─── Audio fetch + cache ────────────────────────────────────────────────────
async function fetchOrCacheAudio(text: string): Promise<string | null> {
  const cached = cache.get(text);
  if (cached) return cached;

  console.log('[VoiceCoach] Fetching TTS from API...');
  const result = await synthesizeVoice(text);
  if (!result?.audioBase64) {
    console.warn('[VoiceCoach] API returned no audio for:', text);
    return null;
  }
  console.log('[VoiceCoach] Got audio, length:', result.audioBase64.length);
  cache.set(text, result.audioBase64);
  evictOldestCacheEntry();
  return result.audioBase64;
}

function evictOldestCacheEntry(): void {
  if (cache.size <= CACHE_MAX) return;
  const k = cache.keys().next().value;
  if (k) cache.delete(k);
}

// ─── Playback completion ────────────────────────────────────────────────────
function awaitPlaybackEnd(text: string): Promise<void> {
  return new Promise<void>((resolve) => {
    let resolved = false;
    let canceled = false;
    let unsubscribe: (() => void) | null = null;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const done = () => {
      if (resolved) return;
      resolved = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      unsubscribe?.();

      if (canceled) {
        // Allow coaching-engine to re-emit the same phrase after resume
        // without being deduped by the `text === lastSpokenText` guard.
        lastSpokenText = '';
        console.log('[VoiceCoach] Canceled:', text.substring(0, 40));
      }

      resolve();
    };

    // Register external cancel hook so pauseCoach() / cancelCurrent() can
    // interrupt the in-flight phrase. Invoking the hook triggers a native
    // stopPlayback(), which fires `playbackFinished` via the subscription
    // below — but we also call done() immediately so we don't race with
    // the native event.
    cancelCurrentPlayback = () => {
      canceled = true;
      engineStopPlayback();
      done();
    };

    // Subscribe to the `playbackFinished` event from the native module.
    // VoiceEngine emits this on natural completion OR when stopPlayback()
    // is called — both paths funnel through here.
    unsubscribe = onPlaybackFinished(done);

    // Safety: if the native module never emits playbackFinished (corrupt
    // audio, module crash), give up after 60s. Long Claude answers can
    // hit 20-25s comfortably, so 60s has plenty of headroom.
    safetyTimer = setTimeout(() => {
      if (!resolved) {
        console.warn('[VoiceCoach] Safety timeout hit for:', text.substring(0, 40));
      }
      done();
    }, SAFETY_TIMEOUT_MS);
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────
export async function speak(text: string): Promise<void> {
  if (paused) return; // Don't queue anything while MIC is active
  if (text === lastSpokenText) return;
  lastSpokenText = text;
  if (queue.length >= QUEUE_MAX) queue.shift();
  queue.push(text);
  playNext();
}

export function cancelCurrent(): void {
  if (cancelCurrentPlayback) {
    console.log('[VoiceCoach] cancelCurrent: interrupting in-flight phrase');
    cancelCurrentPlayback();
  }
}

/**
 * Returns true if the coach is currently playing a phrase.
 * Kept for backward compat. Prefer isSpeakingOrJustStopped() for echo
 * gating because it also covers the grace window after playback ends.
 */
export function isSpeaking(): boolean {
  return speaking;
}

/**
 * Returns true if the coach is currently speaking OR stopped speaking
 * within the last POST_SPEAKING_GRACE_MS milliseconds.
 *
 * With hardware AEC via VoiceEngine, this gate is largely redundant —
 * the mic no longer physically hears the coach, so echo transcripts
 * shouldn't arrive at all. It's kept as a defensive backstop during the
 * first week of device testing and can be shrunk or removed later once
 * continuous mode is proven stable.
 */
export function isSpeakingOrJustStopped(): boolean {
  if (speaking) return true;
  if (lastSpeakingEndedAt === 0) return false;
  return Date.now() - lastSpeakingEndedAt < POST_SPEAKING_GRACE_MS;
}

export function pauseCoach(): void {
  paused = true;
  cancelCurrent(); // interrupt mid-phrase, but leave queue intact
  console.log('[VoiceCoach] Paused (MIC active)');
}

export function resumeCoach(): void {
  paused = false;
  console.log('[VoiceCoach] Resumed');
  playNext(); // drain whatever is still in queue
}

/**
 * Full stop: clear queue + cancel current phrase. Delegates to
 * cancelCurrent() so `speaking` is cleared exactly once by the done()
 * callback in awaitPlaybackEnd().
 */
export function stopVoice(): void {
  queue.length = 0;
  cancelCurrent();
}
