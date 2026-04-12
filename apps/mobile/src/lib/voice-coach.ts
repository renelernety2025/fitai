/**
 * Voice Coach v6 — ElevenLabs TTS via expo-audio.
 *
 * Listener-based playback completion (no more 300ms polling) + external
 * cancellation API so pauseCoach() can interrupt mid-phrase without
 * dropping the rest of the queue.
 *
 * Public API:
 * - speak(text)      queue a phrase for TTS
 * - pauseCoach()     interrupt current phrase + block new phrases (preserves queue)
 * - resumeCoach()    allow playback again + drain remaining queue
 * - cancelCurrent()  interrupt current phrase only (leaves `paused` untouched)
 * - stopVoice()      full stop: clear queue + cancel current phrase
 */

import { synthesizeVoice } from './api';

const cache = new Map<string, string>();
let currentPlayer: any = null;
let speaking = false;
// Timestamp of the last moment `speaking` transitioned from true to false.
// Used by isSpeakingOrJustStopped() to implement a grace window — the iOS
// speaker buffer and SFSpeechRecognizer pipeline mean mic-captured audio
// arrives 200-600ms after the coach's voice actually played, so the gate
// has to stay closed for a bit after the flag clears. Also guards against
// spurious/early `didJustFinish` events from expo-audio that would otherwise
// clear `speaking` mid-playback and let echo through.
let lastSpeakingEndedAt = 0;
const POST_SPEAKING_GRACE_MS = 1200;
const queue: string[] = [];
let lastSpokenText = '';
let paused = false; // true when MIC is active
let audioModuleLoaded = false;
let createPlayer: any = null;

// When a phrase is playing, this holds a callback that interrupts it. Calling
// it resolves the inner Promise in playNext(), cleans up the player, and lets
// the queue loop continue (subject to the `paused` flag).
let cancelCurrentPlayback: (() => void) | null = null;

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

async function playNext() {
  if (speaking || queue.length === 0) return;
  if (paused) return; // queue preserved — will resume via resumeCoach()
  if (!loadAudioModule()) {
    console.warn('[VoiceCoach] No audio module, clearing queue');
    queue.length = 0;
    return;
  }

  const text = queue.shift()!;
  speaking = true;
  console.log('[VoiceCoach] Playing:', text.substring(0, 40));

  try {
    let base64 = cache.get(text);

    if (!base64) {
      console.log('[VoiceCoach] Fetching TTS from API...');
      const result = await synthesizeVoice(text);
      if (!result?.audioBase64) {
        console.warn('[VoiceCoach] API returned no audio for:', text);
        speaking = false;
        lastSpeakingEndedAt = Date.now();
        playNext();
        return;
      }
      base64 = result.audioBase64;
      console.log('[VoiceCoach] Got audio, length:', base64.length);
      cache.set(text, base64);
      if (cache.size > 30) {
        const k = cache.keys().next().value;
        if (k) cache.delete(k);
      }
    }

    // Stop any previous player (defensive — should already be null here).
    if (currentPlayer) {
      try { currentPlayer.remove(); } catch {}
      currentPlayer = null;
    }

    const uri = `data:audio/mpeg;base64,${base64}`;
    const player = createPlayer(uri);
    currentPlayer = player;
    player.play();
    console.log('[VoiceCoach] Playing audio...');

    // Listener-based completion: resolve when expo-audio reports
    // didJustFinish, when an external cancel fires, or after 10s safety.
    await new Promise<void>((resolve) => {
      let resolved = false;
      let canceled = false;
      let sub: any = null;
      let safetyTimer: ReturnType<typeof setTimeout> | null = null;

      const done = () => {
        if (resolved) return;
        resolved = true;
        cancelCurrentPlayback = null;
        if (safetyTimer) clearTimeout(safetyTimer);
        try { sub?.remove?.(); } catch {}
        try { player.remove(); } catch {}
        if (currentPlayer === player) currentPlayer = null;
        speaking = false;
        lastSpeakingEndedAt = Date.now();

        if (canceled) {
          // Allow coaching-engine to re-emit the same phrase after resume
          // without being deduped by the `text === lastSpokenText` guard.
          lastSpokenText = '';
          console.log('[VoiceCoach] Canceled:', text.substring(0, 40));
        }

        resolve();
        playNext();
      };

      // Register external cancel hook. pauseCoach() / cancelCurrent() call this.
      cancelCurrentPlayback = () => {
        canceled = true;
        done();
      };

      try {
        sub = player.addListener('playbackStatusUpdate', (status: any) => {
          if (status?.didJustFinish) done();
        });
      } catch (e: any) {
        console.warn(
          '[VoiceCoach] addListener failed, relying on safety timer:',
          e.message,
        );
      }

      // Safety: max 60s per phrase in case listener never fires
      // (corrupt audio, module error, etc.). Long Claude answers can
      // comfortably hit 20-25s, so 10s was too aggressive.
      safetyTimer = setTimeout(() => {
        if (!resolved) console.warn('[VoiceCoach] Safety timeout hit for:', text.substring(0, 40));
        done();
      }, 60000);
    });
  } catch (e: any) {
    console.warn('[VoiceCoach] playNext error:', e.message);
    speaking = false;
    lastSpeakingEndedAt = Date.now();
    cancelCurrentPlayback = null;
    playNext();
  }
}

export async function speak(text: string): Promise<void> {
  if (paused) return; // Don't queue anything while MIC is active
  if (text === lastSpokenText) return;
  lastSpokenText = text;
  if (queue.length >= 2) queue.shift();
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

export function stopVoice(): void {
  queue.length = 0;
  cancelCurrent();
  speaking = false;
  lastSpeakingEndedAt = Date.now();
  if (currentPlayer) {
    try { currentPlayer.remove(); } catch {}
    currentPlayer = null;
  }
}
