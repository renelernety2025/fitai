/**
 * Voice Input v2 — conversational speech-to-text for coaching.
 *
 * Supports two modes:
 *   - push-to-talk (legacy) — startListening() / stopListening()
 *   - always-on continuous — toggleContinuous()
 *
 * In continuous mode the session auto-reloops on the 'end' event so the
 * mic stays effectively always-on (expo-speech-recognition stops after a
 * few seconds of silence by default). The coach is auto-paused the moment
 * a non-trivial interim transcript arrives, not only on isFinal — that's
 * the "interrupt coach mid-sentence when the user starts talking" UX.
 *
 * Uses ExpoSpeechRecognitionModule.addListener() (NOT NativeEventEmitter).
 */

import { useRef, useState } from 'react';
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

// Maximum consecutive recognition errors before auto-rearm is disabled
// and the user has to explicitly tap MIC again. Prevents the error 209
// infinite loop we hit when SFSpeechRecognizer gets stuck in a bad state
// during continuous mode — each failed start() just triggers another
// start() and the loop hammers the mic until the user toggles off.
const MAX_CONSECUTIVE_ERRORS = 3;

export type VoiceInputState =
  | 'idle'          // nothing is happening
  | 'listening'     // mic is open, waiting for user speech
  | 'user-speaking' // user voice detected, coach is paused
  | 'answering';    // Claude returning answer, coach will replay it

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

  // Refs mirror state so closures in speech-recognition listeners
  // always see the latest value even across multiple start/stop cycles.
  const subsRef = useRef<any[]>([]);
  const continuousRef = useRef(false);
  const userStoppedRef = useRef(false);
  // Single pending re-arm timer. When 'end' and 'error' fire in quick
  // succession (common in error 209 cascades), each scheduled its own
  // setTimeout(() => internalStart()) which stacked up and spawned
  // multiple concurrent recognition sessions. scheduleReArm cancels any
  // pending timer before scheduling a new one — only the most recent
  // schedule wins, no stacking.
  const rearmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Consecutive recognition error count. Resets on any successful result.
  // Once it hits MAX_CONSECUTIVE_ERRORS we stop auto-rearming so the user
  // can tap MIC again explicitly to recover.
  const consecutiveErrorsRef = useRef(0);

  // Keep continuousRef in sync with continuousMode state.
  continuousRef.current = continuousMode;

  const cleanup = () => {
    subsRef.current.forEach((s) => s?.remove?.());
    subsRef.current = [];
  };

  const clearPendingReArm = () => {
    if (rearmTimerRef.current) {
      clearTimeout(rearmTimerRef.current);
      rearmTimerRef.current = null;
    }
  };

  const scheduleReArm = (delayMs: number) => {
    clearPendingReArm();
    rearmTimerRef.current = setTimeout(() => {
      rearmTimerRef.current = null;
      internalStart();
    }, delayMs);
  };

  // Core speech-recognition setup. Defined as a regular function (not
  // useCallback) so it always closes over the latest exerciseKey/formScore/reps.
  // It calls itself recursively via setTimeout on 'end' when in continuous mode.
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

      // Push-to-talk mode eagerly pauses the coach as soon as the mic opens
      // (pre-Phase-C behavior). Continuous mode waits for actual user voice
      // before pausing, so the coach can keep speaking until interrupted.
      if (!continuousRef.current) {
        pauseCoach();
        // Let the iOS speaker buffer drain (~100-300ms audio tail) before
        // the mic starts, otherwise speech recognition captures the tail
        // of the coach's TTS and produces an echo transcript. Without this
        // delay, push-to-talk during coach speech sent bogus coach-words
        // to Claude as if they were the user's question.
        await new Promise((resolve) => setTimeout(resolve, POST_CANCEL_SETTLE_MS));
      }

      let lastTranscript = '';
      let answered = false;
      let autopaused = false;

      const sendToCoach = (text: string) => {
        if (answered || text.length <= MIN_SPEECH_CHARS) return;
        answered = true;
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
            scheduleReArm(CONTINUOUS_REARM_MS);
          } else {
            setState('idle');
          }
        });
      };

      subsRef.current.push(
        ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
          // ECHO GATE: if the coach is speaking (or stopped speaking
          // within the grace window), the mic is almost certainly
          // capturing his own voice from the speaker. Ignore the
          // transcript entirely — do NOT update state, do NOT trigger
          // auto-pause, do NOT forward to Claude. The grace window
          // covers: iOS speaker output buffer (~300ms), SFSpeechRecognizer
          // processing latency (~500ms), and spurious early didJustFinish
          // events from expo-audio. See voice-coach.isSpeakingOrJustStopped.
          if (isSpeakingOrJustStopped()) {
            return;
          }

          const text = event.results?.[0]?.transcript || '';
          // Successful result resets the consecutive-error counter —
          // the recognizer is clearly healthy if it's producing text.
          if (text.length > 0) consecutiveErrorsRef.current = 0;
          lastTranscript = text;
          setTranscript(text);

          // Auto-pause coach on first interim result with real content.
          // This is the "interrupt mid-sentence" UX — we don't wait for isFinal.
          // Only fires when coach is NOT speaking (gated above), so it
          // reflects real user voice in the current software stack.
          if (!autopaused && text.length > MIN_SPEECH_CHARS) {
            autopaused = true;
            pauseCoach();
            setState('user-speaking');
            console.log('[VoiceInput] Auto-paused coach on user speech');
          }

          if (event.isFinal) {
            sendToCoach(text);
          }
        }),
        ExpoSpeechRecognitionModule.addListener('end', () => {
          console.log('[VoiceInput] Ended, lastTranscript:', lastTranscript);

          // ECHO GATE: if the coach is speaking or within the grace
          // window, whatever we captured was echo. Don't sendToCoach the
          // bogus transcript; just re-arm continuous listening (or go
          // idle) so we stay responsive.
          if (isSpeakingOrJustStopped()) {
            lastTranscript = '';
            if (continuousRef.current && !userStoppedRef.current) {
              scheduleReArm(CONTINUOUS_REARM_MS);
              return;
            }
            setState('idle');
            return;
          }

          // If we got transcript but no isFinal, send it now (iOS end-event fallback).
          if (!answered && lastTranscript.length > MIN_SPEECH_CHARS) {
            sendToCoach(lastTranscript);
            return;
          }

          // Continuous mode: auto-reloop so mic stays effectively always-on.
          // expo-speech-recognition sessions end after ~3s of silence on
          // iOS 17- or on isFinal on iOS 18+/Android; we re-arm either way.
          if (continuousRef.current && !userStoppedRef.current && !answered) {
            console.log('[VoiceInput] Continuous re-arm');
            if (autopaused) resumeCoach(); // resume between reloops
            scheduleReArm(CONTINUOUS_REARM_MS);
            return;
          }

          setState('idle');
          if (autopaused) resumeCoach();
        }),
        ExpoSpeechRecognitionModule.addListener('error', (e: any) => {
          console.warn('[VoiceInput] Error:', JSON.stringify(e));
          if (autopaused) resumeCoach();

          consecutiveErrorsRef.current += 1;
          // Circuit breaker: after MAX_CONSECUTIVE_ERRORS failures in a
          // row the recognizer is clearly stuck (most common trigger is
          // kAFAssistantErrorDomain 209 from iOS SFSpeechRecognizer).
          // Stop auto-rearming — user has to tap MIC again to reset.
          if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
            console.warn(
              '[VoiceInput] Max consecutive errors reached, stopping auto-rearm — user must tap MIC again',
            );
            consecutiveErrorsRef.current = 0;
            clearPendingReArm();
            setState('idle');
            return;
          }

          // Don't exit continuous mode on transient errors; try to re-arm
          // with exponential backoff.
          if (continuousRef.current && !userStoppedRef.current) {
            const backoffMs =
              CONTINUOUS_REARM_MS * 2 * consecutiveErrorsRef.current;
            scheduleReArm(backoffMs);
            return;
          }
          setState('idle');
        }),
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

  // Explicit stop — used by both push-to-talk button release AND
  // continuous-mode toggle-off.
  const stopListening = () => {
    userStoppedRef.current = true;
    clearPendingReArm();
    consecutiveErrorsRef.current = 0;
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
      // Turning OFF
      setContinuousMode(false);
      continuousRef.current = false;
      stopListening();
    } else {
      // Turning ON
      userStoppedRef.current = false;
      setContinuousMode(true);
      continuousRef.current = true;
      await internalStart();
    }
  };

  // Legacy return fields preserved for backward compat with
  // CameraWorkoutProScreen before Phase C UI lands.
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
