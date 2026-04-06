import { speak as webSpeak } from './voice-feedback';

type Priority = 'safety' | 'correction' | 'encouragement' | 'info';

const THROTTLE_MS: Record<Priority, number> = {
  safety: 0,
  correction: 2000,
  encouragement: 5000,
  info: 8000,
};

const PRIORITY_ORDER: Record<Priority, number> = {
  safety: 0,
  correction: 1,
  encouragement: 2,
  info: 3,
};

let audioCtx: AudioContext | null = null;
let videoGainNode: GainNode | null = null;
let videoSource: MediaElementAudioSourceNode | null = null;
let lastSpokenAt: Record<Priority, number> = { safety: 0, correction: 0, encouragement: 0, info: 0 };
let currentAudio: HTMLAudioElement | null = null;
let initialized = false;

export function initSmartVoice() {
  if (initialized) return;
  initialized = true;
  audioCtx = new AudioContext();
}

export function setAudioDuckingTarget(videoElement: HTMLVideoElement) {
  if (!audioCtx) return;
  try {
    if (!videoSource) {
      videoSource = audioCtx.createMediaElementSource(videoElement);
      videoGainNode = audioCtx.createGain();
      videoSource.connect(videoGainNode);
      videoGainNode.connect(audioCtx.destination);
    }
  } catch {
    // Already connected or not supported
  }
}

function duckVideo() {
  if (videoGainNode && audioCtx) {
    videoGainNode.gain.setTargetAtTime(0.2, audioCtx.currentTime, 0.1);
  }
}

function unduckVideo() {
  if (videoGainNode && audioCtx) {
    videoGainNode.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.3);
  }
}

export function speakCoaching(
  text: string,
  priority: Priority,
  audioBase64?: string | null,
) {
  const now = Date.now();
  const throttle = THROTTLE_MS[priority];

  // Safety bypasses all throttling
  if (priority !== 'safety' && now - lastSpokenAt[priority] < throttle) return;

  // Higher priority interrupts lower
  if (currentAudio && !currentAudio.paused) {
    // Let safety interrupt everything
    if (priority !== 'safety') return;
    currentAudio.pause();
    currentAudio = null;
  }

  lastSpokenAt[priority] = now;

  // Try ElevenLabs audio first
  if (audioBase64) {
    playBase64Audio(audioBase64, priority);
    return;
  }

  // Fallback to Web Speech
  duckVideo();
  webSpeak(text);
  setTimeout(unduckVideo, 1500);
}

function playBase64Audio(base64: string, priority: Priority) {
  const blob = base64ToBlob(base64, 'audio/mpeg');
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  currentAudio = audio;
  duckVideo();

  audio.onended = () => {
    unduckVideo();
    URL.revokeObjectURL(url);
    if (currentAudio === audio) currentAudio = null;
  };

  audio.onerror = () => {
    unduckVideo();
    URL.revokeObjectURL(url);
    // Fallback to Web Speech
    webSpeak('');
  };

  audio.play().catch(() => {
    unduckVideo();
    // Autoplay blocked, fallback
    webSpeak('');
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mimeType });
}

export function speakRepCount(count: number) {
  speakCoaching(`${count}`, 'info');
}

export function cleanup() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  unduckVideo();
  initialized = false;
}
