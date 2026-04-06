import { Pose, POSE_CONNECTIONS, Results, NormalizedLandmark } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export type PoseLandmarks = NormalizedLandmark[];

let poseInstance: Pose | null = null;
let cameraInstance: Camera | null = null;

export async function initPose(
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement,
  onResults: (landmarks: PoseLandmarks) => void,
  options?: { color?: string },
) {
  const pose = new Pose({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  const ctx = canvasElement.getContext('2d')!;

  pose.onResults((results: Results) => {
    ctx.save();
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw camera image
    ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.poseLandmarks) {
      const color = options?.color ?? 'rgba(0,255,0,0.8)';

      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
        color,
        lineWidth: 2,
      });
      drawLandmarks(ctx, results.poseLandmarks, {
        color: '#ffffff',
        lineWidth: 1,
        radius: 3,
      });

      onResults(results.poseLandmarks);
    }

    ctx.restore();
  });

  poseInstance = pose;

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });

  cameraInstance = camera;
  await camera.start();
}

export function stopPose() {
  if (cameraInstance) {
    cameraInstance.stop();
    cameraInstance = null;
  }
  if (poseInstance) {
    poseInstance.close();
    poseInstance = null;
  }
}
