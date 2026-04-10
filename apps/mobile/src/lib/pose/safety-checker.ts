/**
 * Safety checker — mobile port from apps/web/src/lib/safety-checker.ts
 * Detects dangerous joint positions during exercise (knee hyperextension,
 * rounded back, shoulder impingement) and emits priority alerts.
 */

import type { PoseLandmarks, SafetyAlert } from './types';
import { calculateAngle, JOINT_MAP } from './feedback-engine';

interface SafetyRule {
  joint: string;
  exercisePattern: RegExp;
  dangerMin: number;
  dangerMax: number;
  severity: 'warning' | 'critical';
  messageCs: string;
}

const RULES: SafetyRule[] = [
  { joint: 'left_knee', exercisePattern: /squat|dřep|výpad|lunge|deadlift|mrtvý|calf/i, dangerMin: 0, dangerMax: 15, severity: 'critical', messageCs: 'Pozor! Nepřepínej koleno!' },
  { joint: 'right_knee', exercisePattern: /squat|dřep|výpad|lunge|deadlift|mrtvý|calf/i, dangerMin: 0, dangerMax: 15, severity: 'critical', messageCs: 'Pozor! Nepřepínej koleno!' },
  { joint: 'left_knee', exercisePattern: /squat|dřep|výpad|lunge/i, dangerMin: 0, dangerMax: 50, severity: 'warning', messageCs: 'Kolena tlač ven!' },
  { joint: 'right_knee', exercisePattern: /squat|dřep|výpad|lunge/i, dangerMin: 0, dangerMax: 50, severity: 'warning', messageCs: 'Kolena tlač ven!' },
  { joint: 'left_hip', exercisePattern: /deadlift|mrtvý|přítah|row/i, dangerMin: 0, dangerMax: 30, severity: 'critical', messageCs: 'Narovnej záda!' },
  { joint: 'right_hip', exercisePattern: /deadlift|mrtvý|přítah|row/i, dangerMin: 0, dangerMax: 30, severity: 'critical', messageCs: 'Narovnej záda!' },
  { joint: 'left_shoulder', exercisePattern: /press|tlak|overhead/i, dangerMin: 0, dangerMax: 40, severity: 'warning', messageCs: 'Chraň ramena, lokty ven!' },
  { joint: 'right_shoulder', exercisePattern: /press|tlak|overhead/i, dangerMin: 0, dangerMax: 40, severity: 'warning', messageCs: 'Chraň ramena, lokty ven!' },
  { joint: 'left_elbow', exercisePattern: /curl|bicep|zdvih/i, dangerMin: 0, dangerMax: 20, severity: 'warning', messageCs: 'Nepřepínej lokty!' },
  { joint: 'right_elbow', exercisePattern: /curl|bicep|zdvih/i, dangerMin: 0, dangerMax: 20, severity: 'warning', messageCs: 'Nepřepínej lokty!' },
];

export function checkSafety(landmarks: PoseLandmarks, exerciseName: string): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];

  for (const rule of RULES) {
    if (!rule.exercisePattern.test(exerciseName)) continue;
    const indices = JOINT_MAP[rule.joint];
    if (!indices) continue;
    const angle = calculateAngle(landmarks[indices[0]], landmarks[indices[1]], landmarks[indices[2]]);
    if (angle >= rule.dangerMin && angle <= rule.dangerMax) {
      alerts.push({
        joint: rule.joint,
        measuredAngle: Math.round(angle),
        severity: rule.severity,
        messageCs: rule.messageCs,
      });
    }
  }

  return alerts;
}
