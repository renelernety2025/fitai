/**
 * Voice Coach v5 — ElevenLabs TTS via expo-audio.
 * Simple, reliable, verbose logging.
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

    // Stop previous
    if (currentPlayer) {
      try { currentPlayer.remove(); } catch {}
      currentPlayer = null;
    }

    const uri = `data:audio/mpeg;base64,${base64}`;
    const player = createPlayer(uri);
    currentPlayer = player;
    player.play();
    console.log('[VoiceCoach] Playing audio...');

    // Wait for playback to finish
    await new Promise<void>((resolve) => {
      let resolved = false;
      const done = () => {
        if (resolved) return;
        resolved = true;
        try { player.remove(); } catch {}
        if (currentPlayer === player) currentPlayer = null;
        speaking = false;
        resolve();
        playNext();
      };

      const check = setInterval(() => {
        try {
          if (!player.playing && player.currentTime > 0) {
            clearInterval(check);
            done();
          }
        } catch {
          clearInterval(check);
          done();
        }
      }, 300);

      // Safety: max 10s per phrase
      setTimeout(() => {
        clearInterval(check);
        done();
      }, 10000);
    });
  } catch (e: any) {
    console.warn('[VoiceCoach] playNext error:', e.message);
    speaking = false;
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

export function pauseCoach(): void {
  paused = true;
  stopVoice();
  console.log('[VoiceCoach] Paused (MIC active)');
}

export function resumeCoach(): void {
  paused = false;
  console.log('[VoiceCoach] Resumed');
}

export function stopVoice(): void {
  queue.length = 0;
  speaking = false;
  if (currentPlayer) {
    try { currentPlayer.remove(); } catch {}
    currentPlayer = null;
  }
}
