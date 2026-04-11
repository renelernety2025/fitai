/**
 * Voice Coach v7 — ElevenLabs TTS via expo-audio.
 *
 * Listener-based playback completion + external cancellation API so
 * pauseCoach() can interrupt mid-phrase without dropping the rest of
 * the queue. Single-flight drain via `isDraining` prevents re-entry
 * when a recursive playNext() call fires from inside done().
 *
 * Public API:
 * - speak(text)      queue a phrase for TTS
 * - pauseCoach()     interrupt current phrase + block new phrases (preserves queue)
 * - resumeCoach()    allow playback again + drain remaining queue
 * - cancelCurrent()  interrupt current phrase only (leaves `paused` untouched)
 * - stopVoice()      full stop: clear queue + cancel current phrase
 * - isSpeaking()     raw boolean
 * - isSpeakingOrJustStopped()  echo gate with grace window — prefer this
 */

import { synthesizeVoice } from './api';

// ─── Module state ───────────────────────────────────────────────────────────
const cache = new Map<string, string>();
const CACHE_MAX = 30;
const queue: string[] = [];
const QUEUE_MAX = 2;
const SAFETY_TIMEOUT_MS = 60_000;
const POST_SPEAKING_GRACE_MS = 1200;

let currentPlayer: any = null;
let speaking = false;
let isDraining = false; // single-flight guard for playNext()
let lastSpeakingEndedAt = 0;
let lastSpokenText = '';
let paused = false; // true when MIC is active
let audioModuleLoaded = false;
let createPlayer: any = null;

// Holds a callback that interrupts the currently playing phrase. Set inside
// awaitPlaybackEnd() when a player is actively playing; null otherwise.
let cancelCurrentPlayback: (() => void) | null = null;

// ─── Native module lazy load ────────────────────────────────────────────────
function loadAudioModule(): boolean {
  if (audioModuleLoaded) return !!createPlayer;
  audioModuleLoaded = true;
  try {
    const mod = require('expo-audio');
    createPlayer = mod.createAudioPlayer;
    console.log('[VoiceCoach] expo-audio loaded OK');
    return true;
  } catch (e: any) {
    console.warn('[VoiceCoach] expo-audio not available:', e.message);
    return false;
  }
}

// ─── Queue drain loop ───────────────────────────────────────────────────────
async function playNext(): Promise<void> {
  // Single-flight guard: only one drain loop runs at a time, even if a
  // recursive call fires from done() → playNext() while we are mid-iteration.
  if (isDraining || queue.length === 0 || speaking || paused) return;
  if (!loadAudioModule()) {
    console.warn('[VoiceCoach] No audio module, clearing queue');
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
    // called while we were awaiting the TTS response. At that moment
    // cancelCurrentPlayback was null (no player registered yet), so the
    // cancel was a no-op. Catching it here prevents a phrase from playing
    // after the user has already asked for silence. The shifted text goes
    // back to the front of the queue so resumeCoach() replays it.
    if (paused) {
      queue.unshift(text);
      lastSpokenText = '';
      return;
    }

    disposeCurrentPlayer();
    const player = createPlayer(`data:audio/mpeg;base64,${base64}`);
    currentPlayer = player;
    player.play();
    console.log('[VoiceCoach] Playing audio...');
    await awaitPlaybackEnd(player, text);
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

function disposeCurrentPlayer(): void {
  if (!currentPlayer) return;
  try { currentPlayer.remove(); } catch {}
  currentPlayer = null;
}

// ─── Playback completion ────────────────────────────────────────────────────
function awaitPlaybackEnd(player: any, text: string): Promise<void> {
  return new Promise<void>((resolve) => {
    let resolved = false;
    let canceled = false;
    let sub: any = null;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const done = () => {
      if (resolved) return;
      resolved = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      try { sub?.remove?.(); } catch {}
      try { player.remove(); } catch {}
      if (currentPlayer === player) currentPlayer = null;

      if (canceled) {
        // Allow coaching-engine to re-emit the same phrase after resume
        // without being deduped by the `text === lastSpokenText` guard.
        lastSpokenText = '';
        console.log('[VoiceCoach] Canceled:', text.substring(0, 40));
      }

      resolve();
    };

    cancelCurrentPlayback = () => { canceled = true; done(); };

    try {
      sub = player.addListener('playbackStatusUpdate', (status: any) => {
        if (status?.didJustFinish) done();
      });
    } catch (e: any) {
      console.warn('[VoiceCoach] addListener failed, relying on safety timer:', e.message);
    }

    // Safety: the listener is unreliable in some expo-audio states
    // (corrupt audio, module error, etc.). 60s comfortably covers long
    // Claude answers (~25s typical max).
    safetyTimer = setTimeout(() => {
      if (!resolved) console.warn('[VoiceCoach] Safety timeout hit for:', text.substring(0, 40));
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
 * Kept for backward compat. Prefer isSpeakingOrJustStopped() for echo gating
 * because it also covers the grace window after playback ends.
 */
export function isSpeaking(): boolean {
  return speaking;
}

/**
 * Returns true if the coach is currently speaking OR stopped speaking within
 * the last POST_SPEAKING_GRACE_MS milliseconds. This is the correct gate for
 * echo filtering in voice-input.ts:
 *
 * 1. iOS speaker has a ~100-300ms output buffer — audio keeps physically
 *    playing after cancelCurrent() clears `speaking`.
 * 2. SFSpeechRecognizer has ~200-500ms processing latency — transcripts
 *    arrive at the result listener well after the audio was captured.
 * 3. expo-audio's `playbackStatusUpdate` event is not always reliable —
 *    `didJustFinish` can fire prematurely, clearing `speaking` before the
 *    phrase is actually done. The grace window re-catches that case too.
 *
 * Real hardware echo cancellation (Phase A v2, AVAudioEngine with
 * voiceProcessingEnabled) will make this workaround obsolete.
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
 * Full stop: clear queue + cancel current phrase. Delegates to cancelCurrent()
 * so `speaking` and `currentPlayer` are cleared exactly once by the Promise's
 * done() callback — no double-clear or manual teardown needed here.
 */
export function stopVoice(): void {
  queue.length = 0;
  cancelCurrent();
}
