/**
 * Adapter: Google ML Kit Pose (via react-native-vision-camera-v3-pose-detection)
 * → MediaPipe BlazePose 33-landmark index standard
 *
 * ML Kit Pose returns a flat object with named landmarks like `leftShoulderX`
 * where each has `.x` and `.y`. This adapter maps it to the standardized
 * 33-index PoseLandmarks array used by feedback-engine.ts / rep-counter.ts.
 *
 * Indices follow MediaPipe BlazePose spec:
 *   0: nose, 1-6: eyes, 7-8: ears (N/A in ML Kit), 9-10: mouth,
 *   11-12: shoulders, 13-14: elbows, 15-16: wrists, 17-20: hands,
 *   21-22: thumbs, 23-24: hips, 25-26: knees, 27-28: ankles,
 *   29-30: heels, 31-32: foot indices
 */

import type { PoseLandmark, PoseLandmarks } from './types';

// Plugin's PoseType (from react-native-vision-camera-v3-pose-detection)
// Each field is { x: number; y: number }. Some landmarks have both X and Y
// variants which reference the same point — plugin naming quirk.
export interface MlkitPose {
  [key: string]: { x: number; y: number } | undefined;
}

/** Safe pick — returns {0,0} for missing landmarks. */
function pick(pose: MlkitPose, ...keys: string[]): PoseLandmark {
  for (const k of keys) {
    const v = pose[k];
    if (v && typeof v.x === 'number' && typeof v.y === 'number') {
      return { x: v.x, y: v.y, visibility: 1 };
    }
  }
  return { x: 0, y: 0, visibility: 0 };
}

/**
 * Convert ML Kit Pose plugin output to a 33-landmark MediaPipe-compatible array.
 * Landmarks that ML Kit doesn't provide (ears indices 7, 8) are filled with zeros.
 */
export function mlkitToLandmarks(pose: MlkitPose): PoseLandmarks {
  const landmarks: PoseLandmarks = new Array(33);

  landmarks[0] = pick(pose, 'noseX', 'noseY');
  landmarks[1] = pick(pose, 'leftEyeInnerX', 'leftEyeInnerY');
  landmarks[2] = pick(pose, 'leftEyeX', 'leftEyeY');
  landmarks[3] = pick(pose, 'leftEyeOuterX', 'leftEyeOuterY');
  landmarks[4] = pick(pose, 'rightEyeInnerX', 'rightEyeInnerY');
  landmarks[5] = pick(pose, 'rightEyeX', 'rightEyeY');
  landmarks[6] = pick(pose, 'rightEyeOuterX', 'rightEyeOuterY');
  landmarks[7] = { x: 0, y: 0, visibility: 0 }; // left ear — N/A
  landmarks[8] = { x: 0, y: 0, visibility: 0 }; // right ear — N/A
  landmarks[9] = pick(pose, 'leftMouthX', 'leftMouthY');
  landmarks[10] = pick(pose, 'rightMouthX', 'rightMouthY');
  landmarks[11] = pick(pose, 'leftShoulderX', 'leftShoulderY');
  landmarks[12] = pick(pose, 'rightShoulderX', 'rightShoulderY');
  landmarks[13] = pick(pose, 'leftElbowX', 'leftElbowY');
  landmarks[14] = pick(pose, 'rightElbowX', 'rightElbowY');
  landmarks[15] = pick(pose, 'leftWristX', 'leftWristY');
  landmarks[16] = pick(pose, 'rightWristX', 'rightWristY');
  landmarks[17] = pick(pose, 'leftPinkyX', 'leftPinkyY');
  landmarks[18] = pick(pose, 'rightPinkyX', 'rightPinkyY');
  landmarks[19] = pick(pose, 'leftIndexX', 'leftIndexY');
  landmarks[20] = pick(pose, 'rightIndexX', 'rightIndexY');
  landmarks[21] = pick(pose, 'leftThumbX', 'leftThumbY');
  landmarks[22] = pick(pose, 'rightThumbX', 'rightThumbY');
  landmarks[23] = pick(pose, 'leftHipX', 'leftHipY');
  landmarks[24] = pick(pose, 'rightHipX', 'rightHipY');
  landmarks[25] = pick(pose, 'leftKneeX', 'leftKneeY');
  landmarks[26] = pick(pose, 'rightKneeX', 'rightKneeY');
  landmarks[27] = pick(pose, 'leftAnkleX', 'leftAnkleY');
  landmarks[28] = pick(pose, 'rightAnkleX', 'rightAnkleY');
  landmarks[29] = pick(pose, 'leftHeelX', 'leftHeelY');
  landmarks[30] = pick(pose, 'rightHeelX', 'rightHeelY');
  landmarks[31] = pick(pose, 'leftFootIndexX', 'leftFootIndexY');
  landmarks[32] = pick(pose, 'rightFootIndexX', 'rightFootIndexY');

  return landmarks;
}

/** Quick check: did we get any valid landmarks? */
export function hasVisiblePose(landmarks: PoseLandmarks): boolean {
  // At least shoulders + hips should be visible for meaningful analysis
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  return (
    (leftShoulder?.visibility ?? 0) > 0 &&
    (rightShoulder?.visibility ?? 0) > 0 &&
    (leftHip?.visibility ?? 0) > 0 &&
    (rightHip?.visibility ?? 0) > 0
  );
}
