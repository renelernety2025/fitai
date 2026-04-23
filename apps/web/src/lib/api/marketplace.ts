import { request } from './base';

// Marketplace
export function getMarketplace(
  params?: string,
): Promise<any[]> {
  return request(
    `/marketplace${params ? `?${params}` : ''}`,
  );
}

export function getMarketplaceListing(
  id: string,
): Promise<any> {
  return request(`/marketplace/${id}`);
}

export function createListing(data: any): Promise<any> {
  return request('/marketplace', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function purchaseListing(
  id: string,
): Promise<any> {
  return request(`/marketplace/${id}/purchase`, {
    method: 'POST',
  });
}

export function rateListing(
  id: string,
  rating: number,
): Promise<any> {
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
}): Promise<any[]> {
  const qs = params
    ? new URLSearchParams(
        params as Record<string, string>,
      ).toString()
    : '';
  return request(`/experiences${qs ? `?${qs}` : ''}`);
}

export function getExperienceDetail(
  id: string,
): Promise<any> {
  return request(`/experiences/${id}`);
}

export function createExperience(
  data: any,
): Promise<any> {
  return request('/experiences', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function bookExperience(
  id: string,
): Promise<any> {
  return request(`/experiences/${id}/book`, {
    method: 'POST',
  });
}

export function cancelBooking(id: string): Promise<any> {
  return request(
    `/experiences/bookings/${id}/cancel`,
    { method: 'POST' },
  );
}

export function checkinBooking(id: string): Promise<any> {
  return request(
    `/experiences/bookings/${id}/checkin`,
    { method: 'POST' },
  );
}

export function reviewBooking(
  id: string,
  data: { rating: number; reviewText?: string },
): Promise<any> {
  return request(
    `/experiences/bookings/${id}/review`,
    { method: 'POST', body: JSON.stringify(data) },
  );
}

export function getMyBookings(): Promise<any[]> {
  return request('/experiences/my-bookings');
}

// Trainers
export interface Trainer {
  id: string;
  userId: string;
  bio: string;
  supertrainer: boolean;
  responseRate: number;
  totalSessions: number;
  isVerified: boolean;
  specializations: string[];
  certifications: string[];
  user: { name: string; avatarUrl?: string };
  _count?: { reviews: number };
  avgRating?: number;
}

export interface TrainerDetail extends Trainer {
  reviews: any[];
  experiences: any[];
}

export function getTrainers(
  search?: string,
): Promise<Trainer[]> {
  return request(
    `/trainers${search ? `?search=${encodeURIComponent(search)}` : ''}`,
  );
}

export function getTrainerDetail(
  id: string,
): Promise<TrainerDetail> {
  return request(`/trainers/${id}`);
}

export function applyAsTrainer(data: {
  bio: string;
  certifications: string[];
  specializations: string[];
}): Promise<any> {
  return request('/trainers/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateTrainerProfile(
  data: any,
): Promise<any> {
  return request('/trainers/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Routine Builder
export interface Routine {
  id: string;
  name: string;
  isPublic: boolean;
  items: RoutineItem[];
}

export interface RoutineItem {
  id: string;
  type: string;
  timing: string;
  referenceName: string;
  notes?: string;
  sortOrder: number;
}

export function getMyRoutines(): Promise<Routine[]> {
  return request('/routines/mine');
}

export function createRoutine(data: {
  name: string;
  isPublic?: boolean;
}): Promise<any> {
  return request('/routines', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteRoutine(id: string): Promise<any> {
  return request(`/routines/${id}`, { method: 'DELETE' });
}

export function addRoutineItem(
  routineId: string,
  data: any,
): Promise<any> {
  return request(`/routines/${routineId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function removeRoutineItem(
  routineId: string,
  itemId: string,
): Promise<any> {
  return request(
    `/routines/${routineId}/items/${itemId}`,
    { method: 'DELETE' },
  );
}

export function getPublicRoutines(): Promise<Routine[]> {
  return request('/routines/public');
}

// Limited Drops
export function getDrops(): Promise<any[]> {
  return request('/drops');
}

export function getDropDetail(id: string): Promise<any> {
  return request(`/drops/${id}`);
}

export function purchaseDrop(id: string): Promise<any> {
  return request(`/drops/${id}/purchase`, {
    method: 'POST',
  });
}

export function getMyDropPurchases(): Promise<any[]> {
  return request('/drops/my-purchases');
}

// Bundles
export interface Bundle {
  id: string;
  name: string;
  description?: string;
  items: any[];
  priceXP: number;
  giftable: boolean;
  creator: { name: string };
}

export function getBundles(): Promise<Bundle[]> {
  return request('/bundles');
}

export function getBundleDetail(id: string): Promise<any> {
  return request(`/bundles/${id}`);
}

export function createBundle(data: any): Promise<any> {
  return request('/bundles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function purchaseBundle(id: string): Promise<any> {
  return request(`/bundles/${id}/purchase`, {
    method: 'POST',
  });
}

// Wishlist
export interface WishlistItem {
  id: string;
  itemType: string;
  itemId: string;
  addedAt: string;
}

export function getWishlist(): Promise<WishlistItem[]> {
  return request('/wishlist');
}

export function addToWishlist(data: {
  itemType: string;
  itemId: string;
}): Promise<any> {
  return request('/wishlist', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function removeFromWishlist(
  id: string,
): Promise<any> {
  return request(`/wishlist/${id}`, { method: 'DELETE' });
}

export function getWishlistCount(
  itemType: string,
  itemId: string,
): Promise<number> {
  return request(
    `/wishlist/count/${itemType}/${itemId}`,
  );
}
