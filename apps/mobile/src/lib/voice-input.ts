/**
 * Voice Input v4 — hardware-AEC speech-to-text via VoiceEngine native module.
 *
 * Phase A v2 migration: `expo-speech-recognition` has been replaced by our
 * custom `VoiceEngine` native module. Recognition runs on the same shared
 * AVAudioEngine whose input node has voiceProcessingEnabled = true, so the
 * mic tap physically does not receive the coach's own speaker output —
 * the VoiceProcessingIO audio unit subtracts it in hardware BEFORE the
 * tap fires. This is what the Voice Coaching v2 software gates
 * (v1.2-v1.4) could only approximate.
 *
 * What this file still owns (preserved from v3):
 * - useVoiceInput() hook signature and return type
 * - VoiceInputState (idle/listening/user-speaking/answering)
 * - SessionState object shared between handler factories
 * - Handler factories (makeSendToCoach, makeResultHandler, makeEndHandler,
 *   makeErrorHandler)
 * - continuousRef + useEffect sync
 * - POST_CANCEL_SETTLE_MS (defensive, can shrink after device test)
 * - askCoach() fetch to /api/coaching/ask
 *
 * What moved to native:
 * - ExpoSpeechRecognitionModule.start / stop / addListener
 * - Permission requests (now handled inside VoiceEngine on first call)
 */

import { useEffect, useRef, useState } from 'react';
import {
  speak,
  pauseCoach,
  resumeCoach,
  isSpeakingOrJustStopped,
} from './voice-coach';
import {
  startRecognition as engineStartRecognition,
  stopRecognition as engineStopRecognition,
  onRecognitionResult,
  onRecognitionEnd,
  onRecognitionError,
  isAvailable as isVoiceEngineAvailable,
  type RecognitionResult,
} from './voice-engine';
import { getToken } from './api';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://fitai.bfevents.cz';

// Minimum transcript length to treat as real user speech (filters mic noise
// artifacts like "uh" / "ah" / whisper-level background sounds).
const MIN_SPEECH_CHARS = 3;

// Debounce before re-arming the recognizer after an 'end' event in
// continuous mode. Too short → thrash; too long → missed user speech.
const CONTINUOUS_REARM_MS = 200;

// Post-cancel settle delay before opening the mic. Defensive backstop —
// with hardware AEC the mic no longer physically hears the coach, so
// this can likely shrink from 350ms to ~50ms once Phase A v2 is proven
// stable on device. Keep defensive for the first week.
const POST_CANCEL_SETTLE_MS = 350;

// Maximum consecutive recognition errors before auto-rearm is disabled
// and the user has to explicitly tap MIC again. Prevents the error loop
// we observed when the underlying recognizer (SFSpeechRecognizer in v3,
// now VoiceEngine's own session) gets stuck — each failed start triggered
// another start and the loop hammered the mic until the user toggled off.
const MAX_CONSECUTIVE_ERRORS = 3;

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

