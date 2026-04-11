/**
 * Voice Input v3 — conversational speech-to-text for coaching.
 *
 * Supports two modes:
 *   - push-to-talk (legacy) — startListening() / stopListening()
 *   - always-on continuous — toggleContinuous()
 *
 * In continuous mode the session auto-reloops on the 'end' event so the
 * mic stays effectively always-on (expo-speech-recognition stops after a
 * few seconds of silence by default).
 *
 * The internalStart() orchestration is split into small helper factories
 * (makeSendToCoach, makeResultHandler, makeEndHandler, makeErrorHandler)
 * so each piece stays under the 30-LOC CLAUDE.md guideline. Session-local
 * state lives in a `SessionState` object shared between the three handlers
 * instead of closure-captured `let` variables.
 *
 * Uses ExpoSpeechRecognitionModule.addListener() (NOT NativeEventEmitter).
 */

import { useEffect, useRef, useState } from 'react';
import {
  speak,
  pauseCoach,
  resumeCoach,
  isSpeakingOrJustStopped,
} from './voice-coach';
import { getToken } from './api';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://fitai.bfevents.cz';

// Minimum transcript length to treat as real user speech (filters mic noise
// artifacts like "uh" / "ah" / whisper-level background sounds).
const MIN_SPEECH_CHARS = 3;

// Debounce before re-arming the recognizer after an 'end' event in
// continuous mode. Too short → thrash; too long → missed user speech.
const CONTINUOUS_REARM_MS = 200;

// Post-cancel settle delay before opening the mic. When the user taps
// MIC while the coach is speaking, we call pauseCoach()/cancelCurrent()
// which stops playback almost instantly — but the iOS speaker still has
// ~100-300ms of audio buffered. If we start the mic immediately, it
// captures that tail and SFSpeechRecognizer produces an echo transcript.
// Waiting 350ms lets the speaker flush before listening begins.
const POST_CANCEL_SETTLE_MS = 350;

export type VoiceInputState =
  | 'idle'          // nothing is happening
  | 'listening'     // mic is open, waiting for user speech
  | 'user-speaking' // user voice detected, coach is paused
  | 'answering';    // Claude returning answer, coach will replay it

