import type { PoseLandmarks } from './pose-detection';
import { calculateAngle, JOINT_MAP } from './feedback-engine';
import type { SafetyAlert } from '@fitai/shared';

interface SafetyRule {
  joint: string;
  exercisePattern: RegExp;
  dangerMin: number;
  dangerMax: number;
  severity: 'warning' | 'critical';
  messageCs: string;
}

const RULES: SafetyRule[] = [
  { joint: 'left_knee', exercisePattern: /.*/, dangerMin: 0, dangerMax: 15, severity: 'critical', messageCs: 'Pozor! Nepřepínej koleno!' },
  { joint: 'right_knee', exercisePattern: /.*/, dangerMin: 0, dangerMax: 15, severity: 'critical', messageCs: 'Pozor! Nepřepínej koleno!' },
  { joint: 'left_knee', exercisePattern: /squat|dřep|výpad/i, dangerMin: 0, dangerMax: 50, severity: 'warning', messageCs: 'Kolena tlač ven!' },
  { joint: 'right_knee', exercisePattern: /squat|dřep|výpad/i, dangerMin: 0, dangerMax: 50, severity: 'warning', messageCs: 'Kolena tlač ven!' },
  { joint: 'left_hip', exercisePattern: /deadlift|mrtvý|přítah|row/i, dangerMin: 0, dangerMax: 30, severity: 'critical', messageCs: 'Narovnej záda!' },
  { joint: 'right_hip', exercisePattern: /deadlift|mrtvý|přítah|row/i, dangerMin: 0, dangerMax: 30, severity: 'critical', messageCs: 'Narovnej záda!' },
  { joint: 'left_shoulder', exercisePattern: /press|tlak|overhead/i, dangerMin: 0, dangerMax: 40, severity: 'warning', messageCs: 'Chraň ramena, lokty ven!' },
  { joint: 'right_shoulder', exercisePattern: /press|tlak|overhead/i, dangerMin: 0, dangerMax: 40, severity: 'warning', messageCs: 'Chraň ramena, lokty ven!' },
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
