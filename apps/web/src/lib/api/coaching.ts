import { request, API_URL } from './base';

export interface RecoveryTip {
  category:
    | 'sleep'
    | 'nutrition'
    | 'recovery'
    | 'stress'
    | 'training';
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

export interface NutritionTip {
  category:
    | 'protein'
    | 'hydration'
    | 'timing'
    | 'macros'
    | 'quality';
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
}

export type DailyBriefMood =
  | 'push'
  | 'maintain'
  | 'recover';
export type RecoveryStatus =
  | 'fresh'
  | 'normal'
  | 'fatigued'
  | 'overreached';

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

export interface TodayAction {
  type:
    | 'streak'
    | 'recovery'
    | 'comeback'
    | 'nutrition'
    | 'default';
  headline: string;
  rationale: string;
  ctaLabel: string;
  ctaLink: string;
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

export function getRecoveryTips() {
  return request<{
    tips: RecoveryTip[];
    cached: boolean;
  }>('/ai-insights/recovery-tips');
}

export function getWeeklyReview() {
  return request<{
    review: WeeklyReview;
    cached: boolean;
  }>('/ai-insights/weekly-review');
}

export function getNutritionTips() {
  return request<{
    tips: NutritionTip[];
    cached: boolean;
  }>('/ai-insights/nutrition-tips');
}

export function getDailyBrief() {
  return request<{
    brief: DailyBrief;
    cached: boolean;
  }>('/ai-insights/daily-brief');
}

export function getDailyMotivation() {
  return request<{ message: string; source: string }>(
    '/ai-insights/motivation',
  );
}

export function getTodayAction(): Promise<TodayAction> {
  return request('/ai-insights/today-action');
}

export function getChatConversations(): Promise<{
  conversations: ChatConversation[];
}> {
  return request('/coaching/conversations');
}

export function getChatMessages(
  conversationId: string,
): Promise<{ messages: ChatMessage[] }> {
  return request(
    `/coaching/conversations/${conversationId}/messages`,
  );
}

export async function sendChatMessage(
  message: string,
  conversationId: string | null,
  onDelta: (text: string) => void,
  onConversationId: (id: string) => void,
): Promise<void> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('fitai_token')
      : null;
  const body: Record<string, string> = { message };
  if (conversationId) body.conversationId = conversationId;

  const res = await fetch(`${API_URL}/coaching/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
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
        if (event.type === 'text_delta')
          onDelta(event.delta);
        if (event.type === 'conversation_id')
          onConversationId(event.id);
      } catch {
        /* ignore parse errors from partial SSE chunks */
      }
    }
  }
}

export function getPreWorkoutBriefing(
  gymSessionId: string,
) {
  return request<PreWorkoutBriefing>(
    `/education/briefing/${gymSessionId}`,
  );
}

export function getPostWorkoutDebrief(
  gymSessionId: string,
) {
  return request<PostWorkoutDebrief>(
    `/education/debrief/${gymSessionId}`,
  );
}

export function getCoachingMemories(
  page = 1,
  limit = 20,
): Promise<any> {
  return request(
    `/coaching-memory?page=${page}&limit=${limit}`,
  );
}

export function searchCoachingMemory(
  q: string,
): Promise<any[]> {
  return request(
    `/coaching-memory/search?q=${encodeURIComponent(q)}`,
  );
}

export function getCoachingProgress(
  exerciseId: string,
): Promise<any[]> {
  return request(
    `/coaching-memory/progress/${exerciseId}`,
  );
}

export function saveCoachingMemory(data: {
  exerciseId?: string;
  insight: string;
  category: string;
  metricBefore?: number;
  metricAfter?: number;
}): Promise<any> {
  return request('/coaching-memory', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
