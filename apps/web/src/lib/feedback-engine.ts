import type { PoseLandmarks } from './pose-detection';
import type { PoseCheckpoint } from '@fitai/shared';

export interface JointAngle {
  joint: string;
  angle: number;
}

export interface PoseFeedback {
  isCorrect: boolean;
  errors: string[];
  score: number;
  currentPoseName: string;
}

export function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export const JOINT_MAP: Record<string, [number, number, number]> = {
  left_knee: [23, 25, 27],
  right_knee: [24, 26, 28],
  left_elbow: [11, 13, 15],
  right_elbow: [12, 14, 16],
  left_shoulder: [13, 11, 23],
  right_shoulder: [14, 12, 24],
  left_hip: [11, 23, 25],
  right_hip: [12, 24, 26],
};

export function getJointAngles(landmarks: PoseLandmarks): JointAngle[] {
  return Object.entries(JOINT_MAP).map(([joint, [a, b, c]]) => ({
    joint,
    angle: calculateAngle(landmarks[a], landmarks[b], landmarks[c]),
  }));
}

const TOLERANCE = 15;

export function checkPose(
  landmarks: PoseLandmarks,
  checkpoint: PoseCheckpoint | null,
): PoseFeedback {
  if (!checkpoint) {
    return { isCorrect: true, errors: [], score: 100, currentPoseName: '' };
  }

  const angles = getJointAngles(landmarks);
  const angleMap = new Map(angles.map((a) => [a.joint, a.angle]));

  let correct = 0;
  const errors: string[] = [];

  for (const rule of checkpoint.rules) {
    const measured = angleMap.get(rule.joint);
    if (measured === undefined) {
      correct++;
      continue;
    }
    if (
      measured >= rule.angle_min - TOLERANCE &&
      measured <= rule.angle_max + TOLERANCE
    ) {
      correct++;
    } else {
      errors.push(checkpoint.feedback_wrong);
    }
  }

  const total = checkpoint.rules.length || 1;
  const score = Math.round((correct / total) * 100);

  // Deduplicate errors
  const uniqueErrors = [...new Set(errors)];

  return {
    isCorrect: score >= 70,
    errors: uniqueErrors,
    score,
    currentPoseName: checkpoint.name,
  };
}
