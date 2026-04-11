/**
 * Voice Coach v3 — ElevenLabs TTS with expo-audio + queue.
 * Uses expo-audio createAudioPlayer (imperative, non-hook API).
 */

import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { synthesizeVoice } from './api';

const cache = new Map<string, string>(); // text → base64
let currentPlayer: AudioPlayer | null = null;
let speaking = false;
const queue: string[] = [];
let lastSpokenText = '';

async function playNext() {
  if (speaking || queue.length === 0) return;

  const text = queue.shift()!;
  speaking = true;

  try {
    let base64 = cache.get(text);

    if (!base64) {
      const result = await synthesizeVoice(text);
      if (!result?.audioBase64) {
        console.warn('[VoiceCoach] No audio for:', text);
        speaking = false;
        playNext();
        return;
      }
      base64 = result.audioBase64;
      cache.set(text, base64);
      if (cache.size > 30) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }
    }

    // Stop previous player
    if (currentPlayer) {
      currentPlayer.remove();
      currentPlayer = null;
    }

    // Create player with base64 data URI
    const player = createAudioPlayer(`data:audio/mpeg;base64,${base64}`);
    currentPlayer = player;
    lastSpokenText = text;

    // Wait for playback to finish
    await new Promise<void>((resolve) => {
      let resolved = false;
      const done = () => {
        if (resolved) return;
        resolved = true;
        speaking = false;
        resolve();
        playNext();
      };

      player.play();

      // Listen for end via polling (expo-audio doesn't have onComplete callback in imperative mode)
      const check = setInterval(() => {
        if (!player.playing && player.currentTime > 0) {
          clearInterval(check);
          player.remove();
          if (currentPlayer === player) currentPlayer = null;
          done();
        }
      }, 200);

      // Safety timeout
      setTimeout(() => {
        clearInterval(check);
        done();
      }, 10000);
    });
  } catch (e: any) {
    console.warn('[VoiceCoach] playNext failed:', e.message);
    speaking = false;
    playNext();
  }
}

export async function speak(text: string): Promise<void> {
  if (text === lastSpokenText) return;
  if (queue.length >= 3) queue.shift();
  queue.push(text);
  playNext();
}

export function stopVoice(): void {
  queue.length = 0;
  speaking = false;
  if (currentPlayer) {
    currentPlayer.remove();
    currentPlayer = null;
  }
}
