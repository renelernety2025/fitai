// API contract types for the cross-industry domain (api <-> web <-> mobile).
// Source of truth: NestJS services in apps/api/src/{duels,squads,supplements,
// gear,maintenance,records,clips,playlists,gym-finder} + prisma/schema.prisma.
// All DateTime fields are ISO strings after JSON serialization.

// ── Shared user refs ──

export interface UserSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface UserNameRef {
  id: string;
  name: string;
}

// ── Duels ──

export type DuelType =
  | 'MAX_REPS'
  | 'HEAVIEST_LIFT'
  | 'LONGEST_HOLD'
  | 'FASTEST_DISTANCE';

export type DuelDuration =
  | 'HOUR_1'
  | 'HOUR_6'
  | 'HOUR_24'
  | 'HOUR_48'
  | 'WEEK';

export type DuelStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'DECLINED'
  | 'EXPIRED';

export interface DuelSummary {
  id: string;
  challengerId: string;
  challengedId: string;
  type: DuelType;
  metric: string;
  duration: DuelDuration;
  xpBet: number;
  status: DuelStatus;
  challengerScore: number;
  challengedScore: number;
  winnerId: string | null;
  startedAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

export interface DuelWithUsers extends DuelSummary {
  challenger: UserSummary;
  challenged: UserSummary;
}

export interface DuelDeclineResponse {
  message: string;
  refundedXP: number;
}

// ── Squads ──

export interface SquadSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  motto: string | null;
  createdAt: string;
}

export interface SquadMembershipData {
  id: string;
  squadId: string;
  userId: string;
  /** 'LEADER' | 'MEMBER' | 'INVITED' (plain String column in Prisma) */
  role: string;
  joinedAt: string;
}

export interface SquadMember extends SquadMembershipData {
  user: UserSummary;
}

export interface SquadWithMembers extends SquadSummary {
  members: SquadMember[];
}

export interface SquadMine extends SquadWithMembers {
  myRole: string;
}

export interface SquadDetail extends SquadWithMembers {
  weeklyXP: number;
}

export interface SquadLeaderboardMember extends SquadMembershipData {
  user: UserSummary & { sessions: { durationSeconds: number }[] };
}

export interface SquadLeaderboardEntry extends SquadSummary {
  members: SquadLeaderboardMember[];
  weeklyXP: number;
}

// ── Supplements ──

export type SupplementCategory =
  | 'PROTEIN'
  | 'CREATINE'
  | 'PRE_WORKOUT'
  | 'VITAMIN'
  | 'AMINO'
  | 'OTHER';

export type SupplementTiming =
  | 'MORNING'
  | 'PRE_WORKOUT'
  | 'DURING'
  | 'POST_WORKOUT'
  | 'EVENING'
  | 'WITH_MEAL';

export interface SupplementItem {
  id: string;
  name: string;
  brand: string | null;
  category: SupplementCategory;
  defaultDosage: string;
  description: string | null;
  createdAt: string;
}

export interface SupplementLogEntry {
  id: string;
  userSupplementId: string;
  date: string;
  taken: boolean;
  createdAt: string;
}

