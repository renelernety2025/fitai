import { NormalizedLandmark } from '@mediapipe/pose';
export type PoseLandmarks = NormalizedLandmark[];
export declare function initPose(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement, onResults: (landmarks: PoseLandmarks) => void, options?: {
    color?: string;
}): Promise<void>;
export declare function stopPose(): void;
//# sourceMappingURL=pose-detection.d.ts.map