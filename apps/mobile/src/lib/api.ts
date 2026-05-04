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
    if (res.status === 401) removeToken(); // fire-and-forget, no await (prevents race with parallel 401s)
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  // HTTP 204 No Content — return empty (DELETE endpoints)
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
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
export function getVideos(query = '') { return request<any[]>(`/videos${query}`); }
export function getVideo(id: string) { return request<any>(`/videos/${id}`); }

// ── Exercises ─────────────────────────────────────
export function getExercises(params?: { muscleGroup?: string }) {
  const q = params?.muscleGroup ? `?muscleGroup=${encodeURIComponent(params.muscleGroup)}` : '';
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
export function getFoodPhotoUploadUrl() {
  return request<{ uploadUrl: string; s3Key: string }>('/nutrition/photo-upload-url', { method: 'POST' });
}
export function analyzeFoodPhoto(s3Key: string) {
  return request<{ name: string; kcal: number; proteinG: number; carbsG: number; fatG: number; confidence: number; note?: string }>(
    '/nutrition/analyze-photo',
    { method: 'POST', body: JSON.stringify({ s3Key }) },
  );
}

// ── Coaching (Voice) ──
export function synthesizeVoice(text: string) {
  return request<{ text: string; audioBase64: string | null; fallbackToWebSpeech: boolean }>(
    '/coaching/tts',
    { method: 'POST', body: JSON.stringify({ text }) },
  );
}

/**
 * Phase E-3: streaming voice Q&A. Opens a POST SSE connection to
 * /api/coaching/ask-stream and invokes handlers as each event arrives.
 *
 * Protocol (see apps/api/src/coaching/coaching.service.ts::StreamEvent):
 *   text_delta  → incremental Claude text (for live subtitle / debug)
 *   text_done   → Claude stream finished, no more text_delta after this
 *   audio_chunk → one PCM 16 kHz int16 mono chunk, base64 encoded
 *   audio_done  → all audio chunks sent, playback will drain naturally
 *   error       → server-side failure; fallback to legacy path
 *
 * Returns a promise that resolves on audio_done / error and rejects
 * on network failures. Uses react-native-sse (pure JS wrapper over
 * XHR), no native linking required.
 */
export interface StreamCoachHandlers {
  onTextDelta?: (delta: string) => void;
  onAudioChunk?: (base64: string) => void;
  onDone?: () => void;
  onError?: (err: unknown) => void;
}

export async function askCoachStream(
  question: string,
  context: { exerciseName?: string; formScore?: number; completedReps?: number },
  handlers: StreamCoachHandlers,
): Promise<void> {
  // Lazy-import so nothing tries to resolve the package on app startup
  // when this path is dormant (Phase E-3 TS skeleton).
  const { default: EventSource } = await import('react-native-sse');

  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return new Promise<void>((resolve, reject) => {
    const es = new EventSource(`${API_URL}/coaching/ask-stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        question,
        exerciseName: context.exerciseName,
        formScore: context.formScore,
        completedReps: context.completedReps,
        audioFormat: 'pcm',
      }),
    });

    const close = () => {
      try { es.close(); } catch { /* ignore */ }
    };

    es.addEventListener('message', (e: any) => {
      if (!e?.data) return;
      let event: any;
      try {
        event = JSON.parse(e.data);
      } catch {
        return; // drop malformed frames
      }
      switch (event.type) {
        case 'text_delta':
          handlers.onTextDelta?.(event.delta);
          break;
        case 'text_done':
          // No-op; we resolve on audio_done to match playback lifecycle.
          break;
        case 'audio_chunk':
          handlers.onAudioChunk?.(event.base64);
          break;
        case 'audio_done':
          handlers.onDone?.();
          close();
          resolve();
          break;
        case 'error':
          handlers.onError?.(new Error(event.message || 'stream error'));
          close();
          reject(new Error(event.message || 'stream error'));
          break;
      }
    });

    es.addEventListener('error', (e: any) => {
      handlers.onError?.(e);
      close();
      reject(e);
    });
  });
}

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

// ── AI Insights (Section H) ──
export function getRecoveryTips() { return request<any>('/ai-insights/recovery-tips'); }
export function getWeeklyReview() { return request<any>('/ai-insights/weekly-review'); }

// ── Achievements (Section J) ──
export function getAchievements() { return request<any[]>('/achievements'); }
export function checkAchievements() { return request<any>('/achievements/check', { method: 'POST' }); }
export function getNutritionTips() { return request<any>('/ai-insights/nutrition-tips'); }
export function getDailyBrief() { return request<any>('/ai-insights/daily-brief'); }

// ── Section K: Body Progress Photos ──
export function getProgressPhotos(side?: 'FRONT'|'SIDE'|'BACK') {
  const q = side ? `?side=${side}` : '';
  return request<any[]>(`/progress-photos${q}`);
}
export function getProgressPhotoStats() { return request<any>('/progress-photos/stats'); }
export function getProgressPhotoUploadUrl(opts: any) {
  return request<{ uploadUrl: string; photoId: string; s3Key: string }>(
    '/progress-photos/upload-url',
    { method: 'POST', body: JSON.stringify(opts) },
  );
}
export function analyzeProgressPhoto(id: string) {
  return request<any>(`/progress-photos/${id}/analyze`, { method: 'POST' });
}
export function deleteProgressPhoto(id: string) {
  return request<{ deleted: true }>(`/progress-photos/${id}`, { method: 'DELETE' });
}

// ── AI Chat ──
export async function sendChatMessage(
  message: string,
  conversationId: string | null,
  onDelta: (text: string) => void,
  onConversationId: (id: string) => void,
): Promise<void> {
  const token = await getToken();
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

// ── Journal ──
export function getJournalMonth(month: string) {
  return request<any>(`/journal?month=${month}`);
}
export function upsertJournalEntry(date: string, body: Record<string, unknown>) {
  return request<any>(`/journal/${date}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
export function generateJournalInsight(date: string) {
  return request<any>(`/journal/${date}/ai-insight`, { method: 'POST' });
}

// ── Calendar ──
export function getCalendarMonth(month: string) {
  return request<any>(`/calendar?month=${month}`);
}
export function scheduleWorkout(data: Record<string, unknown>) {
  return request<any>('/calendar', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
export function deleteScheduledWorkout(id: string) {
  return request<void>(`/calendar/${id}`, { method: 'DELETE' });
}

// ── Leagues ──
export function getLeagueCurrent() {
  return request<any>('/leagues/current');
}
export function joinLeague() {
  return request<any>('/leagues/join', { method: 'POST' });
}

// ── Section L: Generative Meal Planning ──
export function getCurrentMealPlan() { return request<any>('/nutrition/meal-plan/current'); }
export function getMealPlanHistory(limit = 8) { return request<any[]>(`/nutrition/meal-plan/history?limit=${limit}`); }
export function generateMealPlan(opts: any = {}) {
  return request<any>('/nutrition/meal-plan/generate', { method: 'POST', body: JSON.stringify(opts) });
}
export function deleteMealPlan(id: string) {
  return request<{ deleted: boolean }>(`/nutrition/meal-plan/${id}`, { method: 'DELETE' });
}

// ── Duels ──
export function getActiveDuels() { return request<any[]>('/duels/active'); }
export function getDuelHistory() { return request<any[]>('/duels/history'); }
export function submitDuelScore(id: string, score: number) {
  return request<any>(`/duels/${id}/score`, { method: 'POST', body: JSON.stringify({ score }) });
}
export function challengeDuel(data: any) {
  return request<any>('/duels/challenge', { method: 'POST', body: JSON.stringify(data) });
}

// ── Supplements ──
export function getMyStack() { return request<any[]>('/supplements/stack'); }
export function logSupplement(id: string) {
  return request<any>('/supplements/log', { method: 'POST', body: JSON.stringify({ userSupplementId: id }) });
}

// ── Gear ──
export function getMyGear() { return request<any[]>('/gear'); }
export function addGearItem(data: any) {
  return request<any>('/gear', { method: 'POST', body: JSON.stringify(data) });
}

// ── Records ──
export function getPersonalRecords() { return request<any[]>('/records'); }

// ── Drops ──
export function getDrops() { return request<any[]>('/drops'); }
export function purchaseDrop(id: string) {
  return request<any>(`/drops/${id}/purchase`, { method: 'POST' });
}

// ── Experiences ──
export function getExperiences() { return request<any[]>('/experiences'); }
export function bookExperience(id: string) {
  return request<any>(`/experiences/${id}/book`, { method: 'POST' });
}

// ── Clips ──
export function getClipsFeed(page = 1, limit = 10) {
  return request<any[]>(`/clips/feed?page=${page}&limit=${limit}`);
}
export function toggleClipLike(id: string) {
  return request<any>(`/clips/${id}/like`, { method: 'POST' });
}

// ── Trainers ──
export function getTrainers(search?: string) {
  return request<any[]>(`/trainers${search ? `?search=${encodeURIComponent(search)}` : ''}`);
}

// ── Routine Builder ──
export function getMyRoutines() { return request<any[]>('/routines/mine'); }
export function getPublicRoutines() { return request<any[]>('/routines/public'); }

// ── Bundles ──
export function getBundles() { return request<any[]>('/bundles'); }
export function purchaseBundle(id: string) {
  return request<any>(`/bundles/${id}/purchase`, { method: 'POST' });
}

// ── Wishlist ──
export function getWishlist() { return request<any[]>('/wishlist'); }
export function removeFromWishlist(id: string) {
  return request<any>(`/wishlist/${id}`, { method: 'DELETE' });
}

// ── VIP ──
export function getVIPStatus() { return request<any>('/vip/status'); }
export function checkVIPEligibility() { return request<any>('/vip/check-eligibility'); }
export function acceptVIP() { return request<any>('/vip/accept', { method: 'POST' }); }

// ── Squads ──
export function getMySquad() { return request<any>('/squads/mine'); }
export function getSquadLeaderboard() { return request<any[]>('/squads/leaderboard'); }

// ── Maintenance ──
export function getMaintenanceStatus() { return request<any[]>('/maintenance'); }
export function getMaintenanceAlerts() { return request<any[]>('/maintenance/alerts'); }
export function markDeload(muscleGroup: string) {
  return request<any>(`/maintenance/${muscleGroup}/deload`, { method: 'POST' });
}

// ── Coaching Memory ──
export function getCoachingMemories(page = 1, limit = 20) {
  return request<any>(`/coaching-memory?page=${page}&limit=${limit}`);
}

// ── Playlists ──
export function getPlaylists() { return request<any[]>('/playlists'); }
export function addPlaylistLink(data: any) {
  return request<any>('/playlists', { method: 'POST', body: JSON.stringify(data) });
}

// ── Streaks ──
export function getStreakFreezeStatus() { return request<any>('/streak-freeze/status'); }
export function useStreakFreeze() {
  return request<any>('/streak-freeze/use', { method: 'POST' });
}

// ── Form Check ──
export function getFormCheckUploadUrl(data: { fileName: string; contentType: string }) {
  return request<{ uploadUrl: string; s3Key: string }>('/form-check/upload-url', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
export function analyzeForm(data: { s3Key: string; exerciseId: string }) {
  return request<any>('/form-check/analyze', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
export function getFormCheckHistory() { return request<any[]>('/form-check/history'); }

// ── Posts ──
export function getUploadUrls(count: number, contentType = 'image/jpeg') {
  return request<any>('/posts/upload-url', { method: 'POST', body: JSON.stringify({ count, contentType }) });
}
export function createPost(data: { caption?: string; type: string; photoKeys?: string[]; cardData?: any }) {
  return request<any>('/posts', { method: 'POST', body: JSON.stringify(data) });
}
export function getPost(id: string) { return request<any>(`/posts/${id}`); }
export function deletePost(id: string) { return request<any>(`/posts/${id}`, { method: 'DELETE' }); }
export function togglePostLike(id: string) { return request<any>(`/posts/${id}/like`, { method: 'POST' }); }
export function addPostComment(id: string, content: string) {
  return request<any>(`/posts/${id}/comment`, { method: 'POST', body: JSON.stringify({ content }) });
}
export function getUserPosts(userId: string, cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request<any>(`/posts/user/${userId}${params}`);
}

// ── Feed ──
export function getForYouFeed(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request<any>(`/feed/for-you${params}`);
}
export function getFollowingFeed(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request<any>(`/feed/following${params}`);
}
export function getTrendingFeed(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request<any>(`/feed/trending${params}`);
}

// ── Hashtags ──
export function getTrendingHashtags(period = 'H24') {
  return request<any>(`/hashtags/trending?period=${period}`);
}
export function searchHashtags(query: string) {
  return request<any>(`/hashtags/search?q=${encodeURIComponent(query)}`);
}

// ── Promo ──
export function getPromoCards() { return request<any>('/promo/for-feed'); }
export function dismissPromo(id: string) { return request<any>(`/promo/${id}/dismiss`, { method: 'POST' }); }

// ── Creator Economy ──
export function subscribeToCreator(creatorId: string) {
  return request<any>(`/creator-economy/subscribe/${creatorId}`, { method: 'POST' });
}
export function unsubscribeFromCreator(creatorId: string) {
  return request<any>(`/creator-economy/unsubscribe/${creatorId}`, { method: 'POST' });
}
export function tipCreator(creatorId: string, xpAmount: number, message?: string) {
  return request<any>(`/creator-economy/tip/${creatorId}`, { method: 'POST', body: JSON.stringify({ xpAmount, message }) });
}
export function checkSubscription(creatorId: string) {
  return request<any>(`/creator-economy/check/${creatorId}`);
}
export function getCreatorEarnings() { return request<any>('/creator-economy/earnings'); }

// ── Social Notifications ──
export function getSocialNotifications(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request<any>(`/smart-notifications/social${params}`);
}
export function getUnreadNotificationCount() { return request<any>('/smart-notifications/unread-count'); }
export function markNotificationRead(id: string) {
  return request<any>(`/smart-notifications/${id}/read`, { method: 'POST' });
}
export function markAllNotificationsRead() {
  return request<any>('/smart-notifications/read-all', { method: 'POST' });
}

// ── Wearables (HealthKit / Health Connect) ──
export interface WearableEntry {
  dataType: 'heart_rate' | 'hrv' | 'resting_hr' | 'sleep' | 'steps' | 'calories';
  value: number;
  unit: string;
  timestamp: string;
}
export function syncWearables(
  provider: 'apple_health' | 'health_connect',
  entries: WearableEntry[],
  sessionId?: string,
) {
  return request<{ synced: number }>('/wearables/sync', {
    method: 'POST',
    body: JSON.stringify({ provider, entries, sessionId }),
  });
}
export function getRecoveryScore() {
  return request<{ score: number; recommendation: string; hrv: number | null; restingHR: number | null; sleepHours: number | null }>('/wearables/recovery');
}
