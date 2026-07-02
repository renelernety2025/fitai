import type {
  AddRoutineItemPayload,
  AddWishlistPayload,
  ApplyTrainerPayload,
  Bundle,
  BundleDetail,
  BundlePurchase,
  BundleWithCreator,
  CreateBundlePayload,
  CreateExperiencePayload,
  CreateListingPayload,
  CreateRoutinePayload,
  DeleteResult,
  DropDetail,
  DropItem,
  DropPurchase,
  DropPurchaseWithDrop,
  Experience,
  ExperienceBooking,
  ExperienceBookingWithExperience,
  ExperienceDetail,
  ExperienceListing,
  MarketplaceListing,
  MarketplaceListingWithAuthor,
  MarketplacePurchaseResult,
  MarketplaceRatingResult,
  PublicRoutine,
  Routine,
  RoutineItem,
  RoutineWithItems,
  TrainerDetail,
  TrainerProfile,
  TrainerProfileWithUser,
  UpdateTrainerProfilePayload,
  WishlistCount,
  WishlistEntry,
} from '@fitai/shared';
import { request } from './base';

// Marketplace
export function getMarketplace(
  params?: string,
): Promise<MarketplaceListingWithAuthor[]> {
  return request(
    `/marketplace${params ? `?${params}` : ''}`,
  );
}

export function getMarketplaceListing(
  id: string,
): Promise<MarketplaceListingWithAuthor> {
  return request(`/marketplace/${id}`);
}

export function createListing(
  data: CreateListingPayload,
): Promise<MarketplaceListing> {
  return request('/marketplace', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function purchaseListing(
  id: string,
): Promise<MarketplacePurchaseResult> {
  return request(`/marketplace/${id}/purchase`, {
    method: 'POST',
  });
}

export function rateListing(
  id: string,
  rating: number,
): Promise<MarketplaceRatingResult> {
  return request(`/marketplace/${id}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating }),
  });
}

// Experiences
export function getExperiences(params?: {
  category?: string;
  difficulty?: string;
  search?: string;
}): Promise<ExperienceListing[]> {
  const qs = params
    ? new URLSearchParams(
        params as Record<string, string>,
      ).toString()
    : '';
  return request(`/experiences${qs ? `?${qs}` : ''}`);
}

export function getExperienceDetail(
  id: string,
): Promise<ExperienceDetail> {
  return request(`/experiences/${id}`);
}

export function createExperience(
  data: CreateExperiencePayload,
): Promise<Experience> {
  return request('/experiences', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function bookExperience(
  id: string,
): Promise<ExperienceBooking> {
  return request(`/experiences/${id}/book`, {
    method: 'POST',
  });
}

export function cancelBooking(
  id: string,
): Promise<ExperienceBooking> {
  return request(
    `/experiences/bookings/${id}/cancel`,
    { method: 'POST' },
  );
}

export function checkinBooking(
  id: string,
): Promise<ExperienceBooking> {
  return request(
    `/experiences/bookings/${id}/checkin`,
    { method: 'POST' },
  );
}

export function reviewBooking(
  id: string,
  data: { rating: number; reviewText?: string },
): Promise<ExperienceBooking> {
  return request(
    `/experiences/bookings/${id}/review`,
    { method: 'POST', body: JSON.stringify(data) },
  );
}

export function getMyBookings(): Promise<
  ExperienceBookingWithExperience[]
> {
  return request('/experiences/my-bookings');
}

// Trainers
export function getTrainers(
  search?: string,
): Promise<TrainerProfileWithUser[]> {
  return request(
    `/trainers${search ? `?search=${encodeURIComponent(search)}` : ''}`,
  );
}

export function getTrainerDetail(
  id: string,
): Promise<TrainerDetail> {
  return request(`/trainers/${id}`);
}

export function applyAsTrainer(
  data: ApplyTrainerPayload,
): Promise<TrainerProfile> {
  return request('/trainers/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateTrainerProfile(
  data: UpdateTrainerProfilePayload,
): Promise<TrainerProfile> {
  return request('/trainers/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Routine Builder
export function getMyRoutines(): Promise<RoutineWithItems[]> {
  return request('/routines/mine');
}

export function createRoutine(
  data: CreateRoutinePayload,
): Promise<Routine> {
  return request('/routines', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteRoutine(
  id: string,
): Promise<DeleteResult> {
  return request(`/routines/${id}`, { method: 'DELETE' });
}

export function addRoutineItem(
  routineId: string,
  data: AddRoutineItemPayload,
): Promise<RoutineItem> {
  return request(`/routines/${routineId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function removeRoutineItem(
  routineId: string,
  itemId: string,
): Promise<DeleteResult> {
  return request(
    `/routines/${routineId}/items/${itemId}`,
    { method: 'DELETE' },
  );
}

export function getPublicRoutines(): Promise<PublicRoutine[]> {
  return request('/routines/public');
}

// Limited Drops
export function getDrops(): Promise<DropItem[]> {
  return request('/drops');
}

export function getDropDetail(
  id: string,
): Promise<DropDetail> {
  return request(`/drops/${id}`);
}

export function purchaseDrop(
  id: string,
): Promise<DropPurchase> {
  return request(`/drops/${id}/purchase`, {
    method: 'POST',
  });
}

export function getMyDropPurchases(): Promise<
  DropPurchaseWithDrop[]
> {
  return request('/drops/my-purchases');
}

// Bundles
export function getBundles(): Promise<BundleWithCreator[]> {
  return request('/bundles');
}

export function getBundleDetail(
  id: string,
): Promise<BundleDetail> {
  return request(`/bundles/${id}`);
}

export function createBundle(
  data: CreateBundlePayload,
): Promise<Bundle> {
  return request('/bundles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function purchaseBundle(
  id: string,
): Promise<BundlePurchase> {
  return request(`/bundles/${id}/purchase`, {
    method: 'POST',
  });
}

// Wishlist
export function getWishlist(): Promise<WishlistEntry[]> {
  return request('/wishlist');
}

export function addToWishlist(
  data: AddWishlistPayload,
): Promise<WishlistEntry> {
  return request('/wishlist', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function removeFromWishlist(
  id: string,
): Promise<DeleteResult> {
  return request(`/wishlist/${id}`, { method: 'DELETE' });
}

// NOTE: previously typed Promise<number>; the API actually returns
// { itemType, itemId, count } (WishlistService.count). No callers today.
export function getWishlistCount(
  itemType: string,
  itemId: string,
): Promise<WishlistCount> {
  return request(
    `/wishlist/count/${itemType}/${itemId}`,
  );
}
