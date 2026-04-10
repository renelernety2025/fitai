/**
 * Voice Coach — ElevenLabs TTS audio during workouts.
 * Requires expo-av native module (needs EAS build).
 * Before EAS build: gracefully degrades to no-op.
 */

import { synthesizeVoice } from './api';

const cache = new Map<string, string>();
let lastSpokenAt = 0;
const MIN_INTERVAL_MS = 2500;
let currentSound: any = null;
let nativeAvailable: boolean | null = null;

function isNativeAvailable(): boolean {
  if (nativeAvailable !== null) return nativeAvailable;
  try {
    const { NativeModules } = require('react-native');
    nativeAvailable = !!NativeModules.ExponentAV;
  } catch {
    nativeAvailable = false;
  }
  return nativeAvailable;
}

export async function speak(text: string): Promise<void> {
  if (!isNativeAvailable()) return;

  const now = Date.now();
  if (now - lastSpokenAt < MIN_INTERVAL_MS) return;
  lastSpokenAt = now;

  try {
    let base64 = cache.get(text);

    if (!base64) {
      const result = await synthesizeVoice(text);
      if (!result?.audioBase64) return;
      base64 = result.audioBase64;
      cache.set(text, base64);
      if (cache.size > 50) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }
    }

    if (currentSound) {
      try { await currentSound.unloadAsync(); } catch {}
      currentSound = null;
    }

    const { Audio } = require('expo-av');
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/mpeg;base64,${base64}` },
      { shouldPlay: true, volume: 1.0 },
    );
    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status?.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (currentSound === sound) currentSound = null;
      }
    });
  } catch {
    // Voice is nice-to-have, never crash the workout
  }
}

export function stopVoice(): void {
  if (currentSound) {
    try { currentSound.unloadAsync(); } catch {}
    currentSound = null;
  }
}
