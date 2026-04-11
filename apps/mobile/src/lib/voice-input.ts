/**
 * Voice Input — speech-to-text for conversational coaching.
 * User asks a question → transcribed → /coaching/ask → Claude answers → ElevenLabs speaks.
 *
 * Requires expo-speech-recognition native module.
 * Gracefully degrades to no-op if not available.
 */

import { useState, useCallback, useRef } from 'react';
import { NativeModules } from 'react-native';
import { speak } from './voice-coach';
import { getToken } from './api';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://fitai.bfevents.cz';
const hasSpeechModule = !!NativeModules.ExpoSpeechRecognition;

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
    if (!hasSpeechModule) {
      console.warn('[VoiceInput] ExpoSpeechRecognition not available');
      return;
    }

    try {
      const SR = require('expo-speech-recognition');
      const mod = SR.ExpoSpeechRecognitionModule;
      const { granted } = await mod.requestPermissionsAsync();
      if (!granted) return;

      cleanup();
      setListening(true);
      setTranscript('');

      subsRef.current.push(
        SR.addSpeechRecognitionListener('result', (event: any) => {
          const text = event.results?.[0]?.transcript || '';
          setTranscript(text);

          if (event.isFinal && text.length > 3) {
            setListening(false);
            setAnswering(true);
            cleanup();

            askCoach(text, exerciseKey, formScore, reps).then((result) => {
              setAnswering(false);
              setLastAnswer(result.answer);
              speak(result.answer);
            });
          }
        }),
        SR.addSpeechRecognitionListener('end', () => setListening(false)),
        SR.addSpeechRecognitionListener('error', () => setListening(false)),
      );

      mod.start({ lang: 'cs-CZ', interimResults: true, maxAlternatives: 1 });
    } catch (e: any) {
      console.warn('[VoiceInput] start failed:', e.message);
      setListening(false);
    }
  }, [exerciseKey, formScore, reps, cleanup]);

  const stopListening = useCallback(() => {
    if (!hasSpeechModule) return;
    try {
      require('expo-speech-recognition').ExpoSpeechRecognitionModule.stop();
    } catch {}
    setListening(false);
    cleanup();
  }, [cleanup]);

  return { listening, transcript, answering, lastAnswer, startListening, stopListening };
}
