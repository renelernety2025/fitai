/**
 * VoiceEngine — TypeScript wrapper over the native AVAudioEngine-based
 * voice coaching module.
 *
 * This thin wrapper is the only JS entry point to the native module.
 * `voice-coach.ts` and `voice-input.ts` import from here instead of
 * directly touching `NativeModules.VoiceEngine`, so the native API shape
 * has exactly one place to adapt if it ever changes.
 *
 * Design: fire-and-forget API for actions (play, stop, start/stopRecognition)
 * with async/promise returns for error propagation, and event-based API
 * for completions / results via NativeEventEmitter.
 *
 * The native module is loaded lazily — `isAvailable()` checks if it's
 * linked at all (e.g. not present in Expo Go without a dev build). Every
 * public function guards on that so the app stays usable even when
 * VoiceEngine can't be resolved at runtime.
 */

import { NativeModules, NativeEventEmitter } from 'react-native';

// NativeModules.VoiceEngine is only present in dev/release builds that
// include the native module — Expo Go won't have it. Type the module as
// `any` here because we're the only consumer and we control the shape.
const Native: any = (NativeModules as any).VoiceEngine ?? null;

export interface RecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export interface StartRecognitionOptions {
  /** BCP-47 locale, e.g. "cs-CZ". */
  lang: string;
  /** When true, the recognizer aims for long-form sessions; the JS side
   *  still re-arms on 'end' events via `onRecognitionEnd`. */
  continuous: boolean;
}

export function isAvailable(): boolean {
  return Native !== null;
}

/**
 * Play base64-encoded audio (MP3 from ElevenLabs). Returns a promise that
 * resolves as soon as scheduling succeeds — actual playback completion is
 * reported via the `playbackFinished` event, which `voice-coach.ts`
 * subscribes to through `onPlaybackFinished()`.
 */
export async function play(audioBase64: string): Promise<void> {
  if (!Native) throw new Error('VoiceEngine native module not loaded');
  return Native.play(audioBase64);
}

/**
 * Immediately stop any in-progress playback. Triggers the same
 * `playbackFinished` event as natural completion — callers should not
 * assume stop() is distinguishable from a naturally-ending buffer.
 */
export function stopPlayback(): void {
  Native?.stopPlayback();
}

/**
 * Phase E-3: chunked streaming playback. Schedules one PCM chunk
 * (raw int16 mono 16 kHz bytes, base64 encoded) into the running
 * player node's buffer queue WITHOUT calling stop() first — multiple
 * playChunk() calls chain seamlessly because AVAudioPlayerNode queues
 * scheduled buffers internally.
 *
 * Dormant until the E-3 Swift half (VoiceEngine.swift::playChunk) is
 * shipped in the next EAS build. Calling this against an older binary
 * (that only has `play`) will throw at the native bridge layer because
 * the method doesn't exist. streamSpeak() in voice-coach.ts catches
 * that and falls back to the legacy speak() path.
 */
export async function playChunk(audioBase64: string): Promise<void> {
  if (!Native) throw new Error('VoiceEngine native module not loaded');
  if (typeof Native.playChunk !== 'function') {
    throw new Error('VoiceEngine.playChunk unavailable — old binary');
  }
  return Native.playChunk(audioBase64);
}

/**
 * Phase E-3: signal end-of-stream. Schedules a sentinel 1-frame empty
 * buffer; its completion handler fires `playbackFinished` only after
 * all real PCM chunks scheduled before it have drained. This is how
 * voice-coach's awaitPlaybackEnd() knows the streaming response is
 * fully played, vs. the single-buffer completion of plain play().
 *
 * Same dormant/old-binary caveat as playChunk above.
 */
export async function finalizeStream(): Promise<void> {
  if (!Native) throw new Error('VoiceEngine native module not loaded');
  if (typeof Native.finalizeStream !== 'function') {
    throw new Error('VoiceEngine.finalizeStream unavailable — old binary');
  }
  return Native.finalizeStream();
}

/**
 * Start speech recognition. Requests microphone + speech recognition
 * permissions on first call. Resolves once the session is successfully
 * armed; subsequent results arrive via `onRecognitionResult()`.
 */
export async function startRecognition(
  options: StartRecognitionOptions,
): Promise<void> {
  if (!Native) throw new Error('VoiceEngine native module not loaded');
  return Native.startRecognition(options.lang, options.continuous);
}

/** Stop the current recognition session; emits `recognitionEnd`. */
export function stopRecognition(): void {
  Native?.stopRecognition();
}

// ─── Event subscriptions ────────────────────────────────────────────────
// NativeEventEmitter is created lazily so that apps without the native
// module (Expo Go, simulator builds without our pod) don't crash on
// import. Subscribe helpers return an unsubscribe function — callers
// should capture and invoke it in their cleanup path.

const emitter = Native ? new NativeEventEmitter(Native) : null;

export function onPlaybackFinished(cb: () => void): () => void {
  const sub = emitter?.addListener('playbackFinished', cb);
  return () => sub?.remove();
}

export function onRecognitionResult(
  cb: (result: RecognitionResult) => void,
): () => void {
  const sub = emitter?.addListener('recognitionResult', cb);
  return () => sub?.remove();
}

export function onRecognitionEnd(cb: () => void): () => void {
  const sub = emitter?.addListener('recognitionEnd', cb);
  return () => sub?.remove();
}

export function onRecognitionError(
  cb: (error: { message: string }) => void,
): () => void {
  const sub = emitter?.addListener('recognitionError', cb);
  return () => sub?.remove();
}

/**
 * Debug event from native VoiceEngine — emitted during ensureEngineStarted()
 * and play() with format info, frame counts, converter status. Shows in
 * Metro log so we can diagnose playback issues without Xcode.
 */
export function onEngineDebug(
  cb: (info: Record<string, unknown>) => void,
): () => void {
  const sub = emitter?.addListener('engineDebug', cb);
  return () => sub?.remove();
}