interface SessionState {
  lastTranscript: string;
  answered: boolean;
  autopaused: boolean;
}

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
  const [state, setState] = useState<VoiceInputState>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastAnswer, setLastAnswer] = useState('');
  const [continuousMode, setContinuousMode] = useState(false);

  // Refs mirror state so closures in speech-recognition listeners always
  // see the latest value even across multiple start/stop cycles.
  const subsRef = useRef<any[]>([]);
  const continuousRef = useRef(false);
  const userStoppedRef = useRef(false);

  // Keep continuousRef in sync with continuousMode state via useEffect
  // rather than mutating during render (which is brittle — parent re-renders
  // could interleave listener closures with state transitions and give
  // non-deterministic behavior).
  useEffect(() => {
    continuousRef.current = continuousMode;
  }, [continuousMode]);

  const cleanup = () => {
    subsRef.current.forEach((s) => s?.remove?.());
    subsRef.current = [];
  };

  // Factory for the "finalize this question and ship it to Claude" closure.
  // Shared between the result listener (on isFinal) and the end listener
  // (fallback for when iOS doesn't fire isFinal).
  const makeSendToCoach = (session: SessionState) => (text: string) => {
    if (session.answered || text.length <= MIN_SPEECH_CHARS) return;
    session.answered = true;
    console.log('[VoiceInput] Sending to coach:', text);
    setState('answering');
    cleanup();

    askCoach(text, exerciseKey, formScore, reps).then((result) => {
      console.log('[VoiceInput] Coach answered:', result.answer);
      setLastAnswer(result.answer);
      resumeCoach();
      speak(result.answer);

      // In continuous mode, re-arm listening so the coach can be
      // interrupted again after it replays the answer.
      if (continuousRef.current && !userStoppedRef.current) {
        setTimeout(() => internalStart(), CONTINUOUS_REARM_MS);
      } else {
        setState('idle');
      }
    });
  };

  const makeResultHandler = (
    session: SessionState,
    sendToCoach: (text: string) => void,
  ) => (event: any) => {
    // ECHO GATE: if the coach is speaking (or stopped speaking within the
    // grace window), the mic is almost certainly capturing his own voice
    // from the speaker. Ignore the transcript entirely. The grace window
    // covers: iOS speaker output buffer (~300ms), SFSpeechRecognizer
    // processing latency (~500ms), and spurious early didJustFinish events
    // from expo-audio. See voice-coach.isSpeakingOrJustStopped.
    if (isSpeakingOrJustStopped()) return;

    const text = event.results?.[0]?.transcript || '';
    session.lastTranscript = text;
    setTranscript(text);

    // Auto-pause coach on first interim result with real content. This is
    // the "interrupt mid-sentence" UX — we don't wait for isFinal.
    if (!session.autopaused && text.length > MIN_SPEECH_CHARS) {
      session.autopaused = true;
      pauseCoach();
      setState('user-speaking');
      console.log('[VoiceInput] Auto-paused coach on user speech');
    }

    if (event.isFinal) sendToCoach(text);
  };

  const makeEndHandler = (
    session: SessionState,
    sendToCoach: (text: string) => void,
  ) => () => {
    console.log('[VoiceInput] Ended, lastTranscript:', session.lastTranscript);

    // ECHO GATE: whatever we captured was echo. Don't sendToCoach the bogus
    // transcript; just re-arm continuous listening (or go idle).
    if (isSpeakingOrJustStopped()) {
      session.lastTranscript = '';
      if (continuousRef.current && !userStoppedRef.current) {
        setTimeout(() => internalStart(), CONTINUOUS_REARM_MS);
        return;
      }
      setState('idle');
      return;
    }

    // iOS end-event fallback: got transcript but no isFinal, send it now.
    if (!session.answered && session.lastTranscript.length > MIN_SPEECH_CHARS) {
      sendToCoach(session.lastTranscript);
      return;
    }

    // Continuous mode auto-reloop so mic stays effectively always-on.
    if (continuousRef.current && !userStoppedRef.current && !session.answered) {
      console.log('[VoiceInput] Continuous re-arm');
      if (session.autopaused) resumeCoach();
      setTimeout(() => internalStart(), CONTINUOUS_REARM_MS);
      return;
    }

    setState('idle');
    if (session.autopaused) resumeCoach();
  };

  const makeErrorHandler = (session: SessionState) => (e: any) => {
    console.warn('[VoiceInput] Error:', JSON.stringify(e));
    if (session.autopaused) resumeCoach();
    // Don't exit continuous mode on transient errors; try to re-arm.
    if (continuousRef.current && !userStoppedRef.current) {
      setTimeout(() => internalStart(), CONTINUOUS_REARM_MS * 2);
      return;
    }
    setState('idle');
  };

  // Core speech-recognition setup. Orchestrator — delegates handler bodies
  // to the factories above so this stays short and readable. Called
  // recursively via setTimeout for continuous mode re-arm.
  const internalStart = async () => {
    try {
      const { ExpoSpeechRecognitionModule } = require('expo-speech-recognition');
      if (!ExpoSpeechRecognitionModule) {
        console.warn('[VoiceInput] Module is undefined');
        return;
      }

      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        console.warn('[VoiceInput] Permission denied');
        return;
      }

      cleanup();
      setTranscript('');
      setState('listening');

      // Push-to-talk mode eagerly pauses the coach as soon as the mic opens.
      // Continuous mode waits for actual user voice before pausing, so the
      // coach can keep speaking until interrupted.
      if (!continuousRef.current) {
        pauseCoach();
        await new Promise((resolve) => setTimeout(resolve, POST_CANCEL_SETTLE_MS));
      }

      const session: SessionState = {
        lastTranscript: '',
        answered: false,
        autopaused: false,
      };
      const sendToCoach = makeSendToCoach(session);

      subsRef.current.push(
        ExpoSpeechRecognitionModule.addListener('result', makeResultHandler(session, sendToCoach)),
        ExpoSpeechRecognitionModule.addListener('end', makeEndHandler(session, sendToCoach)),
        ExpoSpeechRecognitionModule.addListener('error', makeErrorHandler(session)),
      );

      ExpoSpeechRecognitionModule.start({
        lang: 'cs-CZ',
        interimResults: true,
        maxAlternatives: 1,
        continuous: true,
      });
      console.log(
        '[VoiceInput] Started listening (continuous=',
        continuousRef.current,
        ')',
      );
    } catch (e: any) {
      console.warn('[VoiceInput] Failed:', e.message);
      setState('idle');
    }
  };

  // Push-to-talk: caller presses a button to speak once.
  const startListening = async () => {
    userStoppedRef.current = false;
    await internalStart();
  };

  // Explicit stop — used by push-to-talk button release AND continuous off.
  const stopListening = () => {
    userStoppedRef.current = true;
    try {
      const { ExpoSpeechRecognitionModule } = require('expo-speech-recognition');
      ExpoSpeechRecognitionModule.stop();
    } catch {}
    setState('idle');
    cleanup();
    resumeCoach();
  };

  // Toggle always-on listening. When ON, the mic stays effectively open
  // and the coach is auto-paused whenever the user speaks.
  const toggleContinuous = async () => {
    if (continuousRef.current) {
      // Turning OFF — setState alone is enough; the useEffect above will
      // sync continuousRef.current on the next render cycle. We also set
      // the ref immediately so the in-flight stopListening() sees the
      // correct value synchronously.
      continuousRef.current = false;
      setContinuousMode(false);
      stopListening();
    } else {
      userStoppedRef.current = false;
      continuousRef.current = true;
      setContinuousMode(true);
      await internalStart();
    }
  };

  // Legacy return fields preserved for backward compat.
  const listening = state === 'listening' || state === 'user-speaking';
  const answering = state === 'answering';

  return {
    listening,
    transcript,
    answering,
    lastAnswer,
    startListening,
    stopListening,
    // Phase C additions
    state,
    continuousMode,
    toggleContinuous,
  };
}
