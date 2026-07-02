// API contract types for the gamification domain (api <-> web <-> mobile).
// Filled per-domain; source of truth is the NestJS controller return shapes.
// Dates are ISO strings (JSON-serialized Prisma DateTime).

/** Minimal public user info embedded in gamification payloads. */
export interface GamificationUserRef { id: string; name: string; avatarUrl: string | null }

// ---------- Achievements (/api/achievements) ----------

/** Prisma `Achievement` row (seeded definition). */
export interface AchievementDefinition {
  id: string;
  code: string;
  title: string;
  titleCs: string;
  description: string;
  descriptionCs: string;
  /** training | streak | milestone | social | exploration | nutrition | habits */
  category: string;
  icon: string;
  xpReward: number;
  threshold: number | null;
  createdAt: string;
}

/** GET /achievements — definition merged with per-user unlock state. */
export interface Achievement extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt: string | null;
}

/** POST /achievements/check */
export interface AchievementCheckResult { newlyUnlocked: AchievementDefinition[]; total: number }

// ---------- Leagues (/api/leagues) ----------

export type LeagueTier =
  | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'MASTER' | 'LEGEND';

/** One leaderboard row within the user's tier. */
export interface LeagueStanding { userId: string; name: string; weeklyXP: number; rank: number }

/** GET /leagues/current — discriminated on `joined`. */
export type LeagueCurrent =
  | { joined: false; tier: null; weeklyXP: number }
  | {
      joined: true;
      tier: LeagueTier;
      weeklyXP: number;
      rank: number | null;
      promoted: boolean;
      relegated: boolean;
      leaderboard: LeagueStanding[];
      totalInTier: number;
    };

/** POST /leagues/join — Prisma `LeagueMembership` row. */
export interface LeagueMembership {
  id: string;
  userId: string;
  tier: LeagueTier;
  weekStart: string;
  weeklyXP: number;
  rank: number | null;
  promoted: boolean;
  relegated: boolean;
  createdAt: string;
}

// ---------- Seasons (/api/seasons) ----------

export interface SeasonInfo { id: string; name: string; startDate: string; endDate: string }

export interface SeasonMissionStatus {
  id: string;
  code: string;
  titleCs: string;
  /** daily | weekly | challenge */
  type: string;
  targetValue: number;
  xpReward: number;
  completed: boolean;
}

/** GET /seasons/current — discriminated on `active`. */
export type SeasonCurrent =
  | { active: false }
  | {
      active: true;
      season: SeasonInfo;
      joined: boolean;
      level: number;
      totalXP: number;
      maxLevel: number;
      missions: SeasonMissionStatus[];
    };

/** POST /seasons/join — Prisma `SeasonProgress` row. */
export interface SeasonProgress {
  id: string;
  userId: string;
  seasonId: string;
  level: number;
  totalXP: number;
  createdAt: string;
  updatedAt: string;
}

/** POST /seasons/check-missions */
export interface SeasonMissionCheckResult {
  newlyCompleted: Array<{ code: string; titleCs: string }>;
  /** Absent when no active season or user has not joined. */
  xpEarned?: number;
  /** 'Not joined' when the user has no SeasonProgress. */
  message?: string;
}

// ---------- Skill tree (/api/skill-tree) ----------

export type SkillBranch = 'strength' | 'endurance' | 'knowledge' | 'nutrition';

/** Static node definition (skill-tree.data.ts). */
export interface SkillNodeDefinition {
  code: string;
  branch: SkillBranch;
  titleCs: string;
  /** Code of the prerequisite node, or null for branch roots. */
  requires: string | null;
  /** Unlock rule, e.g. 'bench_press_max >= 60'. */
  check: string;
}

export interface SkillNode extends SkillNodeDefinition { unlocked: boolean }

/** GET /skill-tree */
export interface SkillTreeResponse { nodes: SkillNode[] }

/** POST /skill-tree/check */
export interface SkillTreeCheckResult {
  newlyUnlocked: SkillNodeDefinition[];
  totalUnlocked: number;
  totalSkills: number;
}

