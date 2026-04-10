/**
 * Adapter: Custom VisionCamera v4 ML Kit Pose plugin → MediaPipe 33-landmark standard.
 *
 * Our Swift plugin (PoseDetectionPlugin.swift) returns keys like "nosePosition",
 * "leftShoulderPosition" with values { x: pixelX, y: pixelY } in image coordinates.
 * This adapter normalizes to 0-1 range and maps to the 33-index array.
 */

import type { PoseLandmark, PoseLandmarks } from './types';

export interface MlkitPose {
  [key: string]: { x: number; y: number } | undefined;
}


function pick(pose: MlkitPose, key: string, frameW: number, frameH: number): PoseLandmark {
  const v = pose[key];
  if (v && typeof v.x === 'number' && typeof v.y === 'number') {
    // Normalize pixel coords to 0-1
    const x = frameW > 1 ? v.x / frameW : v.x;
    const y = frameH > 1 ? v.y / frameH : v.y;
    return { x, y, visibility: 1 };
  }
  return { x: 0, y: 0, visibility: 0 };
}

/**
 * Convert our Swift plugin output to 33-landmark MediaPipe-compatible array.
 */
export function mlkitToLandmarks(pose: MlkitPose): PoseLandmarks {
  // Get frame dimensions from plugin (available after next build)
  // or fallback to auto-detection
  const fwRaw = (pose as any)._frameWidth;
  const fhRaw = (pose as any)._frameHeight;
  const frameW = typeof fwRaw === 'number' && fwRaw > 1 ? fwRaw : 480;
  const frameH = typeof fhRaw === 'number' && fhRaw > 1 ? fhRaw : 640;

  const landmarks: PoseLandmarks = new Array(33);

  landmarks[0] = pick(pose, 'nosePosition', frameW, frameH);
  landmarks[1] = pick(pose, 'leftEyeInnerPosition', frameW, frameH);
  landmarks[2] = pick(pose, 'leftEyePosition', frameW, frameH);
  landmarks[3] = pick(pose, 'leftEyeOuterPosition', frameW, frameH);
  landmarks[4] = pick(pose, 'rightEyeInnerPosition', frameW, frameH);
  landmarks[5] = pick(pose, 'rightEyePosition', frameW, frameH);
  landmarks[6] = pick(pose, 'rightEyeOuterPosition', frameW, frameH);
  landmarks[7] = pick(pose, 'leftEarPosition', frameW, frameH);
  landmarks[8] = pick(pose, 'rightEarPosition', frameW, frameH);
  landmarks[9] = pick(pose, 'leftMouthPosition', frameW, frameH);
  landmarks[10] = pick(pose, 'rightMouthPosition', frameW, frameH);
  landmarks[11] = pick(pose, 'leftShoulderPosition', frameW, frameH);
  landmarks[12] = pick(pose, 'rightShoulderPosition', frameW, frameH);
  landmarks[13] = pick(pose, 'leftElbowPosition', frameW, frameH);
  landmarks[14] = pick(pose, 'rightElbowPosition', frameW, frameH);
  landmarks[15] = pick(pose, 'leftWristPosition', frameW, frameH);
  landmarks[16] = pick(pose, 'rightWristPosition', frameW, frameH);
  landmarks[17] = pick(pose, 'leftPinkyPosition', frameW, frameH);
  landmarks[18] = pick(pose, 'rightPinkyPosition', frameW, frameH);
  landmarks[19] = pick(pose, 'leftIndexPosition', frameW, frameH);
  landmarks[20] = pick(pose, 'rightIndexPosition', frameW, frameH);
  landmarks[21] = pick(pose, 'leftThumbPosition', frameW, frameH);
  landmarks[22] = pick(pose, 'rightThumbPosition', frameW, frameH);
  landmarks[23] = pick(pose, 'leftHipPosition', frameW, frameH);
  landmarks[24] = pick(pose, 'rightHipPosition', frameW, frameH);
  landmarks[25] = pick(pose, 'leftKneePosition', frameW, frameH);
  landmarks[26] = pick(pose, 'rightKneePosition', frameW, frameH);
  landmarks[27] = pick(pose, 'leftAnklePosition', frameW, frameH);
  landmarks[28] = pick(pose, 'rightAnklePosition', frameW, frameH);
  landmarks[29] = pick(pose, 'leftHeelPosition', frameW, frameH);
  landmarks[30] = pick(pose, 'rightHeelPosition', frameW, frameH);
  landmarks[31] = pick(pose, 'leftFootIndexPosition', frameW, frameH);
  landmarks[32] = pick(pose, 'rightFootIndexPosition', frameW, frameH);

  return landmarks;
}

/** Quick check: are enough landmarks visible for any analysis? */
export function hasVisiblePose(landmarks: PoseLandmarks): boolean {
  const keyIndices = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
  let visible = 0;
  for (const idx of keyIndices) {
    if ((landmarks[idx]?.visibility ?? 0) > 0) visible++;
  }
  return visible >= 3;
}
