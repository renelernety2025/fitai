'use client';

import type { PoseFeedback } from '@/lib/feedback-engine';

interface FeedbackOverlayProps {
  feedback: PoseFeedback | null;
}

export function FeedbackOverlay({ feedback }: FeedbackOverlayProps) {
  if (!feedback || !feedback.currentPoseName) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4">
      {/* Pose name */}
      <p className="mb-2 text-center text-sm font-medium text-white/80">
        {feedback.currentPoseName}
      </p>

      {/* Score badge */}
      <div className="absolute right-4 top-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ${
            feedback.score >= 70 ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {feedback.score}
        </div>
      </div>

      {/* Feedback banner */}
      {feedback.isCorrect ? (
        <div className="rounded-xl bg-green-600/90 px-4 py-3 text-center backdrop-blur">
          <p className="font-semibold text-white">
            {feedback.currentPoseName} — Výborně!
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-red-600/90 px-4 py-3 backdrop-blur">
          {feedback.errors.map((err, i) => (
            <p key={i} className="text-center text-sm font-medium text-white">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
