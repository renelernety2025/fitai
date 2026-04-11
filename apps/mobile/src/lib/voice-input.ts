/**
 * Voice Input — speech-to-text for conversational coaching.
 * User asks a question → transcribed → sent to Claude → answer via ElevenLabs.
 *
 * Requires expo-speech-recognition native module.
 * If not available, startListening is a no-op.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { NativeModules } from 'react-native';
import { speak } from './voice-coach';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://fitai.bfevents.cz';

const hasSpeechModule = !!NativeModules.ExpoSpeechRecognition;

async function getToken(): Promise<string | null> {
  try {
    const { getToken: gt } = require('./api');
    return await gt();
  } catch {
    return null;
  }
}

async function askCoach(
  question: string,
  exerciseKey: string,
  formScore: number,
  reps: number,
): Promise<string> {
  try {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/api/coaching/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        question,
        exerciseName: exerciseKey,
        currentFormScore: formScore,
        completedReps: reps,
        context: 'voice_question',
      }),
    });
    if (!res.ok) return 'Soustřeď se na cvik.';
    const data = await res.json();
    return data.message || data.feedback || 'Pokračuj, děláš to dobře.';
  } catch {
    return 'Soustřeď se na formu a pokračuj.';
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
  const subRef = useRef<any[]>([]);

  const cleanup = useCallback(() => {
    subRef.current.forEach((s) => s?.remove?.());
    subRef.current = [];
  }, []);

  useEffect(() => cleanup, [cleanup]);

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

      subRef.current.push(
        SR.addSpeechRecognitionListener('result', (event: any) => {
          const text = event.results?.[0]?.transcript || '';
          setTranscript(text);

          if (event.isFinal && text.length > 3) {
            setListening(false);
            setAnswering(true);

            askCoach(text, exerciseKey, formScore, reps).then((answer) => {
              setAnswering(false);
              setLastAnswer(answer);
              speak(answer);
            });
          }
        }),
        SR.addSpeechRecognitionListener('end', () => {
          setListening(false);
        }),
        SR.addSpeechRecognitionListener('error', () => {
          setListening(false);
        }),
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
      const SR = require('expo-speech-recognition');
      SR.ExpoSpeechRecognitionModule.stop();
    } catch {}
    setListening(false);
    cleanup();
  }, [cleanup]);

  return { listening, transcript, answering, lastAnswer, startListening, stopListening };
}
