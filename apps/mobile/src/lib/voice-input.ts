/**
 * Voice Input — speech-to-text for conversational coaching.
 * Uses ExpoSpeechRecognitionModule.addListener() API.
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
      body: JSON.stringify({ question, exerciseName, formScore, completedReps: reps }),
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
      const { ExpoSpeechRecognitionModule } = require('expo-speech-recognition');

      if (!ExpoSpeechRecognitionModule) {
        console.warn('[VoiceInput] Module is undefined');
        return;
      }

      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      console.log('[VoiceInput] Permission:', granted);
      if (!granted) return;

      cleanup();
      setListening(true);
      setTranscript('');

      // Use module.addListener (correct API)
      subsRef.current.push(
        ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
          const text = event.results?.[0]?.transcript || '';
          console.log('[VoiceInput] Transcript:', text, 'final:', event.isFinal);
          setTranscript(text);

          if (event.isFinal && text.length > 3) {
            setListening(false);
            setAnswering(true);
            cleanup();

            askCoach(text, exerciseKey, formScore, reps).then((result) => {
              console.log('[VoiceInput] Answer:', result.answer);
              setAnswering(false);
              setLastAnswer(result.answer);
              speak(result.answer);
            });
          }
        }),
        ExpoSpeechRecognitionModule.addListener('end', () => {
          console.log('[VoiceInput] Ended');
          setListening(false);
        }),
        ExpoSpeechRecognitionModule.addListener('error', (e: any) => {
          console.warn('[VoiceInput] Error:', JSON.stringify(e));
          setListening(false);
        }),
      );

      ExpoSpeechRecognitionModule.start({
        lang: 'cs-CZ',
        interimResults: true,
        maxAlternatives: 1,
      });
      console.log('[VoiceInput] Started listening');
    } catch (e: any) {
      console.warn('[VoiceInput] Failed:', e.message);
      setListening(false);
    }
  }, [exerciseKey, formScore, reps, cleanup]);

  const stopListening = useCallback(() => {
    try {
      const { ExpoSpeechRecognitionModule } = require('expo-speech-recognition');
      ExpoSpeechRecognitionModule.stop();
    } catch {}
    setListening(false);
    cleanup();
  }, [cleanup]);

  return { listening, transcript, answering, lastAnswer, startListening, stopListening };
}
