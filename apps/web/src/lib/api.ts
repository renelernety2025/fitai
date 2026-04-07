const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE}/api`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fitai_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  level: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: UserData;
  accessToken: string;
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  durationSeconds: number;
  thumbnailUrl: string;
  hlsUrl: string | null;
  s3RawKey: string;
  choreographyUrl: string | null;
  preprocessingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  preprocessingError: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface PreprocessingStatusData {
  id: string;
  preprocessingStatus: string;
  preprocessingError: string | null;
  preprocessingJobId: string | null;
  choreographyUrl: string | null;
}

// Auth
export function authLogin(email: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function authRegister(data: { email: string; password: string; name: string; level?: string }) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function authMe() {
  return request<UserData>('/auth/me');
}

// Videos
export function getVideos(filters?: { category?: string; difficulty?: string }) {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.difficulty) params.set('difficulty', filters.difficulty);
  const qs = params.toString();
  return request<VideoData[]>(`/videos${qs ? `?${qs}` : ''}`);
}

export function getVideo(id: string) {
  return request<VideoData>(`/videos/${id}`);
}

export function getUploadUrl(filename: string, contentType: string) {
  const params = new URLSearchParams({ filename, contentType });
  return request<{ uploadUrl: string; s3Key: string }>(`/videos/upload-url?${params}`);
}

// Sessions & Progress
export interface SessionData {
  id: string;
  userId: string;
  videoId: string;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number;
  accuracyScore: number;
  video?: { title: string; category: string; thumbnailUrl: string };
}

export interface ProgressResult {
  xpGained: number;
  totalXP: number;
  currentStreak: number;
  levelUp: boolean;
  levelName: string;
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

export function startSession(videoId: string) {
  return request<SessionData>('/sessions/start', {
    method: 'POST',
    body: JSON.stringify({ videoId }),
  });
}

export function endSession(sessionId: string, data: { durationSeconds: number; accuracyScore: number }) {
  return request<{ session: SessionData; progress: ProgressResult }>(
    `/sessions/${sessionId}/end`,
    { method: 'POST', body: JSON.stringify(data) },
  );
}

export function savePoseSnapshot(sessionId: string, data: {
  timestamp: number; poseName: string; isCorrect: boolean;
  errorMessage?: string; jointAngles: Record<string, number>;
}) {
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

export function getReminderStatus() {
  return request<ReminderData>('/users/me/reminder-status');
}

export function createVideo(dto: {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  durationSeconds: number;
  thumbnailUrl: string;
  s3RawKey: string;
}) {
  return request<VideoData>('/videos', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

// Admin
export function getAdminVideos() {
  return request<VideoData[]>('/videos/admin/all');
}

export function publishVideo(id: string) {
  return request<VideoData>(`/videos/${id}/publish`, { method: 'PUT' });
}

export function deleteVideo(id: string) {
  return request<void>(`/videos/${id}`, { method: 'DELETE' });
}

// Preprocessing
export function startPreprocessing(videoId: string) {
  return request<{ jobId: string; status: string; message: string }>('/preprocessing/start', {
    method: 'POST',
    body: JSON.stringify({ videoId }),
  });
}

export function getPreprocessingStatus(videoId: string) {
  return request<PreprocessingStatusData>(`/preprocessing/status/${videoId}`);
}

export function reprocessVideo(videoId: string) {
  return request<{ jobId: string; status: string; message: string }>(`/videos/${videoId}/reprocess`, {
    method: 'PUT',
  });
}

// Exercises
export interface ExerciseData {
  id: string;
  name: string;
  nameCs: string;
  description: string;
  descriptionCs: string;
  muscleGroups: string[];
  difficulty: string;
  phases: any[];
  thumbnailUrl: string | null;
}

export function getExercises(filters?: { muscleGroup?: string; difficulty?: string }) {
  const params = new URLSearchParams();
  if (filters?.muscleGroup) params.set('muscleGroup', filters.muscleGroup);
  if (filters?.difficulty) params.set('difficulty', filters.difficulty);
  const qs = params.toString();
  return request<ExerciseData[]>(`/exercises${qs ? `?${qs}` : ''}`);
}

export function getExercise(id: string) {
  return request<ExerciseData>(`/exercises/${id}`);
}

// Workout Plans
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
      exercise: { id: string; name: string; nameCs: string; muscleGroups: string[] };
    }[];
  }[];
}

export function getWorkoutPlans() {
  return request<WorkoutPlanData[]>('/workout-plans');
}

export function getWorkoutPlan(id: string) {
  return request<WorkoutPlanData>(`/workout-plans/${id}`);
}

export function cloneWorkoutPlan(id: string) {
  return request<WorkoutPlanData>(`/workout-plans/${id}/clone`, { method: 'POST' });
}

// Gym Sessions
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

export function startGymSession(data: {
  workoutPlanId?: string;
  workoutDayIndex?: number;
  adHocExercises?: { exerciseId: string; targetSets: number; targetReps: number; targetWeight?: number }[];
}) {
  return request<GymSessionData>('/gym-sessions/start', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getGymSession(id: string) {
  return request<GymSessionData>(`/gym-sessions/${id}`);
}

export function completeGymSet(sessionId: string, data: {
  setId: string; actualReps: number; actualWeight?: number; formScore: number; repData?: any;
}) {
  return request<any>(`/gym-sessions/${sessionId}/set/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function endGymSession(sessionId: string) {
  return request<{ session: GymSessionData; progress: ProgressResult; totalReps: number; avgForm: number }>(
    `/gym-sessions/${sessionId}/end`,
    { method: 'POST' },
  );
}

