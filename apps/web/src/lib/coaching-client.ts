import type { CoachingFeedbackResponse } from '@fitai/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
let lastRequestAt = 0;
const MIN_INTERVAL_MS = 10000;

interface CoachingRequestParams {
  sessionType: 'video' | 'gym';
  sessionId: string;
  exerciseName: string;
  currentPhase: string;
  formScore: number;
  repCount: number;
  targetReps: number;
  jointAngles: { joint: string; angle: number }[];
  recentErrors: string[];
}

export async function requestCoachingFeedback(
  params: CoachingRequestParams,
): Promise<CoachingFeedbackResponse | null> {
  const now = Date.now();
  if (now - lastRequestAt < MIN_INTERVAL_MS) return null;
  lastRequestAt = now;

  const token = typeof window !== 'undefined' ? localStorage.getItem('fitai_token') : null;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/coaching/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function resetCoachingThrottle() {
  lastRequestAt = 0;
}
