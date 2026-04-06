/**
 * 3D Pose Detection using MediaPipe Pose Landmarker (Task API).
 * Provides world landmarks with z-depth for better rotation/depth detection.
 * Falls back to existing 2D pose-detection.ts if 3D not available.
 */

import type { PoseLandmarks } from './pose-detection';

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

/**
 * Calculate angle between three 3D points using vector cross product.
 * More accurate than 2D atan2 for rotated joints.
 */
export function calculateAngle3D(
  a: Landmark3D,
  b: Landmark3D,
  c: Landmark3D,
): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2);

  if (magBA === 0 || magBC === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Detect body rotation from shoulder/hip z-depth difference.
 * Positive = facing right, negative = facing left.
 */
export function detectBodyRotation(landmarks: Landmark3D[]): {
  shoulderRotation: number; // degrees, 0 = facing camera
  hipRotation: number;
  isSideways: boolean;
} {
  if (landmarks.length < 33) {
    return { shoulderRotation: 0, hipRotation: 0, isSideways: false };
  }

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  const shoulderDz = rightShoulder.z - leftShoulder.z;
  const hipDz = rightHip.z - leftHip.z;

  const shoulderRotation = Math.atan2(shoulderDz, rightShoulder.x - leftShoulder.x) * (180 / Math.PI);
  const hipRotation = Math.atan2(hipDz, rightHip.x - leftHip.x) * (180 / Math.PI);

  const isSideways = Math.abs(shoulderRotation) > 45;

  return { shoulderRotation, hipRotation, isSideways };
}

/**
 * Enhanced joint angle calculation using 3D if z-data quality is good.
 * Falls back to 2D calculation if z-visibility is poor.
 */
export function getJointAngles3D(
  landmarks: Landmark3D[],
  jointMap: Record<string, [number, number, number]>,
): { joint: string; angle: number; is3D: boolean }[] {
  return Object.entries(jointMap).map(([joint, [a, b, c]]) => {
    const la = landmarks[a];
    const lb = landmarks[b];
    const lc = landmarks[c];

    // Use 3D if all three landmarks have good z-visibility
    const use3D = la.visibility > 0.6 && lb.visibility > 0.6 && lc.visibility > 0.6;

    if (use3D) {
      return { joint, angle: calculateAngle3D(la, lb, lc), is3D: true };
    }

    // Fallback to 2D
    const radians = Math.atan2(lc.y - lb.y, lc.x - lb.x) - Math.atan2(la.y - lb.y, la.x - lb.x);
    let angle = Math.abs((radians * 180) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return { joint, angle, is3D: false };
  });
}

/**
 * Check if a landmark is occluded (behind body).
 * Useful for detecting when limbs cross over.
 */
export function isLandmarkOccluded(landmark: Landmark3D): boolean {
  return landmark.visibility < 0.3;
}
