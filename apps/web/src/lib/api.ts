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

  if (res.status === 401 && typeof window !== 'undefined') {
    // Token expired or invalid — clear and bounce to login
    localStorage.removeItem('fitai_token');
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }

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
  coachPersonality?: 'DRILL' | 'CHILL' | 'MOTIVATIONAL';
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

// ── Home Training (Section E) ──
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

export function getQuickWorkout() {
  return request<HomeWorkoutData>('/home-training/quick');
}
export function getHomeWorkout() {
  return request<HomeWorkoutData>('/home-training/home');
}
export function getTravelWorkout() {
  return request<HomeWorkoutData>('/home-training/travel');
}

// ── Nutrition (Section F) ──
export interface NutritionGoals {
  dailyKcal: number;
  dailyProteinG: number;
  dailyCarbsG: number;
  dailyFatG: number;
  source?: string;
}

export interface FoodLogItem {
  id: string;
  date: string;
  mealType: string;
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servings: number;
}

export interface NutritionToday {
  goals: NutritionGoals;
  totals: { kcal: number; proteinG: number; carbsG: number; fatG: number };
  remaining: { kcal: number; proteinG: number; carbsG: number; fatG: number };
  log: FoodLogItem[];
}

export interface QuickFood {
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function getNutritionGoals() {
  return request<NutritionGoals>('/nutrition/goals');
}
export function setNutritionGoals(body: Omit<NutritionGoals, 'source'>) {
  return request<any>('/nutrition/goals', { method: 'PUT', body: JSON.stringify(body) });
}
export function autoCalculateNutritionGoals() {
  return request<any>('/nutrition/goals/auto', { method: 'POST' });
}
export function getNutritionToday() {
  return request<NutritionToday>('/nutrition/today');
}
export function addFoodLog(body: {
  mealType: string;
  name: string;
  kcal: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  servings?: number;
}) {
  return request<FoodLogItem>('/nutrition/log', { method: 'POST', body: JSON.stringify(body) });
}
export function deleteFoodLog(id: string) {
  return request<{ ok: boolean }>(`/nutrition/log/${id}`, { method: 'DELETE' });
}
export function getQuickFoods() {
  return request<QuickFood[]>('/nutrition/quick-foods');
}

// ── Habits (Section G) ──
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

export function getHabitsToday() {
  return request<DailyCheckIn>('/habits/today');
}
export function updateHabitsToday(body: Partial<DailyCheckIn>) {
  return request<DailyCheckIn>('/habits/today', { method: 'PUT', body: JSON.stringify(body) });
}
export function getHabitsHistory(days = 30) {
  return request<DailyCheckIn[]>(`/habits/history?days=${days}`);
}
export function getHabitsStats() {
  return request<HabitsStats>('/habits/stats');
}

// ── AI Insights (Section H) ──
export interface RecoveryTip {
  category: 'sleep' | 'nutrition' | 'recovery' | 'stress' | 'training';
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
}
export interface WeeklyReview {
  summary: string;
  highlights: string[];
  improvements: string[];
  nextWeekFocus: string;
}

export function getRecoveryTips() {
  return request<{ tips: RecoveryTip[]; cached: boolean }>('/ai-insights/recovery-tips');
}
export function getWeeklyReview() {
  return request<{ review: WeeklyReview; cached: boolean }>('/ai-insights/weekly-review');
}

// ── Achievements (Section J) ──
export interface Achievement {
  id: string;
  code: string;
  title: string;
  titleCs: string;
  description: string;
  descriptionCs: string;
  category: string;
  icon: string;
  xpReward: number;
  threshold: number | null;
  unlocked: boolean;
  unlockedAt: string | null;
}

export function getAchievements() {
  return request<Achievement[]>('/achievements');
}
export function checkAchievements() {
  return request<{ newlyUnlocked: any[]; total: number }>('/achievements/check', { method: 'POST' });
}
export function unlockAchievement(code: string) {
  return request<any>('/achievements/unlock', { method: 'POST', body: JSON.stringify({ code }) });
}

// ── AI Nutrition Tips ──
export interface NutritionTip {
  category: 'protein' | 'hydration' | 'timing' | 'macros' | 'quality';
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
}
export function getNutritionTips() {
  return request<{ tips: NutritionTip[]; cached: boolean }>('/ai-insights/nutrition-tips');
}

// ── AI Coach Daily Brief (flagship) ──
export type DailyBriefMood = 'push' | 'maintain' | 'recover';
export type RecoveryStatus = 'fresh' | 'normal' | 'fatigued' | 'overreached';

export interface DailyBriefExercise {
  name: string;
  nameCs: string;
  sets: number;
  reps: string;
  weightKg: number | null;
  rpe: number;
  restSeconds: number;
  rationale: string;
}

export interface DailyBriefWorkout {
  title: string;
  estimatedMinutes: number;
  warmup: string;
  exercises: DailyBriefExercise[];
  finisher?: string;
}

export interface DailyBrief {
  date: string;
  greeting: string;
  headline: string;
  mood: DailyBriefMood;
  recoveryStatus: RecoveryStatus;
  recoveryScore: number;
  workout: DailyBriefWorkout;
  rationale: string;
  motivationalHook: string;
  nutritionTip: string;
  alternativeIfTired: string;
  source: 'claude' | 'rules';
}

export function getDailyBrief() {
  return request<{ brief: DailyBrief; cached: boolean }>('/ai-insights/daily-brief');
}

// ── Section K: Body Progress Photos ──
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
  return request<{ uploadUrl: string; photoId: string; s3Key: string }>(
    '/progress-photos/upload-url',
    { method: 'POST', body: JSON.stringify(opts) },
  );
}

export function analyzeProgressPhoto(id: string) {
  return request<BodyPhotoAnalysis>(`/progress-photos/${id}/analyze`, { method: 'POST' });
}

export function deleteProgressPhoto(id: string) {
  return request<{ deleted: true }>(`/progress-photos/${id}`, { method: 'DELETE' });
}

// ── Section L: Generative Meal Planning ──
export interface MealPlanMeal {
  type: 'breakfast' | 'snack' | 'lunch' | 'dinner';
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients: string[];
  prepMinutes: number;
  notes?: string;
}

export interface MealPlanDay {
  date: string;
  dayName: string;
  totals: { kcal: number; proteinG: number; carbsG: number; fatG: number };
  meals: MealPlanMeal[];
}

export interface ShoppingListCategory {
  category: string;
  items: { name: string; qty: number; unit: string }[];
}

export interface MealPlanPayload {
  weekStart: string;
  totalKcal: number;
  avgKcalPerDay: number;
  avgProteinG: number;
  days: MealPlanDay[];
  shoppingList: ShoppingListCategory[];
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: string;
  generatedAt: string;
  source: 'claude' | 'rules';
  modelUsed: string;
  payload: MealPlanPayload;
  notes: string | null;
}

export function getCurrentMealPlan() {
  return request<MealPlan | null>('/nutrition/meal-plan/current');
}

export function getMealPlanHistory(limit = 8) {
  return request<MealPlan[]>(`/nutrition/meal-plan/history?limit=${limit}`);
}

export function generateMealPlan(opts: {
  weekStart?: string;
  preferences?: string;
  allergies?: string[];
  cuisine?: string;
} = {}) {
  return request<MealPlan>('/nutrition/meal-plan/generate', {
    method: 'POST',
    body: JSON.stringify(opts),
  });
}

export function deleteMealPlan(id: string) {
  return request<{ deleted: boolean }>(`/nutrition/meal-plan/${id}`, { method: 'DELETE' });
}