export interface UserSupplementData {
  id: string;
  userId: string;
  supplementId: string;
  dosage: string;
  timing: SupplementTiming;
  monthlyCostKc: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface UserSupplementWithSupplement extends UserSupplementData {
  supplement: SupplementItem;
}

export interface SupplementStackItem extends UserSupplementWithSupplement {
  /** Today's log only (0-1 entries) */
  logs: SupplementLogEntry[];
  takenToday: boolean;
}

/** Shape of GET /supplements/log/:date rows */
export interface SupplementDayLog {
  id: string;
  supplement: SupplementItem;
  dosage: string;
  timing: SupplementTiming;
  taken: boolean;
}

// ── Gear ──

export type GearCategory =
  | 'SHOES'
  | 'BELT'
  | 'GLOVES'
  | 'WRAPS'
  | 'CLOTHING'
  | 'EQUIPMENT'
  | 'OTHER_GEAR';

export interface GearReviewData {
  id: string;
  gearItemId: string;
  userId: string;
  rating: number;
  text: string | null;
  createdAt: string;
}

export interface GearItemData {
  id: string;
  userId: string;
  category: GearCategory;
  brand: string;
  model: string;
  purchaseDate: string | null;
  priceKc: number | null;
  photoS3Key: string | null;
  sessionCount: number;
  maxSessions: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface GearItemWithReviews extends GearItemData {
  reviews: (GearReviewData & { user: UserNameRef })[];
}

export interface UpdateGearInput {
  category?: string;
  brand?: string;
  model?: string;
  purchaseDate?: string;
  priceKc?: number;
  maxSessions?: number;
}

// ── Maintenance ──

export type MaintenanceStatusValue = 'FRESH' | 'DUE' | 'OVERDUE';

export type MaintenanceAlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface MaintenanceScheduleItem {
  id: string;
  userId: string;
  muscleGroup: string;
  sessionsSinceDeload: number;
  lastDeloadDate: string | null;
  nextRecommendedDate: string | null;
  status: MaintenanceStatusValue;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceAlertItem {
  id: string;
  userId: string;
  muscleGroup: string;
  severity: MaintenanceAlertSeverity;
  message: string;
  isDismissed: boolean;
  createdAt: string;
}

/** GET /maintenance/mileage returns one entry per muscle group */
export interface BodyMileageEntry {
  muscleGroup: string;
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
}

// ── Personal Records ──

export interface PersonalRecordEntry {
  exerciseId: string;
  exerciseName: string;
  exerciseNameCs: string | null;
  bestWeight: number | null;
  bestReps: number;
  date: string;
  previousBestWeight: number | null;
  previousBestReps: number | null;
  deltaWeight: number | null;
  deltaReps: number | null;
}

/** GET /records/:exerciseId — ExerciseHistory row + computed deltas */
export interface ExerciseRecordEntry {
  id: string;
  userId: string;
  exerciseId: string;
  date: string;
  bestWeight: number | null;
  bestReps: number;
  avgFormScore: number;
  totalVolume: number;
  deltaWeight: number | null;
  deltaReps: number | null;
}

export interface SectorTimeEntry {
  id: string;
  exerciseSetId: string;
  eccentricMs: number;
  holdMs: number;
  concentricMs: number;
  totalMs: number;
}

// ── Clips ──

export interface ClipData {
  id: string;
  userId: string;
  s3Key: string;
  thumbnailS3Key: string | null;
  durationSeconds: number;
  exerciseId: string | null;
  tags: string[];
  caption: string | null;
  /** Prisma Json blob — free-form overlay config, no fixed schema */
  overlayConfig: unknown;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isHidden: boolean;
  hiddenAt: string | null;
  hiddenReason: string | null;
  createdAt: string;
}

export interface ClipFeedItem extends ClipData {
  user: UserSummary;
}

export interface ClipCommentData {
  id: string;
  clipId: string;
  userId: string;
  text: string;
  createdAt: string;
  user: UserSummary;
}

export interface ClipDetail extends ClipFeedItem {
  comments: ClipCommentData[];
}

export interface ClipUploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
}

export interface ClipPlayUrlResponse {
  url: string;
  expiresIn: number;
  durationSeconds: number;
}

export interface ClipLikeResponse {
  liked: boolean;
}

// ── Playlists ──

export interface PlaylistLink {
  id: string;
  userId: string;
  exerciseId: string | null;
  workoutType: string | null;
  spotifyUrl: string | null;
  appleMusicUrl: string | null;
  title: string;
  bpm: number | null;
  createdAt: string;
  /** Included on GET /playlists; absent on POST /playlists response */
  user?: UserNameRef;
}

// ── Gym Finder ──

export interface GymReviewItem {
  id: string;
  userId: string;
  gymName: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  rating: number;
  equipment: string[];
  notes: string | null;
  createdAt: string;
}

export interface GymReviewWithUser extends GymReviewItem {
  user: UserNameRef;
}

export interface NearbyGym extends GymReviewWithUser {
  /** Haversine distance in km, rounded to 0.1 */
  distance: number;
}

export interface GymReviewInput {
  gymName: string;
  address?: string;
  lat?: number;
  lng?: number;
  rating: number;
  equipment?: string[];
  notes?: string;
}

// ── Generic responses ──

export interface OkResponse {
  ok: boolean;
}

export interface DeletedResponse {
  deleted: boolean;
}