// Education (Section D)
export interface Lesson {
  id: string;
  slug: string;
  titleCs: string;
  category: string;
  bodyCs: string;
  durationMin: number;
  publishedAt: string;
}

export interface GlossaryTerm {
  id: string;
  termCs: string;
  definitionCs: string;
  category: string | null;
}

export interface PreWorkoutBriefing {
  greeting: string;
  summary: string;
  muscleGroups: string[];
  exercises: string;
  tips: string[];
  warmupReminder: string;
}

export interface PostWorkoutDebrief {
  duration: number;
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
  avgFormScore: number;
  avgRpe: number | null;
  wins: string[];
  improvements: string[];
  nextSteps: string[];
}

export function getLessons(category?: string) {
  return request<Lesson[]>(`/education/lessons${category ? `?category=${category}` : ''}`);
}

export function getLessonOfTheWeek() {
  return request<Lesson | null>('/education/lessons/of-the-week');
}

export function getLesson(slug: string) {
  return request<Lesson>(`/education/lessons/${slug}`);
}

export function getGlossary(query?: string) {
  return request<GlossaryTerm[]>(`/education/glossary${query ? `?q=${encodeURIComponent(query)}` : ''}`);
}

export function getPreWorkoutBriefing(gymSessionId: string) {
  return request<PreWorkoutBriefing>(`/education/briefing/${gymSessionId}`);
}

export function getPostWorkoutDebrief(gymSessionId: string) {
  return request<PostWorkoutDebrief>(`/education/debrief/${gymSessionId}`);
}

// Onboarding (Section C)
export interface OnboardingStatus {
  completed: boolean;
  step: 'profile' | 'measurements' | 'fitness_test' | 'finalize' | 'done';
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

export function getOnboardingStatus() {
  return request<OnboardingStatus>('/onboarding/status');
}

export function getOnboardingTestExercises() {
  return request<{ id: string; nameCs: string; muscleGroups: string[] }[]>('/onboarding/test-exercises');
}

export function saveOnboardingMeasurements(data: { age: number; weightKg: number; heightCm: number }) {
  return request<any>('/onboarding/measurements', { method: 'PUT', body: JSON.stringify(data) });
}

export function submitFitnessTest(results: { exerciseId: string; weight: number; reps: number }[]) {
  return request<any>('/onboarding/fitness-test', { method: 'POST', body: JSON.stringify({ results }) });
}

export function completeOnboarding() {
  return request<any>('/onboarding/complete', { method: 'POST' });
}

export function getSuggestedWeights() {
  return request<SuggestedWeight[]>('/onboarding/suggested-weights');
}

// Intelligence (Section B)
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
    overallStatus: 'fresh' | 'normal' | 'fatigued' | 'overreached';
    recommendation: string;
  };
  weakPoints: {
    weakMuscleGroups: { muscle: string; reason: string; suggestedExercises: string[] }[];
    asymmetries: { joint: string; severity: number; recommendation: string }[];
  };
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

