import type { ProgressResult } from '@/lib/api';
interface ExerciseSummary {
    name: string;
    sets: number;
    totalReps: number;
    avgFormScore: number;
}
interface GymWorkoutSummaryProps {
    durationSeconds: number;
    totalReps: number;
    avgFormScore: number;
    exercises: ExerciseSummary[];
    progress: ProgressResult;
}
export declare function GymWorkoutSummary({ durationSeconds, totalReps, avgFormScore, exercises, progress, }: GymWorkoutSummaryProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=GymWorkoutSummary.d.ts.map