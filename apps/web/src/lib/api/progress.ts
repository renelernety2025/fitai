import { request } from './base';

export interface Insights {
  plateaus: {
    exerciseId: string;
    exerciseName: string;
    weeksStagnant: number;
    currentMaxWeight: number;
    recommendation: string;
    suggestedAction: string;
  }[];
  recovery: {
    formTrend: string;
    rpeTrend: string;
    volumeTrend: string;
    overallStatus:
      | 'fresh'
      | 'normal'
      | 'fatigued'
      | 'overreached';
    recommendation: string;
  };
  weakPoints: {
    weakMuscleGroups: {
      muscle: string;
      reason: string;
      suggestedExercises: string[];
    }[];
    asymmetries: {
      joint: string;
      severity: number;
      recommendation: string;
    }[];
  };
}

export interface FitnessProfileData {
  id: string;
  userId: string;
  goal: string;
  experienceMonths: number;
  daysPerWeek: number;
  sessionMinutes: number;
  hasGymAccess: boolean;
  equipment: string[];
  injuries: string[];
  priorityMuscles: string[];
  notes: string | null;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  dailyKcal: number | null;
  dailyProteinG: number | null;
  dailyCarbsG: number | null;
  dailyFatG: number | null;
}

export interface AsymmetryReport {
  asymmetries: {
    joint: string;
    count: number;
    recommendation: string;
  }[];
  fatigue: {
    earlySetAvgForm: number;
    lateSetAvgForm: number;
    dropPercentage: number;
    recommendation: string;
  };
}

export interface BreakRecovery {
  daysSinceLastWorkout: number;
  intensityMultiplier: number;
  message: string;
}

export type PhotoSide = 'FRONT' | 'SIDE' | 'BACK';

export interface BodyPhotoAnalysis {
  estimatedBodyFatPct: number | null;
  estimatedMuscleMass: string | null;
  postureNotes: string | null;
  visibleStrengths: string[];
  areasToWork: string[];
  comparisonNotes: string | null;
}

export interface BodyPhoto {
  id: string;
  side: PhotoSide;
  takenAt: string;
  weightKg: number | null;
  bodyFatPct: number | null;
  notes: string | null;
  isAnalyzed: boolean;
  url: string;
  analysis?: BodyPhotoAnalysis | null;
}

export interface BodyPhotoStats {
  total: number;
  byAngle: { front: number; side: number; back: number };
  firstTakenAt: string | null;
  latestTakenAt: string | null;
  daysTracked: number;
}

export interface DailyCheckIn {
  id?: string;
  date?: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  hydrationL: number | null;
  steps: number | null;
  mood: number | null;
  energy: number | null;
  soreness: number | null;
  stress: number | null;
  notes: string | null;
}

export interface HabitsStats {
  recoveryScore: number | null;
  avgSleep: number | null;
  avgEnergy: number | null;
  avgSoreness: number | null;
  avgStress: number | null;
  streakDays: number;
  totalCheckIns: number;
}

export interface JournalDay {
  date: string;
  entry: JournalEntry | null;
  gymSession: JournalGymSession | null;
}

export interface JournalEntry {
  id: string;
  date: string;
  notes: string | null;
  rating: number | null;
  mood: string | null;
  tags: string[];
  measurements: Record<string, number> | null;
  aiInsight: string | null;
  photos: JournalPhoto[];
}

export interface JournalPhoto {
  id: string;
  s3Key: string;
  caption: string | null;
}

export interface JournalGymSession {
  id: string;
  startedAt: string;
  completedAt: string | null;
  totalReps: number;
  averageFormScore: number;
  durationSeconds: number;
  coachPersonality: string;
  exerciseSets: Array<{
    exerciseName: string;
    sets: number;
    totalReps: number;
    avgWeight: number;
    avgFormScore: number;
    avgRpe: number;
  }>;
  workoutPlanName: string | null;
}

export interface MonthlySummary {
  summary: string;
  stats: {
    workouts: number;
    totalVolume: number;
    prCount: number;
    avgForm: number;
  };
  comparison: {
    workoutsDiff: number;
    volumeDiff: number;
  } | null;
}

export interface Milestone {
  type: string;
  label: string;
  achievedAt: string | null;
}

export function getInsights() {
  return request<Insights>('/intelligence/insights');
}

export function updatePriorityMuscles(muscles: string[]) {
  return request<any>('/intelligence/priority-muscles', {
    method: 'PUT',
    body: JSON.stringify({ muscles }),
  });
}

export function getFitnessProfile() {
  return request<FitnessProfileData>('/ai-planner/profile');
}

