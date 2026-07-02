import { request } from './base';
import type {
  Achievement,
  AchievementCheckResult,
  AchievementDefinition,
  ApplyCreatorPayload,
  BossCompleteResult,
  BossFightStatus,
  BossStartResult,
  CompleteBossPayload,
  CreatePaidChallengePayload,
  CreatorListItem,
  CreatorProfile,
  DailyQuest,
  DailyQuestCompleteResult,
  LeagueCurrent,
  LeagueMembership,
  PaidChallenge,
  PaidChallengeDetail,
  PaidChallengeEntry,
  PaidChallengeListItem,
  SeasonCurrent,
  SeasonMissionCheckResult,
  SeasonProgress,
  SkillTreeCheckResult,
  SkillTreeResponse,
  StreakFreezeStatus,
  StreakFreezeUseResult,
  UpdateCreatorPayload,
} from '@fitai/shared';

export type { Achievement, StreakFreezeStatus };

export function getAchievements(): Promise<Achievement[]> {
  return request<Achievement[]>('/achievements');
}

export function checkAchievements(): Promise<AchievementCheckResult> {
  return request<AchievementCheckResult>(
    '/achievements/check',
    { method: 'POST' },
  );
}

export function unlockAchievement(code: string): Promise<AchievementDefinition | null> {
  return request<AchievementDefinition | null>('/achievements/unlock', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function getLeagueCurrent(): Promise<LeagueCurrent> {
  return request<LeagueCurrent>('/leagues/current');
}

export function joinLeague(): Promise<LeagueMembership> {
  return request<LeagueMembership>('/leagues/join', { method: 'POST' });
}

export function getSkillTree(): Promise<SkillTreeResponse> {
  return request<SkillTreeResponse>('/skill-tree');
}

export function checkSkillTree(): Promise<SkillTreeCheckResult> {
  return request<SkillTreeCheckResult>('/skill-tree/check', {
    method: 'POST',
  });
}

export function getCurrentSeason(): Promise<SeasonCurrent> {
  return request<SeasonCurrent>('/seasons/current');
}

export function joinSeason(): Promise<SeasonProgress> {
  return request<SeasonProgress>('/seasons/join', { method: 'POST' });
}

export function checkSeasonMissions(): Promise<SeasonMissionCheckResult> {
  return request<SeasonMissionCheckResult>('/seasons/check-missions', {
    method: 'POST',
  });
}

export function getBossFights(): Promise<BossFightStatus[]> {
  return request<BossFightStatus[]>('/boss-fights');
}

export function startBoss(code: string): Promise<BossStartResult> {
  return request<BossStartResult>(`/boss-fights/${code}/start`, {
    method: 'POST',
  });
}

export function completeBoss(
  code: string,
  data: CompleteBossPayload,
): Promise<BossCompleteResult> {
  return request<BossCompleteResult>(`/boss-fights/${code}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getStreakFreezeStatus(): Promise<StreakFreezeStatus> {
  return request<StreakFreezeStatus>('/streak-freeze/status');
}

export function useStreakFreeze(): Promise<StreakFreezeUseResult> {
  return request<StreakFreezeUseResult>('/streak-freeze/use', { method: 'POST' });
}

export function getDailyQuests(): Promise<DailyQuest[]> {
  return request<DailyQuest[]>('/daily-quests/today');
}

export function completeDailyQuest(
  id: string,
): Promise<DailyQuestCompleteResult> {
  return request<DailyQuestCompleteResult>(`/daily-quests/${id}/complete`, {
    method: 'POST',
  });
}

// Paid Challenges

export function getPaidChallenges(): Promise<PaidChallengeListItem[]> {
  return request<PaidChallengeListItem[]>('/paid-challenges');
}

export function getPaidChallengeDetail(
  id: string,
): Promise<PaidChallengeDetail> {
  return request<PaidChallengeDetail>(`/paid-challenges/${id}`);
}

export function createPaidChallenge(
  data: CreatePaidChallengePayload,
): Promise<PaidChallenge> {
  return request<PaidChallenge>('/paid-challenges', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function joinPaidChallenge(
  id: string,
): Promise<PaidChallengeEntry> {
  return request<PaidChallengeEntry>(`/paid-challenges/${id}/join`, {
    method: 'POST',
  });
}

// Creators

export function getCreators(): Promise<CreatorListItem[]> {
  return request<CreatorListItem[]>('/creators');
}

export function getCreatorDetail(
  id: string,
): Promise<CreatorListItem> {
  return request<CreatorListItem>(`/creators/${id}`);
}

export function applyAsCreator(
  data: ApplyCreatorPayload,
): Promise<CreatorProfile> {
  return request<CreatorProfile>('/creators/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateCreatorProfile(
  data: UpdateCreatorPayload,
): Promise<CreatorProfile> {
  return request<CreatorProfile>('/creators/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
