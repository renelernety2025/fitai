/**
 * Voice Coach v2 — ElevenLabs TTS with queue system.
 * Queues speech requests and plays them sequentially.
 * Prevents overlapping audio and handles API latency.
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { synthesizeVoice } from './api';

const cache = new Map<string, string>(); // text → file URI
let currentSound: Audio.Sound | null = null;
let audioConfigured = false;
let speaking = false;
const queue: string[] = [];
let lastSpokenText = '';

async function ensureAudioConfig() {
  if (audioConfigured) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    audioConfigured = true;
  } catch (e: any) {
    console.warn('[VoiceCoach] Audio config failed:', e.message);
  }
}

async function playNext() {
  if (speaking || queue.length === 0) return;

  const text = queue.shift()!;
  if (!text) return;

  speaking = true;

  try {
    await ensureAudioConfig();

    let fileUri = cache.get(text);

    if (!fileUri) {
      const result = await synthesizeVoice(text);
      if (!result?.audioBase64) {
        console.warn('[VoiceCoach] No audio for:', text);
        speaking = false;
        playNext();
        return;
      }

      // Save base64 to temp file (more reliable than data URI on iOS)
      const filename = `coach_${Date.now()}.mp3`;
      fileUri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, result.audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      cache.set(text, fileUri);
      if (cache.size > 30) {
        const firstKey = cache.keys().next().value;
        if (firstKey) {
          const oldUri = cache.get(firstKey);
          if (oldUri) FileSystem.deleteAsync(oldUri, { idempotent: true }).catch(() => {});
          cache.delete(firstKey);
        }
      }
    }

    if (currentSound) {
      await currentSound.unloadAsync().catch(() => {});
      currentSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: true, volume: 1.0 },
    );
    currentSound = sound;
    lastSpokenText = text;

    await new Promise<void>((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          if (currentSound === sound) currentSound = null;
          speaking = false;
          resolve();
          playNext(); // Play next in queue
        }
      });

      // Timeout safety — if audio doesn't finish in 8s, move on
      setTimeout(() => {
        speaking = false;
        resolve();
        playNext();
      }, 8000);
    });
  } catch (e: any) {
    console.warn('[VoiceCoach] playNext failed:', e.message);
    speaking = false;
    playNext();
  }
}

export async function speak(text: string): Promise<void> {
  // Don't queue duplicates or if queue is too long
  if (text === lastSpokenText) return;
  if (queue.length >= 3) {
    // Drop oldest, keep newest (most relevant)
    queue.shift();
  }
  queue.push(text);
  playNext();
}

export function stopVoice(): void {
  queue.length = 0;
  speaking = false;
  if (currentSound) {
    currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }
}
