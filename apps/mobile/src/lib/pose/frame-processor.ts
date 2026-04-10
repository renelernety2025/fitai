/**
 * Frame processor wrapper for our custom VisionCamera v4 ML Kit Pose plugin.
 * Call detectPose(frame) inside a useFrameProcessor worklet.
 */

import { VisionCameraProxy, type Frame } from 'react-native-vision-camera';
import type { MlkitPose } from './mlkit-adapter';

const plugin = VisionCameraProxy.initFrameProcessorPlugin('poseDetection', {});

export function detectPose(frame: Frame): MlkitPose | null {
  'worklet';
  if (!plugin) return null;
  const result = plugin.call(frame);
  if (!result || typeof result !== 'object') return null;
  return result as unknown as MlkitPose;
}
