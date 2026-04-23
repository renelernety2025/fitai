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

export interface PersonalBest {
  hasPR: boolean;
  bestWeight?: number;
  bestReps?: number;
  avgFormScore?: number;
  totalVolume?: number;
}

export function getExercisePersonalBest(id: string) {
  return request<PersonalBest>(`/exercises/${id}/personal-best`);
}

export interface MicroWorkoutData {
  title: string;
  durationMinutes: number;
  exercises: (ExerciseData & { targetReps: number; targetSets: number; restSeconds: number })[];
}

export function getMicroWorkout() {
  return request<MicroWorkoutData>('/exercises/micro-workout');
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
      notes?: string;
      groupId?: string | null;
      groupType?: string | null;
      groupOrder?: number | null;
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

export function updateWorkoutPlan(id: string, data: Record<string, unknown>) {
  return request<WorkoutPlanData>(`/workout-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
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

export function getMyGymSessions() {
  return request<GymSessionData[]>('/gym-sessions/my');
}

// Notification preferences
export interface NotificationPrefs {
  workoutReminder: boolean;
  streakWarning: boolean;
  achievements: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
}

export function getNotificationPrefs() {
  return request<NotificationPrefs>('/notifications/preferences');
}

export function updateNotificationPrefs(data: Partial<NotificationPrefs>) {
  return request<NotificationPrefs>('/notifications/preferences', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
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

export function createChallenge(data: {
  name: string;
  description?: string;
  type: string;
  targetValue: number;
  durationDays: number;
}): Promise<ChallengeData> {
  return request('/social/challenges', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getChallengeDetail(id: string): Promise<
  ChallengeData & {
    creator: { id: string; name: string; avatarUrl: string | null } | null;
    daysRemaining: number;
    isExpired: boolean;
  }
> {
  return request(`/social/challenges/${id}`);
}

export function inviteToChallenge(
  challengeId: string,
  userId: string,
): Promise<{ ok: boolean }> {
  return request(`/social/challenges/${challengeId}/invite`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
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

export function getDailyMotivation() {
  return request<{ message: string; source: string }>('/ai-insights/motivation');
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

// ─── AI Chat Coach ──────────────────────────────────────

export interface ChatConversation {
  id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export function getChatConversations(): Promise<{ conversations: ChatConversation[] }> {
  return request('/coaching/conversations');
}

export function getChatMessages(conversationId: string): Promise<{ messages: ChatMessage[] }> {
  return request(`/coaching/conversations/${conversationId}/messages`);
}

export async function sendChatMessage(
  message: string,
  conversationId: string | null,
  onDelta: (text: string) => void,
  onConversationId: (id: string) => void,
): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fitai_token') : null;
  const body: Record<string, string> = { message };
  if (conversationId) body.conversationId = conversationId;

  const res = await fetch(`${API_URL}/coaching/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.type === 'text_delta') onDelta(event.delta);
        if (event.type === 'conversation_id') onConversationId(event.id);
      } catch {
        /* ignore parse errors from partial SSE chunks */
      }
    }
  }
}

// ─── Today Action (Smart Widget) ────────────────────────

export interface TodayAction {
  type: 'streak' | 'recovery' | 'comeback' | 'nutrition' | 'default';
  headline: string;
  rationale: string;
  ctaLabel: string;
  ctaLink: string;
}

export function getTodayAction(): Promise<TodayAction> {
  return request('/ai-insights/today-action');
}

// ─── Workout Journal ────────────────────────────────────

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

export function getJournalMonth(month: string) {
  return request<{ days: JournalDay[] }>(`/journal?month=${month}`);
}

