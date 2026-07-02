import { request } from './base';
import type {
  BodyMileageEntry,
  ClipCommentData,
  ClipData,
  ClipDetail,
  ClipFeedItem,
  ClipLikeResponse,
  ClipPlayUrlResponse,
  ClipUploadUrlResponse,
  DeletedResponse,
  DuelDeclineResponse,
  DuelSummary,
  DuelWithUsers,
  ExerciseRecordEntry,
  GearItemData,
  GearItemWithReviews,
  GearReviewData,
  GymReviewInput,
  GymReviewItem,
  GymReviewWithUser,
  MaintenanceAlertItem,
  MaintenanceScheduleItem,
  NearbyGym,
  OkResponse,
  PersonalRecordEntry,
  PlaylistLink,
  SectorTimeEntry,
  SquadDetail,
  SquadLeaderboardEntry,
  SquadMember,
  SquadMine,
  SquadWithMembers,
  SupplementDayLog,
  SupplementItem,
  SupplementLogEntry,
  SupplementStackItem,
  UpdateGearInput,
  UserSupplementData,
  UserSupplementWithSupplement,
} from '@fitai/shared';

// Re-export contract types consumed by pages via '@/lib/api'.
export type { PlaylistLink, PersonalRecordEntry as PersonalRecord };

// Duels
export function challengeDuel(data: {
  challengedId: string;
  type: string;
  metric: string;
  duration: string;
  xpBet: number;
}): Promise<DuelWithUsers> {
  return request('/duels/challenge', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function acceptDuel(id: string): Promise<DuelWithUsers> {
  return request(`/duels/${id}/accept`, { method: 'POST' });
}

export function declineDuel(id: string): Promise<DuelDeclineResponse> {
  return request(`/duels/${id}/decline`, {
    method: 'POST',
  });
}

// Concurrent-settle race path returns the bare duel row (or null) without
// challenger/challenged relations — see DuelsService.submitScore.
export function submitDuelScore(
  id: string,
  score: number,
): Promise<DuelWithUsers | DuelSummary | null> {
  return request(`/duels/${id}/score`, {
    method: 'POST',
    body: JSON.stringify({ score }),
  });
}

export function getActiveDuels(): Promise<DuelWithUsers[]> {
  return request('/duels/active');
}

export function getDuelHistory(): Promise<DuelWithUsers[]> {
  return request('/duels/history');
}

// Squads
export function createSquad(data: {
  name: string;
  motto?: string;
}): Promise<SquadWithMembers> {
  return request('/squads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getMySquad(): Promise<SquadMine | null> {
  return request('/squads/mine');
}

export function inviteToSquad(
  squadId: string,
  userId: string,
): Promise<SquadMember> {
  return request(`/squads/${squadId}/invite`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export function getSquadDetail(id: string): Promise<SquadDetail> {
  return request(`/squads/${id}`);
}

export function getSquadLeaderboard(): Promise<SquadLeaderboardEntry[]> {
  return request('/squads/leaderboard');
}

export function leaveSquad(id: string): Promise<OkResponse> {
  return request(`/squads/${id}/leave`, {
    method: 'DELETE',
  });
}

// Supplements
export function getSupplementCatalog(): Promise<SupplementItem[]> {
  return request('/supplements/catalog');
}

export function getMyStack(): Promise<SupplementStackItem[]> {
  return request('/supplements/stack');
}

export function addToStack(data: {
  supplementId: string;
  dosage: string;
  timing: string;
  monthlyCostKc?: number;
}): Promise<UserSupplementWithSupplement> {
  return request('/supplements/stack', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function removeFromStack(id: string): Promise<UserSupplementData> {
  return request(`/supplements/stack/${id}`, {
    method: 'DELETE',
  });
}

export function logSupplement(
  userSupplementId: string,
): Promise<SupplementLogEntry> {
  return request('/supplements/log', {
    method: 'POST',
    body: JSON.stringify({ userSupplementId }),
  });
}

export function getSupplementLog(
  date: string,
): Promise<SupplementDayLog[]> {
  return request(`/supplements/log/${date}`);
}

// Gear
export function getMyGear(): Promise<GearItemWithReviews[]> {
  return request('/gear');
}

export function addGearItem(data: {
  category: string;
  brand: string;
  model: string;
  purchaseDate?: string;
  priceKc?: number;
  maxSessions?: number;
}): Promise<GearItemData> {
  return request('/gear', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateGearItem(
  id: string,
  data: UpdateGearInput,
): Promise<GearItemData> {
  return request(`/gear/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteGearItem(id: string): Promise<OkResponse> {
  return request(`/gear/${id}`, { method: 'DELETE' });
}

export function reviewGear(
  id: string,
  data: { rating: number; text?: string },
): Promise<GearReviewData> {
  return request(`/gear/${id}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Maintenance
export function getMaintenanceStatus(): Promise<MaintenanceScheduleItem[]> {
  return request('/maintenance');
}

export function getMaintenanceAlerts(): Promise<MaintenanceAlertItem[]> {
  return request('/maintenance/alerts');
}

export function markDeload(
  muscleGroup: string,
): Promise<MaintenanceScheduleItem> {
  return request(`/maintenance/${muscleGroup}/deload`, {
    method: 'POST',
  });
}

export function dismissAlert(id: string): Promise<MaintenanceAlertItem> {
  return request(
    `/maintenance/alerts/${id}/dismiss`,
    { method: 'POST' },
  );
}

export function getBodyMileage(): Promise<BodyMileageEntry[]> {
  return request('/maintenance/mileage');
}

// Personal Records
export function getPersonalRecords(): Promise<PersonalRecordEntry[]> {
  return request('/records');
}

export function getExerciseRecords(
  exerciseId: string,
): Promise<ExerciseRecordEntry[]> {
  return request(`/records/${exerciseId}`);
}

export function getSectorTimes(
  exerciseSetId: string,
): Promise<SectorTimeEntry[]> {
  return request(`/records/sectors/${exerciseSetId}`);
}

// Clips
export function getClipUploadUrl(data: {
  fileName: string;
  contentType: string;
}): Promise<ClipUploadUrlResponse> {
  return request('/clips/upload-url', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getClipsFeed(
  page = 1,
  limit = 10,
): Promise<ClipFeedItem[]> {
  return request(
    `/clips/feed?page=${page}&limit=${limit}`,
  );
}

export function getClipDetail(id: string): Promise<ClipDetail> {
  return request(`/clips/${id}`);
}

export function getClipPlayUrl(id: string): Promise<ClipPlayUrlResponse> {
  return request(`/clips/${id}/play-url`);
}

export function createClip(data: {
  s3Key: string;
  durationSeconds: number;
  exerciseId?: string;
  tags?: string[];
  caption?: string;
}): Promise<ClipData> {
  return request('/clips', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function toggleClipLike(id: string): Promise<ClipLikeResponse> {
  return request(`/clips/${id}/like`, { method: 'POST' });
}

export function commentOnClip(
  id: string,
  text: string,
): Promise<ClipCommentData> {
  return request(`/clips/${id}/comment`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export function deleteClip(id: string): Promise<DeletedResponse> {
  return request(`/clips/${id}`, { method: 'DELETE' });
}

// Playlists
export function getPlaylists(params?: {
  exerciseId?: string;
  workoutType?: string;
}): Promise<PlaylistLink[]> {
  const qs = params
    ? new URLSearchParams(
        params as Record<string, string>,
      ).toString()
    : '';
  return request(`/playlists${qs ? `?${qs}` : ''}`);
}

export function addPlaylistLink(data: {
  exerciseId?: string;
  workoutType?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  title: string;
  bpm?: number;
}): Promise<PlaylistLink> {
  return request('/playlists', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Gym Finder
export function getGymReviews(): Promise<GymReviewWithUser[]> {
  return request('/gym-finder');
}

export function addGymReview(data: GymReviewInput): Promise<GymReviewItem> {
  return request('/gym-finder', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getNearbyGyms(
  lat: number,
  lng: number,
): Promise<NearbyGym[]> {
  return request(
    `/gym-finder/nearby?lat=${lat}&lng=${lng}`,
  );
}