// ---------- Boss fights (/api/boss-fights) ----------

export interface BossDefinition {
  code: string;
  nameCs: string;
  description: string;
  /** Target completion time in seconds. */
  targetTime: number;
  xpReward: number;
}

/** GET /boss-fights — definition merged with per-user attempt stats. */
export interface BossFightStatus extends BossDefinition {
  attempts: number;
  defeated: boolean;
  bestScore: number | null;
  /** startedAt of the most recent attempt. */
  lastAttempt: string | null;
}

/** POST /boss-fights/:code/start */
export interface BossStartResult { attemptId: string; boss: BossDefinition }

/** Body for POST /boss-fights/:code/complete (CompleteBossDto). */
export interface CompleteBossPayload { score: number; defeated: boolean; durationSec?: number }

/** POST /boss-fights/:code/complete */
export interface BossCompleteResult {
  defeated: boolean;
  score: number;
  xpAwarded: number;
  bossName: string;
}

// ---------- Streak freeze (/api/streak-freeze) ----------

/** GET /streak-freeze/status */
export interface StreakFreezeStatus { available: number; maxPerMonth: number; usedDates: string[] }

/** POST /streak-freeze/use */
export interface StreakFreezeUseResult { success: boolean; remaining: number; usedDate: string }

// ---------- Daily quests (/api/daily-quests) ----------

/** GET /daily-quests/today — one of 3 per-user daily quests. */
export interface DailyQuest { id: string; titleCs: string; xpReward: number; completed: boolean }

/** POST /daily-quests/:id/complete */
export interface DailyQuestCompleteResult { alreadyCompleted: boolean; xpAwarded: number }

// ---------- Paid challenges (/api/paid-challenges) ----------

export type PaidChallengeStatus = 'OPEN' | 'ACTIVE' | 'COMPLETED';

/** Prisma `PaidChallenge` row. */
export interface PaidChallenge {
  id: string;
  name: string;
  description: string;
  entryFeeXP: number;
  entryFeeKc: number;
  potXP: number;
  potKc: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  /** total_reps | total_volume | total_sessions | streak_days */
  metric: string;
  status: PaidChallengeStatus;
  winnerId: string | null;
  createdById: string;
  createdAt: string;
}

/** GET /paid-challenges list item. */
export interface PaidChallengeListItem extends PaidChallenge {
  createdBy: GamificationUserRef;
  _count: { participants: number };
}

/** Prisma `PaidChallengeEntry` row. */
export interface PaidChallengeEntry {
  id: string;
  challengeId: string;
  userId: string;
  currentScore: number;
  paid: boolean;
  joinedAt: string;
}

/** GET /paid-challenges/:id */
export interface PaidChallengeDetail extends PaidChallenge {
  createdBy: GamificationUserRef;
  winner: GamificationUserRef | null;
  participants: Array<PaidChallengeEntry & { user: GamificationUserRef }>;
}

/** Body for POST /paid-challenges (CreatePaidChallengeDto). */
export interface CreatePaidChallengePayload {
  name: string;
  description: string;
  entryFeeXP: number;
  startDate: string;
  endDate: string;
  /** total_reps | total_volume | total_sessions | streak_days (validated server-side). */
  metric: string;
  maxParticipants?: number;
}

// ---------- Creators (/api/creators) ----------

/** Prisma `CreatorProfile` row. */
export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  specializations: string[];
  isApproved: boolean;
  totalEarnings: number;
  subscriberCount: number;
  subscriptionPriceXP: number;
  totalXPEarned: number;
  monthlyXPEarned: number;
  createdAt: string;
}

/** GET /creators + GET /creators/:id — profile with public user info. */
export interface CreatorListItem extends CreatorProfile { user: GamificationUserRef }

/** Body for POST /creators/apply (ApplyCreatorDto). */
export interface ApplyCreatorPayload { displayName: string; bio?: string; specializations: string[] }

/** Body for PATCH /creators/profile (UpdateCreatorDto). */
export interface UpdateCreatorPayload { displayName?: string; bio?: string; specializations?: string[] }