export interface WeeklyVolumeEntry {
  muscleGroup: string;
  sets: number;
  reps: number;
  volumeKg: number;
  status: 'undertrained' | 'optimal' | 'overtrained';
  recommended: { min: number; max: number };
}

export function getMyWeeklyVolume() {
  return request<WeeklyVolumeEntry[]>('/gym-sessions/my/weekly-volume');
}

export function getAdaptiveRecommendation(exerciseId: string) {
  return request<{ exerciseId: string; currentWeight: number | null; recommendedWeight: number | null; reasonCs: string }>(
    `/adaptive/recommendations/${exerciseId}`,
  );
}

// AI Planner
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
  notes: string | null;
}

export interface AsymmetryReport {
  asymmetries: { joint: string; count: number; recommendation: string }[];
  fatigue: { earlySetAvgForm: number; lateSetAvgForm: number; dropPercentage: number; recommendation: string };
}

export interface BreakRecovery {
  daysSinceLastWorkout: number;
  intensityMultiplier: number;
  message: string;
}

export function getFitnessProfile() {
  return request<FitnessProfileData>('/ai-planner/profile');
}

export function updateFitnessProfile(data: Partial<FitnessProfileData>) {
  return request<FitnessProfileData>('/ai-planner/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function generateAIPlan() {
  return request<WorkoutPlanData>('/ai-planner/generate', { method: 'POST' });
}

export function getBreakRecovery() {
  return request<BreakRecovery | null>('/ai-planner/break-recovery');
}

export function getAsymmetryReport() {
  return request<AsymmetryReport>('/ai-planner/asymmetry');
}

export function getHomeAlternative() {
  return request<{ message: string; exercises: any[] }>('/ai-planner/home-alternative');
}

// Social
export interface FeedItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: any;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface ChallengeData {
  id: string;
  name: string;
  nameCs: string;
  description: string;
  type: string;
  targetValue: number;
  startDate: string;
  endDate: string;
  _count: { participants: number };
  participants: { currentValue: number; user: { id: string; name: string } }[];
}

export function followUser(userId: string) {
  return request<any>(`/social/follow/${userId}`, { method: 'POST' });
}

export function unfollowUser(userId: string) {
  return request<any>(`/social/follow/${userId}`, { method: 'DELETE' });
}

export function getFollowing() {
  return request<{ id: string; name: string; avatarUrl: string | null }[]>('/social/following');
}

export function getFollowers() {
  return request<{ id: string; name: string; avatarUrl: string | null }[]>('/social/followers');
}

export function getFollowCounts() {
  return request<{ following: number; followers: number }>('/social/follow-counts');
}

export function getSocialFeed() {
  return request<FeedItem[]>('/social/feed');
}

export function getPublicFeed() {
  return request<FeedItem[]>('/social/feed/public');
}

export function getChallenges() {
  return request<ChallengeData[]>('/social/challenges');
}

export function joinChallenge(challengeId: string) {
  return request<any>(`/social/challenges/${challengeId}/join`, { method: 'POST' });
}

export function getLeaderboard(challengeId: string) {
  return request<{ currentValue: number; user: { id: string; name: string } }[]>(
    `/social/challenges/${challengeId}/leaderboard`,
  );
}

export function searchUsers(query: string) {
  return request<{ id: string; name: string; avatarUrl: string | null; level: string }[]>(
    `/social/search?q=${encodeURIComponent(query)}`,
  );
}
