/**
 * Voice Input — speech-to-text for conversational coaching.
 * User asks a question → transcribed → /coaching/ask → Claude answers → ElevenLabs speaks.
 *
 * Uses try/require instead of NativeModules check (module name differs).
 */

import { useState, useCallback, useRef } from 'react';
import { speak } from './voice-coach';
import { getToken } from './api';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://fitai.bfevents.cz';

async function askCoach(
  question: string,
  exerciseName: string,
  formScore: number,
  reps: number,
): Promise<{ answer: string; audioBase64: string | null }> {
  try {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/api/coaching/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        question,
        exerciseName,
        formScore,
        completedReps: reps,
      }),
    });
    if (!res.ok) return { answer: 'Soustřeď se na cvik.', audioBase64: null };
    return await res.json();
  } catch {
    return { answer: 'Pokračuj v cvičení.', audioBase64: null };
  }
}

export function useVoiceInput(
  exerciseKey: string,
  formScore: number,
  reps: number,
) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answering, setAnswering] = useState(false);
  const [lastAnswer, setLastAnswer] = useState('');
  const subsRef = useRef<any[]>([]);

  const cleanup = useCallback(() => {
    subsRef.current.forEach((s) => s?.remove?.());
    subsRef.current = [];
  }, []);

  const startListening = useCallback(async () => {
    console.log('[VoiceInput] startListening called');

    try {
      const SR = require('expo-speech-recognition');
      console.log('[VoiceInput] expo-speech-recognition loaded, keys:', Object.keys(SR).join(', '));

      const mod = SR.ExpoSpeechRecognitionModule;
      if (!mod) {
        console.warn('[VoiceInput] ExpoSpeechRecognitionModule is undefined in package');
        return;
      }

      const { granted } = await mod.requestPermissionsAsync();
      console.log('[VoiceInput] Permission granted:', granted);
      if (!granted) return;

      cleanup();
      setListening(true);
      setTranscript('');

      subsRef.current.push(
        SR.addSpeechRecognitionListener('result', (event: any) => {
          const text = event.results?.[0]?.transcript || '';
          console.log('[VoiceInput] Transcript:', text, 'isFinal:', event.isFinal);
          setTranscript(text);

          if (event.isFinal && text.length > 3) {
            setListening(false);
            setAnswering(true);
            cleanup();

            askCoach(text, exerciseKey, formScore, reps).then((result) => {
              console.log('[VoiceInput] Coach answer:', result.answer);
              setAnswering(false);
              setLastAnswer(result.answer);
              speak(result.answer);
            });
          }
        }),
        SR.addSpeechRecognitionListener('end', () => {
          console.log('[VoiceInput] Speech ended');
          setListening(false);
        }),
        SR.addSpeechRecognitionListener('error', (e: any) => {
          console.warn('[VoiceInput] Error:', e);
          setListening(false);
        }),
      );

      mod.start({ lang: 'cs-CZ', interimResults: true, maxAlternatives: 1 });
      console.log('[VoiceInput] Recognition started');
    } catch (e: any) {
      console.warn('[VoiceInput] Failed:', e.message);
      setListening(false);
    }
  }, [exerciseKey, formScore, reps, cleanup]);

  const stopListening = useCallback(() => {
    try {
      require('expo-speech-recognition').ExpoSpeechRecognitionModule.stop();
    } catch {}
    setListening(false);
    cleanup();
  }, [cleanup]);

  return { listening, transcript, answering, lastAnswer, startListening, stopListening };
}
