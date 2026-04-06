import type { PoseLandmarks } from './pose-detection';
import type { PoseCheckpoint } from '@fitai/shared';
export interface JointAngle {
    joint: string;
    angle: number;
}
export interface PoseFeedback {
    isCorrect: boolean;
    errors: string[];
    score: number;
    currentPoseName: string;
}
export declare function calculateAngle(a: {
    x: number;
    y: number;
}, b: {
    x: number;
    y: number;
}, c: {
    x: number;
    y: number;
}): number;
export declare const JOINT_MAP: Record<string, [number, number, number]>;
export declare function getJointAngles(landmarks: PoseLandmarks): JointAngle[];
export declare function checkPose(landmarks: PoseLandmarks, checkpoint: PoseCheckpoint | null): PoseFeedback;
//# sourceMappingURL=feedback-engine.d.ts.map