/**
 * Voice Input — speech-to-text for conversational coaching.
 * Uses ExpoSpeechRecognitionModule.addListener() API.
 */

import { useState, useCallback, useRef } from 'react';
import { speak, pauseCoach, resumeCoach } from './voice-coach';
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
      pauseCoach(); // Stop coach + prevent new speech while MIC active
      setListening(true);
      setTranscript('');

      // Track last transcript for end-event fallback
      let lastTranscript = '';
      let answered = false;

      const sendToCoach = (text: string) => {
        if (answered || text.length <= 3) return;
        answered = true;
        console.log('[VoiceInput] Sending to coach:', text);
        setListening(false);
        setAnswering(true);
        cleanup();

        askCoach(text, exerciseKey, formScore, reps).then((result) => {
          console.log('[VoiceInput] Coach answered:', result.answer);
          setAnswering(false);
          setLastAnswer(result.answer);
          resumeCoach(); // Resume so answer can play
          speak(result.answer);
        });
      };

      subsRef.current.push(
        ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
          const text = event.results?.[0]?.transcript || '';
          console.log('[VoiceInput] Transcript:', text, 'final:', event.isFinal);
          lastTranscript = text;
          setTranscript(text);

          if (event.isFinal) {
            sendToCoach(text);
          }
        }),
        ExpoSpeechRecognitionModule.addListener('end', () => {
          console.log('[VoiceInput] Ended, lastTranscript:', lastTranscript);
          // If we got transcript but no isFinal, send it now
          if (!answered && lastTranscript.length > 3) {
            sendToCoach(lastTranscript);
          } else {
            setListening(false);
            resumeCoach(); // Nothing to send, resume coaching
          }
        }),
        ExpoSpeechRecognitionModule.addListener('error', (e: any) => {
          console.warn('[VoiceInput] Error:', JSON.stringify(e));
          resumeCoach();
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
