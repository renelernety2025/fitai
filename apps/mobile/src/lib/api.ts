import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://fitai.bfevents.cz';
const API_URL = `${API_BASE}/api`;
const TOKEN_KEY = 'fitai_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401) await removeToken();
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────
export function authLogin(email: string, password: string) {
  return request<{ user: any; accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
export function authRegister(data: { email: string; password: string; name: string; level?: string }) {
  return request<{ user: any; accessToken: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
export function authMe() {
  return request<any>('/auth/me');
}

// ── Videos ────────────────────────────────────────
export function getVideos() { return request<any[]>('/videos'); }
export function getVideo(id: string) { return request<any>(`/videos/${id}`); }

// ── Exercises ─────────────────────────────────────
export function getExercises(params?: { muscleGroup?: string }) {
  const q = params?.muscleGroup ? `?muscleGroup=${params.muscleGroup}` : '';
  return request<any[]>(`/exercises${q}`);
}
export function getExercise(id: string) { return request<any>(`/exercises/${id}`); }

// ── Plans ─────────────────────────────────────────
export function getWorkoutPlans() { return request<any[]>('/workout-plans'); }
export function getWorkoutPlan(id: string) { return request<any>(`/workout-plans/${id}`); }

// ── Sessions ──────────────────────────────────────
export function startSession(videoId: string) {
  return request<any>('/sessions/start', { method: 'POST', body: JSON.stringify({ videoId }) });
}
export function startGymSession(data: any) {
  return request<any>('/gym-sessions/start', { method: 'POST', body: JSON.stringify(data) });
}
export function getGymSession(id: string) { return request<any>(`/gym-sessions/${id}`); }
export function completeGymSet(sessionId: string, data: any) {
  return request<any>(`/gym-sessions/${sessionId}/set/complete`, { method: 'POST', body: JSON.stringify(data) });
}
export function endGymSession(sessionId: string) {
  return request<any>(`/gym-sessions/${sessionId}/end`, { method: 'POST' });
}
export function getMyGymSessions() { return request<any[]>('/gym-sessions/my'); }
export function getWeeklyVolume() { return request<any>('/gym-sessions/my/weekly-volume'); }

// ── Progress ──────────────────────────────────────
export function getMyStats() { return request<any>('/sessions/my/stats'); }
export function getReminderStatus() { return request<any>('/users/me/reminder-status'); }

// ── Social ────────────────────────────────────────
export function getSocialFeed() { return request<any[]>('/social/feed'); }
export function getChallenges() { return request<any[]>('/social/challenges'); }
export function joinChallenge(id: string) { return request<any>(`/social/challenges/${id}/join`, { method: 'POST' }); }
export function searchUsers(q: string) { return request<any[]>(`/social/search?q=${encodeURIComponent(q)}`); }
export function followUser(id: string) { return request<any>(`/social/follow/${id}`, { method: 'POST' }); }
export function getFollowCounts() { return request<{ following: number; followers: number }>('/social/follow-counts'); }

// ── AI Planner ────────────────────────────────────
export function getFitnessProfile() { return request<any>('/ai-planner/profile'); }
export function updateFitnessProfile(data: any) {
  return request<any>('/ai-planner/profile', { method: 'PUT', body: JSON.stringify(data) });
}
export function generateAIPlan() { return request<any>('/ai-planner/generate', { method: 'POST' }); }
export function getBreakRecovery() { return request<any>('/ai-planner/break-recovery'); }
export function getAsymmetryReport() { return request<any>('/ai-planner/asymmetry'); }

// ── Onboarding ────────────────────────────────────
export function getOnboardingStatus() { return request<any>('/onboarding/status'); }
export function getOnboardingTestExercises() { return request<any[]>('/onboarding/test-exercises'); }
export function saveOnboardingMeasurements(data: { age: number; weightKg: number; heightCm: number }) {
  return request<any>('/onboarding/measurements', { method: 'POST', body: JSON.stringify(data) });
}
export function submitFitnessTest(results: any[]) {
  return request<any>('/onboarding/fitness-test', { method: 'POST', body: JSON.stringify({ results }) });
}
export function getSuggestedWeights() { return request<any[]>('/onboarding/suggested-weights'); }
export function completeOnboarding() { return request<any>('/onboarding/complete', { method: 'POST' }); }

// ── Intelligence ──────────────────────────────────
export function getInsights() {
  return Promise.all([
    request<any>('/intelligence/recovery').catch(() => null),
    request<any[]>('/intelligence/plateaus').catch(() => []),
    request<any>('/intelligence/weak-points').catch(() => ({ weakMuscleGroups: [] })),
  ]).then(([recovery, plateaus, weakPoints]) => ({ recovery, plateaus, weakPoints }));
}

// ── Education (Section D) ─────────────────────────
export function getLessons(category?: string) {
  const q = category ? `?category=${category}` : '';
  return request<any[]>(`/education/lessons${q}`);
}
export function getLesson(slug: string) { return request<any>(`/education/lessons/${slug}`); }
export function getLessonOfTheWeek() { return request<any>('/education/lessons/of-the-week'); }
export function getGlossary(query?: string) {
  const q = query ? `?q=${encodeURIComponent(query)}` : '';
  return request<any[]>(`/education/glossary${q}`);
}

// ── Home Training (Section E) ─────────────────────
export function getQuickWorkout() { return request<any>('/home-training/quick'); }
export function getHomeWorkout() { return request<any>('/home-training/home'); }
export function getTravelWorkout() { return request<any>('/home-training/travel'); }

// ── Nutrition (Section F) ─────────────────────────
export function getNutritionGoals() { return request<any>('/nutrition/goals'); }
export function setNutritionGoals(body: any) {
  return request<any>('/nutrition/goals', { method: 'PUT', body: JSON.stringify(body) });
}
export function autoCalculateNutritionGoals() {
  return request<any>('/nutrition/goals/auto', { method: 'POST' });
}
export function getNutritionToday() { return request<any>('/nutrition/today'); }
export function addFoodLog(body: any) {
  return request<any>('/nutrition/log', { method: 'POST', body: JSON.stringify(body) });
}
export function deleteFoodLog(id: string) {
  return request<any>(`/nutrition/log/${id}`, { method: 'DELETE' });
}
export function getQuickFoods() { return request<any[]>('/nutrition/quick-foods'); }

// ── Habits (Section G) ──
export function getHabitsToday() { return request<any>('/habits/today'); }
export function updateHabitsToday(body: any) {
  return request<any>('/habits/today', { method: 'PUT', body: JSON.stringify(body) });
}
export function getHabitsHistory(days = 30) { return request<any[]>(`/habits/history?days=${days}`); }
export function getHabitsStats() { return request<any>('/habits/stats'); }

// ── Push notifications ──
export function registerExpoPushToken(token: string) {
  return request<any>('/notifications/expo-subscribe', { method: 'POST', body: JSON.stringify({ token }) });
}
export function testPushNotification() {
  return request<any>('/notifications/test', { method: 'POST' });
}
