import type { ExercisePhaseDefinition } from '@fitai/shared';
interface ExerciseInstructionsProps {
    exerciseName: string;
    muscleGroups: string[];
    phases: ExercisePhaseDefinition[];
    currentPhaseIndex: number;
    targetSets: number;
    completedSets: number;
    currentSet: number;
    targetReps: number;
    completedReps: number;
    weight: number | null;
    recommendation: string | null;
}
export declare function ExerciseInstructions({ exerciseName, muscleGroups, phases, currentPhaseIndex, targetSets, completedSets, currentSet, targetReps, completedReps, weight, recommendation, }: ExerciseInstructionsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ExerciseInstructions.d.ts.map