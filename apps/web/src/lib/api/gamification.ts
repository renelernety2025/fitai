import { request } from './base';

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
  return request<{ newlyUnlocked: any[]; total: number }>(
    '/achievements/check',
    { method: 'POST' },
  );
}

export function unlockAchievement(code: string) {
  return request<any>('/achievements/unlock', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function getLeagueCurrent() {
  return request<any>('/leagues/current');
}

export function joinLeague() {
  return request<any>('/leagues/join', { method: 'POST' });
}

export function getSkillTree() {
  return request<any>('/skill-tree');
}

export function checkSkillTree() {
  return request<any>('/skill-tree/check', {
    method: 'POST',
  });
}

export function getCurrentSeason() {
  return request<any>('/seasons/current');
}

export function joinSeason() {
  return request<any>('/seasons/join', { method: 'POST' });
}

export function checkSeasonMissions() {
  return request<any>('/seasons/check-missions', {
    method: 'POST',
  });
}

export function getBossFights(): Promise<any> {
  return request('/boss-fights');
}

export function startBoss(code: string): Promise<any> {
  return request(`/boss-fights/${code}/start`, {
    method: 'POST',
  });
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

export function getStreakFreezeStatus(): Promise<any> {
  return request('/streak-freeze/status');
}

export function useStreakFreeze(): Promise<any> {
  return request('/streak-freeze/use', { method: 'POST' });
}

export function getDailyQuests(): Promise<any[]> {
  return request('/daily-quests/today');
}

export function completeDailyQuest(
  id: string,
): Promise<any> {
  return request(`/daily-quests/${id}/complete`, {
    method: 'POST',
  });
}

// Paid Challenges

export function getPaidChallenges(): Promise<any[]> {
  return request('/paid-challenges');
}

export function getPaidChallengeDetail(
  id: string,
): Promise<any> {
  return request(`/paid-challenges/${id}`);
}

export function createPaidChallenge(
  data: any,
): Promise<any> {
  return request('/paid-challenges', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function joinPaidChallenge(
  id: string,
): Promise<any> {
  return request(`/paid-challenges/${id}/join`, {
    method: 'POST',
  });
}

// Creators

export function getCreators(): Promise<any[]> {
  return request('/creators');
}

export function getCreatorDetail(
  id: string,
): Promise<any> {
  return request(`/creators/${id}`);
}

export function applyAsCreator(
  data: any,
): Promise<any> {
  return request('/creators/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateCreatorProfile(
  data: any,
): Promise<any> {
  return request('/creators/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
