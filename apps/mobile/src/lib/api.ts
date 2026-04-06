import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
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
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Auth
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

// Videos & Exercises
export function getVideos() { return request<any[]>('/videos'); }
export function getVideo(id: string) { return request<any>(`/videos/${id}`); }
export function getExercises() { return request<any[]>('/exercises'); }
export function getExercise(id: string) { return request<any>(`/exercises/${id}`); }

// Plans
export function getWorkoutPlans() { return request<any[]>('/workout-plans'); }
export function getWorkoutPlan(id: string) { return request<any>(`/workout-plans/${id}`); }

// Sessions
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

// Progress
export function getMyStats() { return request<any>('/sessions/my/stats'); }
export function getReminderStatus() { return request<any>('/users/me/reminder-status'); }

// Social
export function getSocialFeed() { return request<any[]>('/social/feed'); }
export function getChallenges() { return request<any[]>('/social/challenges'); }
export function searchUsers(q: string) { return request<any[]>(`/social/search?q=${encodeURIComponent(q)}`); }
export function followUser(id: string) { return request<any>(`/social/follow/${id}`, { method: 'POST' }); }

// AI Planner
export function getFitnessProfile() { return request<any>('/ai-planner/profile'); }
export function generateAIPlan() { return request<any>('/ai-planner/generate', { method: 'POST' }); }

// Coaching
export function requestCoachingFeedback(data: any) {
  return request<any>('/coaching/feedback', { method: 'POST', body: JSON.stringify(data) });
}
