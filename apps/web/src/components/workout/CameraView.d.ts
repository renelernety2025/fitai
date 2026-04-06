import { type PoseLandmarks } from '@/lib/pose-detection';
interface CameraViewProps {
    onPoseDetected: (landmarks: PoseLandmarks) => void;
    active: boolean;
    skeletonColor?: string;
}
export declare function CameraView({ onPoseDetected, active, skeletonColor }: CameraViewProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=CameraView.d.ts.map