/** Type for the handler returned by registerListeners — unsubscribes all. */
type UnsubscribeAll = () => void;

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
      // audioFormat:'pcm' tells the backend to return raw PCM 16 kHz int16
      // bytes instead of MP3 — VoiceEngine's play() path decodes this
      // directly into an AVAudioPCMBuffer whose format matches the
      // VoiceProcessingIO hardware format. Without this flag the backend
      // defaults to MP3 which this build can't play through the native
      // module after the Phase E-0 fix.
      body: JSON.stringify({
        question,
        exerciseName,
        formScore,
        completedReps: reps,
        audioFormat: 'pcm',
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
  const [state, setState] = useState<VoiceInputState>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastAnswer, setLastAnswer] = useState('');
  const [continuousMode, setContinuousMode] = useState(false);

  // Refs mirror state so closures in speech-recognition listeners always
  // see the latest value even across multiple start/stop cycles.
  const unsubscribeRef = useRef<UnsubscribeAll | null>(null);
  const continuousRef = useRef(false);
  const userStoppedRef = useRef(false);
  // Single pending re-arm timer. When 'end' and 'error' fire in quick
  // succession (common in error cascades), each scheduled its own
  // setTimeout which stacked up and spawned multiple concurrent recognition
  // sessions. scheduleReArm cancels any pending timer before scheduling
  // a new one — only the most recent schedule wins.
  const rearmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Consecutive recognition error count. Resets on any successful result.
  // Once it hits MAX_CONSECUTIVE_ERRORS we stop auto-rearming.
  const consecutiveErrorsRef = useRef(0);

  // Sync continuousRef with continuousMode via useEffect rather than
  // mutating during render (which is brittle — parent re-renders could
  // interleave listener closures with state transitions).
  useEffect(() => {
    continuousRef.current = continuousMode;
  }, [continuousMode]);

  const cleanup = () => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
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

  // Factory for the "finalize this question and ship it to Claude" closure.
  // Shared between the result listener (on isFinal) and the end listener
  // (fallback for when the engine doesn't fire isFinal).
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

      if (continuousRef.current && !userStoppedRef.current) {
        scheduleReArm(CONTINUOUS_REARM_MS);
      } else {
        setState('idle');
      }
    });
  };

  const makeResultHandler = (
    session: SessionState,
    sendToCoach: (text: string) => void,
  ) => (result: RecognitionResult) => {
    // ECHO GATE (defensive): with hardware AEC from VoiceEngine, echo
    // transcripts shouldn't reach us at all. Keep the check as a
    // backstop — it's cheap and guards against native module regressions.
    if (isSpeakingOrJustStopped()) return;

    const text = result.transcript || '';
    // Successful result resets the consecutive-error counter — the
    // recognizer is clearly healthy if it's producing text.
    if (text.length > 0) consecutiveErrorsRef.current = 0;
    session.lastTranscript = text;
    setTranscript(text);

    // Auto-pause coach on first interim result with real content.
    // This is the "interrupt mid-sentence" UX. With hardware AEC this
    // now works in continuous mode without echo-triggered false positives.
    if (!session.autopaused && text.length > MIN_SPEECH_CHARS) {
      session.autopaused = true;
      pauseCoach();
      setState('user-speaking');
      console.log('[VoiceInput] Auto-paused coach on user speech');
    }

    if (result.isFinal) sendToCoach(text);
  };

  const makeEndHandler = (
    session: SessionState,
    sendToCoach: (text: string) => void,
  ) => () => {
    console.log('[VoiceInput] Ended, lastTranscript:', session.lastTranscript);

    // Defensive echo gate (same reasoning as result handler).
    if (isSpeakingOrJustStopped()) {
      session.lastTranscript = '';
      if (continuousRef.current && !userStoppedRef.current) {
        scheduleReArm(CONTINUOUS_REARM_MS);
        return;
      }
      setState('idle');
      return;
    }

    // End-event fallback: got transcript but no isFinal, send it now.
    if (!session.answered && session.lastTranscript.length > MIN_SPEECH_CHARS) {
      sendToCoach(session.lastTranscript);
      return;
    }

    // Continuous mode auto-reloop so mic stays effectively always-on.
    if (continuousRef.current && !userStoppedRef.current && !session.answered) {
      console.log('[VoiceInput] Continuous re-arm');
      if (session.autopaused) resumeCoach();
      scheduleReArm(CONTINUOUS_REARM_MS);
      return;
    }

    setState('idle');
    if (session.autopaused) resumeCoach();
  };

  const makeErrorHandler = (session: SessionState) => (e: { message: string }) => {
    console.warn('[VoiceInput] Error:', e.message);
    if (session.autopaused) resumeCoach();

    consecutiveErrorsRef.current += 1;
    // Circuit breaker: after MAX_CONSECUTIVE_ERRORS failures in a row
    // the recognizer is clearly stuck. Stop auto-rearming — user has
    // to tap MIC again to reset.
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
      const backoffMs = CONTINUOUS_REARM_MS * 2 * consecutiveErrorsRef.current;
      scheduleReArm(backoffMs);
      return;
    }
    setState('idle');
  };

  // Core speech-recognition setup. Orchestrator — delegates handler bodies
  // to the factories above. Called recursively via setTimeout for
  // continuous mode re-arm.
  const internalStart = async () => {
    if (!isVoiceEngineAvailable()) {
      console.warn('[VoiceInput] VoiceEngine native module not available');
      return;
    }

    try {
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

      // Subscribe to VoiceEngine events. Each subscriber returns an
      // unsubscribe function; we combine them into one cleanup closure.
      const unsubResult = onRecognitionResult(makeResultHandler(session, sendToCoach));
      const unsubEnd = onRecognitionEnd(makeEndHandler(session, sendToCoach));
      const unsubError = onRecognitionError(makeErrorHandler(session));
      unsubscribeRef.current = () => {
        unsubResult();
        unsubEnd();
        unsubError();
      };

      await engineStartRecognition({ lang: 'cs-CZ', continuous: true });
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
    clearPendingReArm();
    consecutiveErrorsRef.current = 0;
    engineStopRecognition();
    setState('idle');
    cleanup();
    resumeCoach();
  };

  // Toggle always-on listening. When ON, the mic stays effectively open
  // and the coach is auto-paused whenever the user speaks.
  const toggleContinuous = async () => {
    if (continuousRef.current) {
      // Turning OFF — ref is set synchronously so in-flight stopListening
      // sees the new value immediately; useEffect will sync state on next
      // render cycle.
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
