/**
 * Shared pose detection types — mobile version.
 * Ported from web (@fitai/shared) but standalone to keep mobile self-contained.
 * Google ML Kit Pose returns 33 landmarks matching the MediaPipe BlazePose standard
 * (same index map), so feedback-engine.ts and rep-counter.ts from web port 1:1.
 */

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

/** 33 landmarks (MediaPipe BlazePose / Google ML Kit Pose). */
export type PoseLandmarks = PoseLandmark[];

export interface PoseRule {
  joint: string; // 'left_knee' | 'right_knee' | 'left_elbow' | ...
  angle_min: number;
  angle_max: number;
}

export interface PoseCheckpoint {
  name: string;
  nameCs: string;
  rules: PoseRule[];
  feedback_correct: string;
  feedback_wrong: string;
}

export interface ExercisePhaseDefinition {
  name: string;
  nameCs: string;
  rules: PoseRule[];
  feedback_correct: string;
  feedback_wrong: string;
  minDurationMs?: number;
  coachingHint?: string;
}

export interface RepDataEntry {
  repNumber: number;
  formScore: number;
  phaseScores: number[];
  durationMs: number;
  partialRep: boolean;
}

export interface SafetyAlert {
  joint: string;
  measuredAngle: number;
  severity: 'warning' | 'critical';
  messageCs: string;
}
