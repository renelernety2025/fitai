// API contract types for the marketplace domain (api <-> web <-> mobile).
// Filled per-domain; source of truth is the NestJS controller return shapes.
// Covered modules: marketplace, experiences, trainers, routine-builder,
// drops, bundles, wishlist (apps/api/src/<module>).
// Dates are ISO-8601 strings (JSON-serialized Prisma DateTime).

// ── Shared helpers ────────────────────────────────────────────────

/** Minimal author ref (marketplace browse/detail `author` select). */
export interface ListingAuthor { id: string; name: string }

/** Public user summary used by trainer/bundle/routine includes. */
export interface PublicUserSummary { id: string; name: string; avatarUrl: string | null }

/** Standard delete acknowledgement returned by DELETE endpoints. */
export interface DeleteResult { deleted: boolean }

// ── Marketplace (MarketplaceListing model) ────────────────────────

export type MarketplaceListingType = 'workout_plan' | 'meal_plan' | 'challenge';

export interface MarketplaceListing {
  id: string;
  authorId: string;
  title: string;
  description: string | null;
  type: MarketplaceListingType;
  planId: string | null;
  priceXP: number;
  rating: number;
  ratingCount: number;
  downloads: number;
  isPublished: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** GET /marketplace and GET /marketplace/:id include the author. */
export interface MarketplaceListingWithAuthor extends MarketplaceListing {
  author: ListingAuthor;
}

export interface CreateListingPayload {
  title: string;
  description?: string;
  type: MarketplaceListingType;
  planId?: string;
  priceXP?: number;
  tags?: string[];
}

/** POST /marketplace/:id/purchase */
export interface MarketplacePurchaseResult { success: boolean; xpPaid: number }

/** POST /marketplace/:id/rate */
export interface MarketplaceRatingResult { rating: number; ratingCount: number }

// ── Trainers (TrainerProfile model) ───────────────────────────────

export interface TrainerProfile {
  id: string;
  userId: string;
  bio: string | null;
  certifications: string[];
  specializations: string[];
  videoIntroUrl: string | null;
  supertrainer: boolean;
  responseRate: number;
  avgResponseMinutes: number;
  totalSessions: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/** GET /trainers list item. */
export interface TrainerProfileWithUser extends TrainerProfile {
  user: PublicUserSummary;
}

/** GET /trainers/:id — includes upcoming experiences (max 10). */
export interface TrainerDetail extends TrainerProfileWithUser {
  experiences: Experience[];
}

export interface ApplyTrainerPayload {
  bio: string;
  certifications: string[];
  specializations: string[];
}

export interface UpdateTrainerProfilePayload {
  bio?: string;
  certifications?: string[];
  specializations?: string[];
}

// ── Experiences (Experience + Booking models) ─────────────────────

export type ExperienceCategory =
  | 'GROUP' | 'OUTDOOR' | 'WELLNESS' | 'COMBAT' | 'ADVENTURE' | 'NUTRITION_WORKSHOP';

export type ExperienceCancellationPolicy = 'FLEXIBLE' | 'MODERATE' | 'STRICT';

export type ExperienceBookingStatus =
  | 'BOOKING_PENDING' | 'CONFIRMED' | 'CANCELLED'
  | 'CHECKED_IN' | 'BOOKING_COMPLETED' | 'NO_SHOW';

export interface Experience {
  id: string;
  trainerId: string;
  title: string;
  description: string;
  locationLat: number | null;
  locationLng: number | null;
  locationAddress: string;
  dateTime: string;
  durationMinutes: number;
  capacity: number;
  currentBookings: number;
  priceXP: number;
  priceKc: number;
  difficulty: string;
  category: ExperienceCategory;
  cancellationPolicy: ExperienceCancellationPolicy;
  photos: string[];
  isActive: boolean;
  createdAt: string;
}

export interface ExperienceWithTrainer extends Experience {
  trainer: TrainerProfileWithUser;
}

/** GET /experiences and GET /experiences/:id. */
export interface ExperienceListing extends ExperienceWithTrainer {
  _count: { bookings: number };
}

export type ExperienceDetail = ExperienceListing;

export interface CreateExperiencePayload {
  title: string;
  description: string;
  locationAddress: string;
  locationLat?: number;
  locationLng?: number;
  dateTime: string;
  durationMinutes: number;
  capacity: number;
  priceXP?: number;
  priceKc?: number;
  difficulty?: string;
  category: string;
  cancellationPolicy?: string;
  photos?: string[];
}

export interface ExperienceBooking {
  id: string;
  userId: string;
  experienceId: string;
  status: ExperienceBookingStatus;
  bookedAt: string;
  cancelledAt: string | null;
  checkedInAt: string | null;
  rating: number | null;
  reviewText: string | null;
}

/** GET /experiences/my-bookings item. */
export interface ExperienceBookingWithExperience extends ExperienceBooking {
  experience: ExperienceWithTrainer;
}

// ── Routine builder (Routine + RoutineItem models) ────────────────

export type RoutineItemType =
  | 'SUPPLEMENT_ITEM' | 'WORKOUT_ITEM' | 'MEAL_ITEM' | 'RECOVERY_ITEM' | 'CUSTOM_ITEM';

export type RoutineTiming =
  | 'RT_MORNING' | 'RT_PRE_WORKOUT' | 'RT_DURING'
  | 'RT_POST_WORKOUT' | 'RT_EVENING' | 'RT_NIGHT';

export interface Routine {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineItem {
  id: string;
  routineId: string;
  type: RoutineItemType;
  timing: RoutineTiming;
  referenceId: string | null;
  referenceName: string;
  notes: string | null;
  sortOrder: number;
}

/** GET /routines/mine item. */
export interface RoutineWithItems extends Routine { items: RoutineItem[] }

/** GET /routines/public item. */
export interface PublicRoutine extends RoutineWithItems { user: PublicUserSummary }

export interface CreateRoutinePayload { name: string; isPublic?: boolean }

export interface AddRoutineItemPayload {
  type: RoutineItemType;
  referenceId?: string;
  referenceName: string;
  notes?: string;
  sortOrder?: number;
}

// ── Drops (Drop + DropPurchase models) ────────────────────────────

export type DropCategory =
  | 'DROP_WORKOUT_PLAN' | 'DROP_CHALLENGE' | 'DROP_BOSS_FIGHT'
  | 'DROP_BADGE' | 'DROP_EXPERIENCE';

export interface DropItem {
  id: string;
  name: string;
  description: string;
  totalEditions: number;
  remainingEditions: number;
  releaseDate: string;
  endDate: string;
  priceXP: number;
  exclusiveRewardType: string;
  /** Dynamic Json payload; shape depends on exclusiveRewardType. */
  exclusiveRewardData: unknown;
  category: DropCategory;
  isActive: boolean;
  createdAt: string;
}

/** GET /drops/:id — adds the caller's purchase state. */
export interface DropDetail extends DropItem {
  purchased: boolean;
  editionNumber: number | null;
}

export interface DropPurchase {
  id: string;
  dropId: string;
  userId: string;
  editionNumber: number;
  purchasedAt: string;
}

/** GET /drops/my-purchases item. */
export interface DropPurchaseWithDrop extends DropPurchase { drop: DropItem }

// ── Bundles (Bundle + BundlePurchase models) ──────────────────────

export interface BundleItemRef { itemType: string; itemId: string }

export interface Bundle {
  id: string;
  creatorId: string;
  name: string;
  description: string | null;
  /** Json column; written by BundlesService.create as BundleItemRef[]. */
  items: BundleItemRef[];
  priceXP: number;
  isPublic: boolean;
  giftable: boolean;
  createdAt: string;
}

/** GET /bundles and GET /bundles/:id include the creator. */
export interface BundleWithCreator extends Bundle { creator: PublicUserSummary }

export type BundleDetail = BundleWithCreator;

export interface CreateBundlePayload {
  name: string;
  description?: string;
  items: BundleItemRef[];
  priceXP?: number;
  giftable?: boolean;
}

export interface BundlePurchase {
  id: string;
  bundleId: string;
  userId: string;
  purchasedAt: string;
}

// ── Wishlist (Wishlist model) ─────────────────────────────────────

export type WishlistItemType =
  | 'WISH_EXERCISE' | 'WISH_PLAN' | 'WISH_RECIPE'
  | 'WISH_EXPERIENCE' | 'WISH_BUNDLE' | 'WISH_CLIP';

export interface WishlistEntry {
  id: string;
  userId: string;
  itemType: WishlistItemType;
  itemId: string;
  addedAt: string;
}

export interface AddWishlistPayload { itemType: WishlistItemType; itemId: string }

/** GET /wishlist/count/:itemType/:itemId */
export interface WishlistCount { itemType: string; itemId: string; count: number }
