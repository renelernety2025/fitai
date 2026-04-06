export interface SafetyRule {
  joint: string;
  exercisePattern: string;
  dangerMin: number;
  dangerMax: number;
  severity: 'warning' | 'critical';
  messageCs: string;
}

export const SAFETY_RULES: SafetyRule[] = [
  // Hyperextenze kolen (jakýkoliv cvik)
  { joint: 'left_knee', exercisePattern: '.*', dangerMin: 0, dangerMax: 15, severity: 'critical', messageCs: 'Pozor! Nepřepínej koleno, hrozí zranění!' },
  { joint: 'right_knee', exercisePattern: '.*', dangerMin: 0, dangerMax: 15, severity: 'critical', messageCs: 'Pozor! Nepřepínej koleno, hrozí zranění!' },

  // Kolena dovnitř při dřepu
  { joint: 'left_knee', exercisePattern: 'squat|dřep|výpad', dangerMin: 0, dangerMax: 50, severity: 'warning', messageCs: 'Kolena tlač ven, nespadávej dovnitř.' },
  { joint: 'right_knee', exercisePattern: 'squat|dřep|výpad', dangerMin: 0, dangerMax: 50, severity: 'warning', messageCs: 'Kolena tlač ven, nespadávej dovnitř.' },

  // Zaoblená záda při mrtvém tahu / přítazích
  { joint: 'left_hip', exercisePattern: 'deadlift|mrtvý|přítah|row', dangerMin: 0, dangerMax: 30, severity: 'critical', messageCs: 'Zaokrouhlená záda! Narovnej páteř!' },
  { joint: 'right_hip', exercisePattern: 'deadlift|mrtvý|přítah|row', dangerMin: 0, dangerMax: 30, severity: 'critical', messageCs: 'Zaokrouhlená záda! Narovnej páteř!' },

  // Impingement ramen při tlaku nad hlavu
  { joint: 'left_shoulder', exercisePattern: 'press|tlak|overhead', dangerMin: 0, dangerMax: 40, severity: 'warning', messageCs: 'Nespouštěj lokty za hlavu, chraň ramena.' },
  { joint: 'right_shoulder', exercisePattern: 'press|tlak|overhead', dangerMin: 0, dangerMax: 40, severity: 'warning', messageCs: 'Nespouštěj lokty za hlavu, chraň ramena.' },

  // Přílišné prohnutí v zádech (bench press, overhead press)
  { joint: 'left_hip', exercisePattern: 'bench|press|tlak', dangerMin: 190, dangerMax: 360, severity: 'warning', messageCs: 'Neprohýbej se v zádech!' },
];

export function checkSafetyRules(
  jointAngles: { joint: string; angle: number }[],
  exerciseName: string,
): { joint: string; measuredAngle: number; severity: 'warning' | 'critical'; messageCs: string }[] {
  const alerts: { joint: string; measuredAngle: number; severity: 'warning' | 'critical'; messageCs: string }[] = [];
  const nameLower = exerciseName.toLowerCase();

  for (const rule of SAFETY_RULES) {
    if (!new RegExp(rule.exercisePattern, 'i').test(nameLower)) continue;

    const measured = jointAngles.find((a) => a.joint === rule.joint);
    if (!measured) continue;

    if (measured.angle >= rule.dangerMin && measured.angle <= rule.dangerMax) {
      alerts.push({
        joint: rule.joint,
        measuredAngle: measured.angle,
        severity: rule.severity,
        messageCs: rule.messageCs,
      });
    }
  }

  return alerts;
}
