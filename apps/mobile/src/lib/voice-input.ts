/**
 * Voice Input — speech-to-text for conversational coaching.
 * User asks a question → transcribed → sent to Claude → answer via ElevenLabs.
 *
 * Requires expo-speech-recognition (native module, needs EAS build).
 * Gracefully degrades to no-op if not available.
 */

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useState, useCallback } from 'react';
import { speak } from './voice-coach';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://fitai.bfevents.cz';

interface VoiceInputState {
  listening: boolean;
  transcript: string;
  answering: boolean;
  lastAnswer: string;
}

async function askCoach(
  question: string,
  exerciseKey: string,
  formScore: number,
  reps: number,
): Promise<string> {
  try {
    // Use the existing coaching feedback endpoint with the question
    const token = await (await import('./api')).getToken();
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
    if (!res.ok) return 'Promiň, teď nemůžu odpovědět. Soustřeď se na cvik.';
    const data = await res.json();
    return data.message || data.feedback || 'Pokračuj v cvičení, děláš to dobře.';
  } catch {
    return 'Soustřeď se na formu a pokračuj.';
  }
}

export function useVoiceInput(
  exerciseKey: string,
  formScore: number,
  reps: number,
) {
  const [state, setState] = useState<VoiceInputState>({
    listening: false,
    transcript: '',
    answering: false,
    lastAnswer: '',
  });

  const startListening = useCallback(async () => {
    try {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) return;

      setState((s) => ({ ...s, listening: true, transcript: '' }));
      ExpoSpeechRecognitionModule.start({
        lang: 'cs-CZ',
        interimResults: true,
        maxAlternatives: 1,
      });
    } catch {
      setState((s) => ({ ...s, listening: false }));
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {}
    setState((s) => ({ ...s, listening: false }));
  }, []);

  // Handle speech recognition results
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript || '';
    setState((s) => ({ ...s, transcript }));

    if (event.isFinal && transcript.length > 3) {
      setState((s) => ({ ...s, listening: false, answering: true }));

      askCoach(transcript, exerciseKey, formScore, reps).then((answer) => {
        setState((s) => ({ ...s, answering: false, lastAnswer: answer }));
        speak(answer);
      });
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setState((s) => ({ ...s, listening: false }));
  });

  useSpeechRecognitionEvent('error', () => {
    setState((s) => ({ ...s, listening: false }));
  });

  return {
    ...state,
    startListening,
    stopListening,
  };
}
