export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  createdAt: string;
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  category: 'YOGA' | 'PILATES' | 'STRENGTH' | 'CARDIO' | 'MOBILITY';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  durationSeconds: number;
  thumbnailUrl: string;
  hlsUrl: string;
  isPublished: boolean;
}

export interface WorkoutSessionSummary {
  id: string;
  userId: string;
  videoId: string;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number;
  accuracyScore: number;
}

export interface PoseRule {
  joint: string;
  angle_min: number;
  angle_max: number;
}

export interface PoseCheckpoint {
  timestamp_start: number;
  timestamp_end: number;
  name: string;
  rules: PoseRule[];
  feedback_wrong: string;
  feedback_correct: string;
}

export interface ChoreographyJson {
  video_id: string;
  poses: PoseCheckpoint[];
}

// ── Gym / Exercise Types ──

export interface ExercisePhaseDefinition {
  phase: 'START' | 'CONCENTRIC' | 'HOLD' | 'ECCENTRIC' | 'END';
  name: string;
  nameCs: string;
  rules: PoseRule[];
  feedback_wrong: string;
  feedback_correct: string;
  minDurationMs?: number;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  nameCs: string;
  muscleGroups: string[];
  difficulty: string;
  phases: ExercisePhaseDefinition[];
  thumbnailUrl?: string;
  instructionUrl?: string;
}

export interface RepDataEntry {
  repNumber: number;
  formScore: number;
  phaseScores: number[];
  durationMs: number;
  partialRep: boolean;
}

export interface WorkoutPlanSummary {
  id: string;
  name: string;
  nameCs: string;
  type: string;
  difficulty: string;
  daysPerWeek: number;
  isTemplate: boolean;
}

export interface PlannedExerciseDetail {
  exerciseId: string;
  exerciseName: string;
  exerciseNameCs: string;
  orderIndex: number;
  targetSets: number;
  targetReps: number;
  targetWeight: number | null;
  restSeconds: number;
}

export interface WeightRecommendation {
  exerciseId: string;
  currentWeight: number | null;
  recommendedWeight: number | null;
  reason: string;
  reasonCs: string;
}

// ── Smart Coach Types ──

export interface SafetyAlert {
  joint: string;
  measuredAngle: number;
  severity: 'warning' | 'critical';
  messageCs: string;
}

export interface CoachingFeedbackRequest {
  sessionType: 'video' | 'gym';
  sessionId: string;
  exerciseName: string;
  currentPhase: string;
  formScore: number;
  repCount: number;
  targetReps: number;
  jointAngles: { joint: string; angle: number }[];
  recentErrors: string[];
}

export interface CoachingFeedbackResponse {
  message: string;
  priority: 'safety' | 'correction' | 'encouragement' | 'info';
  audioBase64: string | null;
}