export function updateFitnessProfile(
  data: Partial<FitnessProfileData>,
) {
  return request<FitnessProfileData>('/ai-planner/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function generateAIPlan() {
  return request<any>('/ai-planner/generate', {
    method: 'POST',
  });
}

export function getBreakRecovery() {
  return request<BreakRecovery | null>(
    '/ai-planner/break-recovery',
  );
}

export function getAsymmetryReport() {
  return request<AsymmetryReport>('/ai-planner/asymmetry');
}

export function getHomeAlternative() {
  return request<{ message: string; exercises: any[] }>(
    '/ai-planner/home-alternative',
  );
}

export function getProgressPhotos(side?: PhotoSide) {
  const q = side ? `?side=${side}` : '';
  return request<BodyPhoto[]>(`/progress-photos${q}`);
}

export function getProgressPhoto(id: string) {
  return request<BodyPhoto>(`/progress-photos/${id}`);
}

export function getProgressPhotoStats() {
  return request<BodyPhotoStats>('/progress-photos/stats');
}

export function getProgressPhotoUploadUrl(opts: {
  contentType: string;
  side: PhotoSide;
  weightKg?: number;
  bodyFatPct?: number;
  notes?: string;
}) {
  return request<{
    uploadUrl: string;
    photoId: string;
    s3Key: string;
  }>('/progress-photos/upload-url', {
    method: 'POST',
    body: JSON.stringify(opts),
  });
}

export function analyzeProgressPhoto(id: string) {
  return request<BodyPhotoAnalysis>(
    `/progress-photos/${id}/analyze`,
    { method: 'POST' },
  );
}

export function deleteProgressPhoto(id: string) {
  return request<{ deleted: true }>(
    `/progress-photos/${id}`,
    { method: 'DELETE' },
  );
}

export function getHabitsToday() {
  return request<DailyCheckIn>('/habits/today');
}

export function updateHabitsToday(
  body: Partial<DailyCheckIn>,
) {
  return request<DailyCheckIn>('/habits/today', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function getHabitsHistory(days = 30) {
  return request<DailyCheckIn[]>(
    `/habits/history?days=${days}`,
  );
}

export function getHabitsStats() {
  return request<HabitsStats>('/habits/stats');
}

export function getJournalMonth(month: string) {
  return request<{ days: JournalDay[] }>(
    `/journal?month=${month}`,
  );
}

export function upsertJournalEntry(
  date: string,
  body: Record<string, unknown>,
) {
  return request<JournalEntry>(`/journal/${date}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function getJournalPhotoUrl(
  date: string,
  contentType: string,
) {
  return request<{
    uploadUrl: string;
    photoId: string;
    s3Key: string;
  }>(`/journal/${date}/photo-url`, {
    method: 'POST',
    body: JSON.stringify({ contentType }),
  });
}

export function deleteJournalPhoto(photoId: string) {
  return request<{ deleted: boolean }>(
    `/journal/photo/${photoId}`,
    { method: 'DELETE' },
  );
}

export function getJournalMonthlySummary(month: string) {
  return request<MonthlySummary>(
    `/journal/monthly-summary?month=${month}`,
  );
}

export function getJournalMilestones() {
  return request<{ milestones: Milestone[] }>(
    '/journal/milestones',
  );
}

export function generateJournalInsight(date: string) {
  return request<{ insight: string }>(
    `/journal/${date}/ai-insight`,
    { method: 'POST' },
  );
}

export function getBodyPortfolio(): Promise<any> {
  return request('/body-portfolio');
}

export function getBloodwork(): Promise<any[]> {
  return request('/bloodwork');
}

export function addBloodwork(data: any): Promise<any> {
  return request('/bloodwork', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteBloodwork(id: string): Promise<void> {
  return request(`/bloodwork/${id}`, { method: 'DELETE' });
}

export function getBloodworkAnalysis(): Promise<any> {
  return request('/bloodwork/analysis');
}

export function getRehabPlans(): Promise<any[]> {
  return request('/rehab');
}

export function createRehabPlan(data: any): Promise<any> {
  return request('/rehab', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function logRehabSession(
  planId: string,
  data: any,
): Promise<any> {
  return request(`/rehab/${planId}/session`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getRehabSessions(
  planId: string,
): Promise<any[]> {
  return request(`/rehab/${planId}/sessions`);
}

export function getWrapped(
  period: string,
  month?: string,
) {
  const q = month
    ? `?period=${period}&month=${month}`
    : `?period=${period}`;
  return request<any>(`/wrapped${q}`);
}
