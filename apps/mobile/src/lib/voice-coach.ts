/**
 * Voice Coach — ElevenLabs TTS audio during workouts.
 * Calls /coaching/tts backend → gets base64 MP3 → plays via expo-av.
 */

import { Audio } from 'expo-av';
import { synthesizeVoice } from './api';

const cache = new Map<string, string>();
let lastSpokenAt = 0;
const MIN_INTERVAL_MS = 2500;
let currentSound: Audio.Sound | null = null;
let audioConfigured = false;

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

export async function speak(text: string): Promise<void> {
  const now = Date.now();
  if (now - lastSpokenAt < MIN_INTERVAL_MS) return;
  lastSpokenAt = now;

  try {
    await ensureAudioConfig();

    let base64 = cache.get(text);

    if (!base64) {
      const result = await synthesizeVoice(text);
      if (!result?.audioBase64) {
        console.warn('[VoiceCoach] No audio from API for:', text);
        return;
      }
      base64 = result.audioBase64;
      cache.set(text, base64);
      if (cache.size > 50) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }
    }

    if (currentSound) {
      await currentSound.unloadAsync().catch(() => {});
      currentSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/mpeg;base64,${base64}` },
      { shouldPlay: true, volume: 1.0 },
    );
    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if ('didJustFinish' in status && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (currentSound === sound) currentSound = null;
      }
    });
  } catch (e: any) {
    console.warn('[VoiceCoach] speak() failed:', e.message);
  }
}

export function stopVoice(): void {
  if (currentSound) {
    currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }
}
