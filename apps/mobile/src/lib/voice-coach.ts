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

      // Safety: max 10s per phrase in case listener never fires
      // (corrupt audio, module error, etc.).
      safetyTimer = setTimeout(() => {
        if (!resolved) console.warn('[VoiceCoach] Safety timeout hit for:', text.substring(0, 40));
        done();
      }, 10000);
    });
  } catch (e: any) {
    console.warn('[VoiceCoach] playNext error:', e.message);
    speaking = false;
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
 * Used by voice-input.ts to gate speech-recognition result processing:
 * when the coach is speaking, any transcribed audio is almost certainly
 * mic picking up the coach's own voice from the speaker (echo loop),
 * so those results must be ignored. Real hardware echo cancellation
 * will eventually replace this software gate (see Phase A v2 in the
 * project plan — AVAudioEngine with voiceProcessingEnabled).
 */
export function isSpeaking(): boolean {
  return speaking;
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
  if (currentPlayer) {
    try { currentPlayer.remove(); } catch {}
    currentPlayer = null;
  }
}
