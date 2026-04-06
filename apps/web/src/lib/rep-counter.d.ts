import type { PoseLandmarks } from './pose-detection';
import type { ExercisePhaseDefinition, RepDataEntry } from '@fitai/shared';
import { type PoseFeedback } from './feedback-engine';
export interface RepState {
    currentPhase: number;
    phaseEnteredAt: number;
    completedReps: number;
    partialRep: boolean;
    currentRepScores: number[];
}
export interface RepFrameResult {
    currentPhase: ExercisePhaseDefinition;
    phaseIndex: number;
    formScore: number;
    repJustCompleted: boolean;
    completedReps: number;
    lastRepData: RepDataEntry | null;
    isPartialRep: boolean;
    feedback: PoseFeedback;
}
export declare function createRepCounter(phases: ExercisePhaseDefinition[]): {
    processFrame: (landmarks: PoseLandmarks, timestampMs: number) => RepFrameResult;
    getState: () => RepState;
    reset: () => void;
};
//# sourceMappingURL=rep-counter.d.ts.map