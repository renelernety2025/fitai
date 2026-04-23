import { request } from './base';
import type { ExerciseData } from './exercises';

export interface WorkoutPlanData {
  id: string;
  name: string;
  nameCs: string;
  description: string;
  type: string;
  difficulty: string;
  isTemplate: boolean;
  daysPerWeek: number;
  days: {
    id: string;
    dayIndex: number;
    name: string;
    nameCs: string;
    plannedExercises: {
      id: string;
      exerciseId: string;
      orderIndex: number;
      targetSets: number;
      targetReps: number;
      targetWeight: number | null;
      restSeconds: number;
      notes?: string;
      groupId?: string | null;
      groupType?: string | null;
      groupOrder?: number | null;
      exercise: {
        id: string;
        name: string;
        nameCs: string;
        muscleGroups: string[];
      };
    }[];
  }[];
}

export interface GymSessionData {
  id: string;
  userId: string;
  workoutPlanId: string | null;
  startedAt: string;
  completedAt: string | null;
  totalReps: number;
  averageFormScore: number;
  durationSeconds: number;
  exerciseSets: {
    id: string;
    exerciseId: string;
    setNumber: number;
    targetReps: number;
    actualReps: number;
    targetWeight: number | null;
    actualWeight: number | null;
    formScore: number;
    status: string;
    exercise: ExerciseData;
  }[];
}

export interface SessionData {
  id: string;
  userId: string;
  videoId: string;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number;
  accuracyScore: number;
  video?: {
    title: string;
    category: string;
    thumbnailUrl: string;
  };
}

export interface ProgressResult {
  xpGained: number;
  totalXP: number;
  currentStreak: number;
  levelUp: boolean;
  levelName: string;
}

export interface HomeWorkoutData {
  mode: 'home' | 'travel' | 'quick';
  title: string;
  durationMin: number;
  rounds: number;
  rest: string;
  exercises: Array<{
    id: string;
    name: string;
    nameCs: string;
    muscleGroups: string[];
    reps: number | string;
    duration?: number;
    instructions?: any;
  }>;
}

export interface OnboardingStatus {
  completed: boolean;
  step:
    | 'profile'
    | 'measurements'
    | 'fitness_test'
    | 'finalize'
    | 'done';
  nextAction: string | null;
}

export interface SuggestedWeight {
  exerciseId: string;
  exerciseName: string;
  oneRMKg: number;
  recommendedWorkingWeight: number;
  recommendedReps: number;
  firstWeekWeight: number;
}

export function getWorkoutPlans() {
  return request<WorkoutPlanData[]>('/workout-plans');
}

export function getWorkoutPlan(id: string) {
  return request<WorkoutPlanData>(`/workout-plans/${id}`);
}

export function cloneWorkoutPlan(id: string) {
  return request<WorkoutPlanData>(
    `/workout-plans/${id}/clone`,
    { method: 'POST' },
  );
}

export function updateWorkoutPlan(
  id: string,
  data: Record<string, unknown>,
) {
  return request<WorkoutPlanData>(`/workout-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function startGymSession(data: {
  workoutPlanId?: string;
  workoutDayIndex?: number;
  coachPersonality?: 'DRILL' | 'CHILL' | 'MOTIVATIONAL';
  adHocExercises?: {
    exerciseId: string;
    targetSets: number;
    targetReps: number;
    targetWeight?: number;
  }[];
}) {
  return request<GymSessionData>('/gym-sessions/start', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getGymSession(id: string) {
  return request<GymSessionData>(`/gym-sessions/${id}`);
}

export function completeGymSet(
  sessionId: string,
  data: {
    setId: string;
    actualReps: number;
    actualWeight?: number;
    formScore: number;
    repData?: any;
  },
) {
  return request<any>(
    `/gym-sessions/${sessionId}/set/complete`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

export function endGymSession(sessionId: string) {
  return request<{
    session: GymSessionData;
    progress: ProgressResult;
    totalReps: number;
    avgForm: number;
  }>(`/gym-sessions/${sessionId}/end`, { method: 'POST' });
}

export function getMyGymSessions() {
  return request<GymSessionData[]>('/gym-sessions/my');
}

export function startSession(videoId: string) {
  return request<SessionData>('/sessions/start', {
    method: 'POST',
    body: JSON.stringify({ videoId }),
  });
}

export function endSession(
  sessionId: string,
  data: { durationSeconds: number; accuracyScore: number },
) {
  return request<{
    session: SessionData;
    progress: ProgressResult;
  }>(`/sessions/${sessionId}/end`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function savePoseSnapshot(
  sessionId: string,
  data: {
    timestamp: number;
    poseName: string;
    isCorrect: boolean;
    errorMessage?: string;
    jointAngles: Record<string, number>;
  },
) {
  return request<any>(`/sessions/${sessionId}/pose-snap`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getMySessions() {
  return request<SessionData[]>('/sessions/my');
}

export function getMyStats() {
  return request<StatsData>('/sessions/my/stats');
}

export interface StatsData {
  totalSessions: number;
  totalMinutes: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  levelName: string;
  levelNumber: number;
  weeklyActivity: { date: string; minutes: number }[];
}

export interface ReminderData {
  shouldRemind: boolean;
  daysSinceLastWorkout: number | null;
  message: string;
}

export function getReminderStatus() {
  return request<ReminderData>('/users/me/reminder-status');
}

export function getQuickWorkout() {
  return request<HomeWorkoutData>('/home-training/quick');
}

export function getHomeWorkout() {
  return request<HomeWorkoutData>('/home-training/home');
}

export function getTravelWorkout() {
  return request<HomeWorkoutData>('/home-training/travel');
}

export function getOnboardingStatus() {
  return request<OnboardingStatus>('/onboarding/status');
}

export function getOnboardingTestExercises() {
  return request<
    { id: string; nameCs: string; muscleGroups: string[] }[]
  >('/onboarding/test-exercises');
}

export function saveOnboardingMeasurements(data: {
  age: number;
  weightKg: number;
  heightCm: number;
}) {
  return request<any>('/onboarding/measurements', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function submitFitnessTest(
  results: {
    exerciseId: string;
    weight: number;
    reps: number;
  }[],
) {
  return request<any>('/onboarding/fitness-test', {
    method: 'POST',
    body: JSON.stringify({ results }),
  });
}

export function completeOnboarding() {
  return request<any>('/onboarding/complete', {
    method: 'POST',
  });
}

export function getSuggestedWeights() {
  return request<SuggestedWeight[]>(
    '/onboarding/suggested-weights',
  );
}

export interface WeeklyVolumeEntry {
  muscleGroup: string;
  sets: number;
  reps: number;
  volumeKg: number;
  status: 'undertrained' | 'optimal' | 'overtrained';
  recommended: { min: number; max: number };
}

export function getMyWeeklyVolume() {
  return request<WeeklyVolumeEntry[]>(
    '/gym-sessions/my/weekly-volume',
  );
}

export function getAdaptiveRecommendation(exerciseId: string) {
  return request<{
    exerciseId: string;
    currentWeight: number | null;
    recommendedWeight: number | null;
    reasonCs: string;
  }>(`/adaptive/recommendations/${exerciseId}`);
}

export function getCalendarMonth(month: string) {
  return request<any>(`/calendar?month=${month}`);
}

export function scheduleWorkout(
  data: Record<string, unknown>,
) {
  return request<any>('/calendar', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateScheduledWorkout(
  id: string,
  data: Record<string, unknown>,
) {
  return request<any>(`/calendar/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteScheduledWorkout(id: string) {
  return request<void>(`/calendar/${id}`, {
    method: 'DELETE',
  });
}