export function upsertJournalEntry(date: string, body: Record<string, unknown>) {
  return request<JournalEntry>(`/journal/${date}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function getJournalPhotoUrl(date: string, contentType: string) {
  return request<{ uploadUrl: string; photoId: string; s3Key: string }>(
    `/journal/${date}/photo-url`,
    { method: 'POST', body: JSON.stringify({ contentType }) },
  );
}

export function deleteJournalPhoto(photoId: string) {
  return request<{ deleted: boolean }>(`/journal/photo/${photoId}`, {
    method: 'DELETE',
  });
}

export function getJournalMonthlySummary(month: string) {
  return request<MonthlySummary>(
    `/journal/monthly-summary?month=${month}`,
  );
}

export function getJournalMilestones() {
  return request<{ milestones: Milestone[] }>('/journal/milestones');
}

export function generateJournalInsight(date: string) {
  return request<{ insight: string }>(`/journal/${date}/ai-insight`, {
    method: 'POST',
  });
}

// ─── Recipes ────────────────────────────────────────────

export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  ingredients: Array<{ name: string; amount: string; unit: string }>;
  instructions: string | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  servings: number;
  kcalPerServing: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  photoS3Key: string | null;
  tags: string[];
  isFavorite: boolean;
}

export function getRecipes(): Promise<Recipe[]> {
  return request('/recipes');
}

export function createRecipe(data: Partial<Recipe>): Promise<Recipe> {
  return request('/recipes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateRecipe(
  id: string,
  data: Partial<Recipe>,
): Promise<Recipe> {
  return request(`/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteRecipe(id: string): Promise<void> {
  return request(`/recipes/${id}`, { method: 'DELETE' });
}

export function toggleRecipeFavorite(id: string): Promise<void> {
  return request(`/recipes/${id}/favorite`, { method: 'POST' });
}

export function generateRecipeFromPhoto(
  s3Key: string,
): Promise<Partial<Recipe>> {
  return request('/recipes/from-photo', {
    method: 'POST',
    body: JSON.stringify({ s3Key }),
  });
}

// ─── Food Photo Recognition ─────────────────────────────

export interface FoodPhotoAnalysis {
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients?: string;
  confidence?: number;
}

export function getFoodPhotoUploadUrl(): Promise<{
  uploadUrl: string;
  s3Key: string;
}> {
  return request('/nutrition/photo-upload-url', { method: 'POST' });
}

export function analyzeFoodPhoto(
  s3Key: string,
): Promise<FoodPhotoAnalysis> {
  return request('/nutrition/analyze-photo', {
    method: 'POST',
    body: JSON.stringify({ s3Key }),
  });
}

// ─── Data Export ───────────────────────────────────────

/** Download a file from the export API and trigger browser save dialog. */
// ─── Wrapped ──────────────────────────────────────────

export function getWrapped(period: string, month?: string) {
  const q = month ? `?period=${period}&month=${month}` : `?period=${period}`;
  return request<any>(`/wrapped${q}`);
}

// ─── Leagues ──────────────────────────────────────────

export function getLeagueCurrent() {
  return request<any>('/leagues/current');
}

export function joinLeague() {
  return request<any>('/leagues/join', { method: 'POST' });
}

// ─── Skill Tree ───────────────────────────────────────

export function getSkillTree() {
  return request<any>('/skill-tree');
}

export function checkSkillTree() {
  return request<any>('/skill-tree/check', { method: 'POST' });
}

// ─── Workout Calendar ─────────────────────────────────

export function getCalendarMonth(month: string) {
  return request<any>(`/calendar?month=${month}`);
}

export function scheduleWorkout(data: Record<string, unknown>) {
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
  return request<void>(`/calendar/${id}`, { method: 'DELETE' });
}

// ─── Seasons / Battle Pass ────────────────────────────

export function getCurrentSeason() {
  return request<any>('/seasons/current');
}

export function joinSeason() {
  return request<any>('/seasons/join', { method: 'POST' });
}

export function checkSeasonMissions() {
  return request<any>('/seasons/check-missions', { method: 'POST' });
}

// ─── Data Export ───────────────────────────────────────

/** Download a file from the export API and trigger browser save dialog. */
// ─── Body Portfolio ─────────────────────────────────────

export function getBodyPortfolio(): Promise<any> {
  return request('/body-portfolio');
}

// ─── Bloodwork Tracker ──────────────────────────────────

export function getBloodwork(): Promise<any[]> {
  return request('/bloodwork');
}

export function addBloodwork(data: any): Promise<any> {
  return request('/bloodwork', { method: 'POST', body: JSON.stringify(data) });
}

export function deleteBloodwork(id: string): Promise<void> {
  return request(`/bloodwork/${id}`, { method: 'DELETE' });
}

export function getBloodworkAnalysis(): Promise<any> {
  return request('/bloodwork/analysis');
}

// ─── Rehab ──────────────────────────────────────────────

export function getRehabPlans(): Promise<any[]> {
  return request('/rehab');
}

export function createRehabPlan(data: any): Promise<any> {
  return request('/rehab', { method: 'POST', body: JSON.stringify(data) });
}

export function logRehabSession(planId: string, data: any): Promise<any> {
  return request(`/rehab/${planId}/session`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getRehabSessions(planId: string): Promise<any[]> {
  return request(`/rehab/${planId}/sessions`);
}

// ─── Streak Freeze ──────────────────────────────────────

export function getStreakFreezeStatus(): Promise<any> {
  return request('/streak-freeze/status');
}

export function useStreakFreeze(): Promise<any> {
  return request('/streak-freeze/use', { method: 'POST' });
}

// ─── Marketplace ────────────────────────────────────────

export function getMarketplace(
  params?: string,
): Promise<any[]> {
  return request(`/marketplace${params ? `?${params}` : ''}`);
}

export function getMarketplaceListing(id: string): Promise<any> {
  return request(`/marketplace/${id}`);
}

export function createListing(data: any): Promise<any> {
  return request('/marketplace', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function purchaseListing(id: string): Promise<any> {
  return request(`/marketplace/${id}/purchase`, { method: 'POST' });
}

export function rateListing(
  id: string,
  rating: number,
): Promise<any> {
  return request(`/marketplace/${id}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating }),
  });
}

// ─── Boss Fights ────────────────────────────────────────

export function getBossFights(): Promise<any> {
  return request('/boss-fights');
}

export function startBoss(code: string): Promise<any> {
  return request(`/boss-fights/${code}/start`, { method: 'POST' });
}

export function completeBoss(
  code: string,
  data: any,
): Promise<any> {
  return request(`/boss-fights/${code}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Discover Weekly ────────────────────────────────────

export function getDiscoverWeekly(): Promise<any> {
  return request('/discover-weekly');
}

// ─── Recommendations ────────────────────────────────────

export function getRecommendations(): Promise<any> {
  return request('/recommendations');
}

// ─── Gym Finder ─────────────────────────────────────────

export function getGymReviews(): Promise<any[]> {
  return request('/gym-finder');
}

export function addGymReview(data: any): Promise<any> {
  return request('/gym-finder', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getNearbyGyms(
  lat: number,
  lng: number,
): Promise<any[]> {
  return request(`/gym-finder/nearby?lat=${lat}&lng=${lng}`);
}

// ─── Data Export ───────────────────────────────────────

export async function downloadExport(
  path: string,
  filename: string,
): Promise<void> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('fitai_token')
      : null;
  const res = await fetch(`${API_URL}/${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Social: Stories ---
export function getStories(): Promise<any[]> {
  return request('/social/stories');
}
export function createStory(data: any): Promise<any> {
  return request('/social/stories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
export function viewStory(id: string): Promise<void> {
  return request(`/social/stories/${id}/view`, { method: 'POST' });
}

// --- Social: Reactions ---
export function addReaction(
  targetType: string,
  targetId: string,
  emoji: string,
): Promise<any> {
  return request('/social/react', {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId, emoji }),
  });
}
export function removeReaction(id: string): Promise<void> {
  return request(`/social/react/${id}`, { method: 'DELETE' });
}
export function getReactions(
  targetType: string,
  targetId: string,
): Promise<any[]> {
  return request(`/social/reactions/${targetType}/${targetId}`);
}

// --- Social: Comments ---
export function addComment(
  feedItemId: string,
  content: string,
): Promise<any> {
  return request('/social/comments', {
    method: 'POST',
    body: JSON.stringify({ feedItemId, content }),
  });
}
export function getComments(feedItemId: string): Promise<any[]> {
  return request(`/social/comments/${feedItemId}`);
}
export function deleteComment(id: string): Promise<void> {
  return request(`/social/comments/${id}`, { method: 'DELETE' });
}

// --- Social: Props ---
export function giveProps(
  toUserId: string,
  reason?: string,
): Promise<any> {
  return request('/social/props', {
    method: 'POST',
    body: JSON.stringify({ toUserId, reason }),
  });
}
export function getReceivedProps(): Promise<any[]> {
  return request('/social/props/received');
}

// --- Social: Flash Challenge ---
export function getActiveFlash(): Promise<any> {
  return request('/social/flash-challenge/active');
}
export function joinFlash(id: string): Promise<any> {
  return request(`/social/flash-challenge/${id}/join`, {
    method: 'POST',
  });
}

// --- Social: Share ---
export function shareToFeed(
  type: string,
  referenceId: string,
): Promise<any> {
  return request('/social/share', {
    method: 'POST',
    body: JSON.stringify({ type, referenceId }),
  });
}

// --- Social: Public Profile ---
export function getPublicProfile(id: string): Promise<any> {
  return request(`/social/profile/${id}`);
}
export function updateBio(bio: string): Promise<any> {
  return request('/social/profile/bio', {
    method: 'PUT',
    body: JSON.stringify({ bio }),
  });
}

// --- Buddy ---
export function getBuddyCards(): Promise<any[]> {
  return request('/buddy/cards');
}
export function upsertBuddyProfile(data: any): Promise<any> {
  return request('/buddy/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
export function getBuddyProfile(): Promise<any> {
  return request('/buddy/profile');
}
export function swipeBuddy(
  targetId: string,
  direction: string,
): Promise<any> {
  return request('/buddy/swipe', {
    method: 'POST',
    body: JSON.stringify({ targetId, direction }),
  });
}
export function getBuddyMatches(): Promise<any[]> {
  return request('/buddy/matches');
}

// --- Messages ---
export function getConversations(): Promise<any[]> {
  return request('/messages/conversations');
}
export function getMessages(conversationId: string): Promise<any[]> {
  return request(`/messages/${conversationId}`);
}
export function sendDirectMessage(
  conversationId: string,
  content: string,
): Promise<any> {
  return request(`/messages/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
export function startConversation(userId: string): Promise<any> {
  return request(`/messages/start/${userId}`, { method: 'POST' });
}

// ══════════════════════════════════════════════
// Cross-Industry Features (Phases 1-5)
// ══════════════════════════════════════════════

// --- Duels ---
export function challengeDuel(data: { challengedId: string; type: string; metric: string; duration: string; xpBet: number }): Promise<any> {
  return request('/duels/challenge', { method: 'POST', body: JSON.stringify(data) });
}
export function acceptDuel(id: string): Promise<any> {
  return request(`/duels/${id}/accept`, { method: 'POST' });
}
export function declineDuel(id: string): Promise<any> {
  return request(`/duels/${id}/decline`, { method: 'POST' });
}
export function submitDuelScore(id: string, score: number): Promise<any> {
  return request(`/duels/${id}/score`, { method: 'POST', body: JSON.stringify({ score }) });
}
export function getActiveDuels(): Promise<any[]> {
  return request('/duels/active');
}
export function getDuelHistory(): Promise<any[]> {
  return request('/duels/history');
}

// --- Squads ---
export function createSquad(data: { name: string; motto?: string }): Promise<any> {
  return request('/squads', { method: 'POST', body: JSON.stringify(data) });
}
export function getMySquad(): Promise<any> {
  return request('/squads/mine');
}
export function inviteToSquad(squadId: string, userId: string): Promise<any> {
  return request(`/squads/${squadId}/invite`, { method: 'POST', body: JSON.stringify({ userId }) });
}
export function getSquadDetail(id: string): Promise<any> {
  return request(`/squads/${id}`);
}
export function getSquadLeaderboard(): Promise<any[]> {
  return request('/squads/leaderboard');
}
export function leaveSquad(id: string): Promise<any> {
  return request(`/squads/${id}/leave`, { method: 'DELETE' });
}

// --- Supplements ---
export function getSupplementCatalog(): Promise<any[]> {
  return request('/supplements/catalog');
}
export function getMyStack(): Promise<any[]> {
  return request('/supplements/stack');
}
export function addToStack(data: { supplementId: string; dosage: string; timing: string; monthlyCostKc?: number }): Promise<any> {
  return request('/supplements/stack', { method: 'POST', body: JSON.stringify(data) });
}
export function removeFromStack(id: string): Promise<any> {
  return request(`/supplements/stack/${id}`, { method: 'DELETE' });
}
export function logSupplement(userSupplementId: string): Promise<any> {
  return request('/supplements/log', { method: 'POST', body: JSON.stringify({ userSupplementId }) });
}
export function getSupplementLog(date: string): Promise<any[]> {
  return request(`/supplements/log/${date}`);
}

// --- Gear ---
export function getMyGear(): Promise<any[]> {
  return request('/gear');
}
export function addGearItem(data: { category: string; brand: string; model: string; purchaseDate?: string; priceKc?: number; maxSessions?: number }): Promise<any> {
  return request('/gear', { method: 'POST', body: JSON.stringify(data) });
}
export function updateGearItem(id: string, data: any): Promise<any> {
  return request(`/gear/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export function deleteGearItem(id: string): Promise<any> {
  return request(`/gear/${id}`, { method: 'DELETE' });
}
export function reviewGear(id: string, data: { rating: number; text?: string }): Promise<any> {
  return request(`/gear/${id}/review`, { method: 'POST', body: JSON.stringify(data) });
}

// --- Maintenance ---
export function getMaintenanceStatus(): Promise<any[]> {
  return request('/maintenance');
}
export function getMaintenanceAlerts(): Promise<any[]> {
  return request('/maintenance/alerts');
}
export function markDeload(muscleGroup: string): Promise<any> {
  return request(`/maintenance/${muscleGroup}/deload`, { method: 'POST' });
}
export function dismissAlert(id: string): Promise<any> {
  return request(`/maintenance/alerts/${id}/dismiss`, { method: 'POST' });
}
export function getBodyMileage(): Promise<any> {
  return request('/maintenance/mileage');
}

// --- Coaching Memory ---
export function getCoachingMemories(page = 1, limit = 20): Promise<any> {
  return request(`/coaching-memory?page=${page}&limit=${limit}`);
}
export function searchCoachingMemory(q: string): Promise<any[]> {
  return request(`/coaching-memory/search?q=${encodeURIComponent(q)}`);
}
export function getCoachingProgress(exerciseId: string): Promise<any[]> {
  return request(`/coaching-memory/progress/${exerciseId}`);
}
export function saveCoachingMemory(data: { exerciseId?: string; insight: string; category: string; metricBefore?: number; metricAfter?: number }): Promise<any> {
  return request('/coaching-memory', { method: 'POST', body: JSON.stringify(data) });
}

// --- Personal Records ---
export interface PersonalRecord { exerciseId: string; exerciseName: string; category: string; bestWeight: number; bestReps: number; date: string; deltaWeight: number | null; deltaReps: number | null }
export function getPersonalRecords(): Promise<PersonalRecord[]> {
  return request('/records');
}
export function getExerciseRecords(exerciseId: string): Promise<any> {
  return request(`/records/${exerciseId}`);
}
export function getSectorTimes(exerciseSetId: string): Promise<any> {
  return request(`/records/sectors/${exerciseSetId}`);
}

// --- Clips ---
export function getClipUploadUrl(data: { fileName: string; contentType: string }): Promise<any> {
  return request('/clips/upload-url', { method: 'POST', body: JSON.stringify(data) });
}
export function getClipsFeed(page = 1, limit = 10): Promise<any[]> {
  return request(`/clips/feed?page=${page}&limit=${limit}`);
}
export function getClipDetail(id: string): Promise<any> {
  return request(`/clips/${id}`);
}
export function createClip(data: { s3Key: string; durationSeconds: number; exerciseId?: string; tags?: string[]; caption?: string }): Promise<any> {
  return request('/clips', { method: 'POST', body: JSON.stringify(data) });
}
export function toggleClipLike(id: string): Promise<any> {
  return request(`/clips/${id}/like`, { method: 'POST' });
}
export function commentOnClip(id: string, text: string): Promise<any> {
  return request(`/clips/${id}/comment`, { method: 'POST', body: JSON.stringify({ text }) });
}
export function deleteClip(id: string): Promise<any> {
  return request(`/clips/${id}`, { method: 'DELETE' });
}

// --- Experiences ---
export function getExperiences(params?: { category?: string; difficulty?: string; search?: string }): Promise<any[]> {
  const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return request(`/experiences${qs ? `?${qs}` : ''}`);
}
export function getExperienceDetail(id: string): Promise<any> {
  return request(`/experiences/${id}`);
}
export function createExperience(data: any): Promise<any> {
  return request('/experiences', { method: 'POST', body: JSON.stringify(data) });
}
export function bookExperience(id: string): Promise<any> {
  return request(`/experiences/${id}/book`, { method: 'POST' });
}
export function cancelBooking(id: string): Promise<any> {
  return request(`/experiences/bookings/${id}/cancel`, { method: 'POST' });
}
export function checkinBooking(id: string): Promise<any> {
  return request(`/experiences/bookings/${id}/checkin`, { method: 'POST' });
}
export function reviewBooking(id: string, data: { rating: number; reviewText?: string }): Promise<any> {
  return request(`/experiences/bookings/${id}/review`, { method: 'POST', body: JSON.stringify(data) });
}
export function getMyBookings(): Promise<any[]> {
  return request('/experiences/my-bookings');
}

// --- Trainers ---
export interface Trainer { id: string; userId: string; bio: string; supertrainer: boolean; responseRate: number; totalSessions: number; isVerified: boolean; specializations: string[]; certifications: string[]; user: { name: string; avatarUrl?: string }; _count?: { reviews: number }; avgRating?: number }
export interface TrainerDetail extends Trainer { reviews: any[]; experiences: any[] }
export function getTrainers(search?: string): Promise<Trainer[]> {
  return request(`/trainers${search ? `?search=${encodeURIComponent(search)}` : ''}`);
}
export function getTrainerDetail(id: string): Promise<TrainerDetail> {
  return request(`/trainers/${id}`);
}
export function applyAsTrainer(data: { bio: string; certifications: string[]; specializations: string[] }): Promise<any> {
  return request('/trainers/apply', { method: 'POST', body: JSON.stringify(data) });
}
export function updateTrainerProfile(data: any): Promise<any> {
  return request('/trainers/profile', { method: 'PATCH', body: JSON.stringify(data) });
}

// --- Routine Builder ---
export interface Routine { id: string; name: string; isPublic: boolean; items: RoutineItem[] }
export interface RoutineItem { id: string; type: string; timing: string; referenceName: string; notes?: string; sortOrder: number }
export function getMyRoutines(): Promise<Routine[]> {
  return request('/routines/mine');
}
export function createRoutine(data: { name: string; isPublic?: boolean }): Promise<any> {
  return request('/routines', { method: 'POST', body: JSON.stringify(data) });
}
export function deleteRoutine(id: string): Promise<any> {
  return request(`/routines/${id}`, { method: 'DELETE' });
}
export function addRoutineItem(routineId: string, data: any): Promise<any> {
  return request(`/routines/${routineId}/items`, { method: 'POST', body: JSON.stringify(data) });
}
export function removeRoutineItem(routineId: string, itemId: string): Promise<any> {
  return request(`/routines/${routineId}/items/${itemId}`, { method: 'DELETE' });
}
export function getPublicRoutines(): Promise<Routine[]> {
  return request('/routines/public');
}

// --- Limited Drops ---
export function getDrops(): Promise<any[]> {
  return request('/drops');
}
export function getDropDetail(id: string): Promise<any> {
  return request(`/drops/${id}`);
}
export function purchaseDrop(id: string): Promise<any> {
  return request(`/drops/${id}/purchase`, { method: 'POST' });
}
export function getMyDropPurchases(): Promise<any[]> {
  return request('/drops/my-purchases');
}

// --- VIP ---
export interface VIPStatus { id: string; tier: string; invitedAt: string; privileges: string[] }
export interface VIPEligibility { eligible: boolean; xpRank: number; totalUsers: number; streak: number; avgForm: number }
export function getVIPStatus(): Promise<VIPStatus | null> {
  return request('/vip/status');
}
export function acceptVIP(): Promise<any> {
  return request('/vip/accept', { method: 'POST' });
}
export function checkVIPEligibility(): Promise<VIPEligibility> {
  return request('/vip/check-eligibility');
}

// --- Wishlist ---
export interface WishlistItem { id: string; itemType: string; itemId: string; addedAt: string }
export function getWishlist(): Promise<WishlistItem[]> {
  return request('/wishlist');
}
export function addToWishlist(data: { itemType: string; itemId: string }): Promise<any> {
  return request('/wishlist', { method: 'POST', body: JSON.stringify(data) });
}
export function removeFromWishlist(id: string): Promise<any> {
  return request(`/wishlist/${id}`, { method: 'DELETE' });
}
export function getWishlistCount(itemType: string, itemId: string): Promise<number> {
  return request(`/wishlist/count/${itemType}/${itemId}`);
}

// --- Bundles ---
export interface Bundle { id: string; name: string; description?: string; items: any[]; priceXP: number; giftable: boolean; creator: { name: string } }
export function getBundles(): Promise<Bundle[]> {
  return request('/bundles');
}
export function getBundleDetail(id: string): Promise<any> {
  return request(`/bundles/${id}`);
}
export function createBundle(data: any): Promise<any> {
  return request('/bundles', { method: 'POST', body: JSON.stringify(data) });
}
export function purchaseBundle(id: string): Promise<any> {
  return request(`/bundles/${id}/purchase`, { method: 'POST' });
}

// --- User Titles & Brand ---
export function getUserTitles(): Promise<any[]> {
  return request('/users/titles');
}
export function activateTitle(id: string): Promise<any> {
  return request(`/users/titles/${id}/activate`, { method: 'PATCH' });
}
export function getUserBrand(): Promise<any> {
  return request('/users/brand');
}
export function updateUserBrand(data: { colorTheme?: string; avatarConfig?: any; monogram?: string }): Promise<any> {
  return request('/users/brand', { method: 'PATCH', body: JSON.stringify(data) });
}

// --- Playlists ---
export interface PlaylistLink { id: string; title: string; spotifyUrl?: string; appleMusicUrl?: string; bpm?: number; workoutType?: string; user: { name: string } }
export function getPlaylists(params?: { exerciseId?: string; workoutType?: string }): Promise<PlaylistLink[]> {
  const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return request(`/playlists${qs ? `?${qs}` : ''}`);
}
export function addPlaylistLink(data: { exerciseId?: string; workoutType?: string; spotifyUrl?: string; appleMusicUrl?: string; title: string; bpm?: number }): Promise<any> {
  return request('/playlists', { method: 'POST', body: JSON.stringify(data) });
}

// --- Daily Quests ---
export function getDailyQuests(): Promise<any[]> {
  return request('/daily-quests/today');
}
export function completeDailyQuest(id: string): Promise<any> {
  return request(`/daily-quests/${id}/complete`, { method: 'POST' });
}
