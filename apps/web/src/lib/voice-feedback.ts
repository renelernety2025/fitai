import type { PoseFeedback } from './feedback-engine';

let lastSpokenAt = 0;
const THROTTLE_MS = 3000;

export function speak(text: string, lang = 'cs-CZ') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

export function giveFeedback(
  feedback: PoseFeedback,
  previousFeedback: PoseFeedback | null,
) {
  const now = Date.now();
  if (now - lastSpokenAt < THROTTLE_MS) return;
  if (!feedback.currentPoseName) return;

  const wasCorrect = previousFeedback?.isCorrect ?? true;

  if (feedback.isCorrect && !wasCorrect) {
    speak('Výborně, pokračujte!');
    lastSpokenAt = now;
  } else if (!feedback.isCorrect && wasCorrect && feedback.errors.length > 0) {
    speak(feedback.errors[0]);
    lastSpokenAt = now;
  }
}
