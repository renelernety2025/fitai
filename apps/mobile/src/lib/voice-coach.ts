/**
 * Voice Coach v4 — ElevenLabs TTS with lazy-loaded audio.
 * Detects available audio module at runtime.
 * Falls back to no-op if no audio module is in the build.
 */

import { NativeModules } from 'react-native';
import { synthesizeVoice } from './api';

const cache = new Map<string, string>();
let currentPlayer: any = null;
let speaking = false;
const queue: string[] = [];
let lastSpokenText = '';

// Detect which audio module is available
const hasExpoAudio = !!NativeModules.ExpoAudio;
const hasExponentAV = !!NativeModules.ExponentAV;

async function playAudio(base64: string): Promise<void> {
  const uri = `data:audio/mpeg;base64,${base64}`;

  if (hasExpoAudio) {
    const { createAudioPlayer } = require('expo-audio');
    if (currentPlayer) {
      currentPlayer.remove();
      currentPlayer = null;
    }
    const player = createAudioPlayer(uri);
    currentPlayer = player;
    player.play();

    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (!player.playing && player.currentTime > 0) {
          clearInterval(check);
          player.remove();
          if (currentPlayer === player) currentPlayer = null;
          resolve();
        }
      }, 200);
      setTimeout(() => { clearInterval(check); resolve(); }, 10000);
    });
    return;
  }

  if (hasExponentAV) {
    const { Audio } = require('expo-av');
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    if (currentPlayer) {
      await currentPlayer.unloadAsync().catch(() => {});
      currentPlayer = null;
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, volume: 1.0 },
    );
    currentPlayer = sound;
    await new Promise<void>((resolve) => {
      sound.setOnPlaybackStatusUpdate((s: any) => {
        if (s?.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          if (currentPlayer === sound) currentPlayer = null;
          resolve();
        }
      });
      setTimeout(resolve, 10000);
    });
    return;
  }

  console.warn('[VoiceCoach] No audio module available');
}

async function playNext() {
  if (speaking || queue.length === 0) return;
  if (!hasExpoAudio && !hasExponentAV) {
    queue.length = 0;
    return;
  }

  const text = queue.shift()!;
  speaking = true;

  try {
    let base64 = cache.get(text);
    if (!base64) {
      const result = await synthesizeVoice(text);
      if (!result?.audioBase64) {
        speaking = false;
        playNext();
        return;
      }
      base64 = result.audioBase64;
      cache.set(text, base64);
      if (cache.size > 30) {
        const k = cache.keys().next().value;
        if (k) cache.delete(k);
      }
    }

    await playAudio(base64);
    speaking = false;
    playNext();
  } catch (e: any) {
    console.warn('[VoiceCoach] playNext failed:', e.message);
    speaking = false;
    playNext();
  }
}

export async function speak(text: string): Promise<void> {
  if (text === lastSpokenText) return;
  lastSpokenText = text;
  if (queue.length >= 3) queue.shift();
  queue.push(text);
  playNext();
}

export function stopVoice(): void {
  queue.length = 0;
  speaking = false;
  if (currentPlayer) {
    try {
      if (currentPlayer.remove) currentPlayer.remove();
      else if (currentPlayer.unloadAsync) currentPlayer.unloadAsync();
    } catch {}
    currentPlayer = null;
  }
}
