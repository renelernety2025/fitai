import { request } from './base';

// Duels
export function challengeDuel(data: {
  challengedId: string;
  type: string;
  metric: string;
  duration: string;
  xpBet: number;
}): Promise<any> {
  return request('/duels/challenge', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function acceptDuel(id: string): Promise<any> {
  return request(`/duels/${id}/accept`, { method: 'POST' });
}

export function declineDuel(id: string): Promise<any> {
  return request(`/duels/${id}/decline`, {
    method: 'POST',
  });
}

export function submitDuelScore(
  id: string,
  score: number,
): Promise<any> {
  return request(`/duels/${id}/score`, {
    method: 'POST',
    body: JSON.stringify({ score }),
  });
}

export function getActiveDuels(): Promise<any[]> {
  return request('/duels/active');
}

export function getDuelHistory(): Promise<any[]> {
  return request('/duels/history');
}

// Squads
export function createSquad(data: {
  name: string;
  motto?: string;
}): Promise<any> {
  return request('/squads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getMySquad(): Promise<any> {
  return request('/squads/mine');
}

export function inviteToSquad(
  squadId: string,
  userId: string,
): Promise<any> {
  return request(`/squads/${squadId}/invite`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export function getSquadDetail(id: string): Promise<any> {
  return request(`/squads/${id}`);
}

export function getSquadLeaderboard(): Promise<any[]> {
  return request('/squads/leaderboard');
}

export function leaveSquad(id: string): Promise<any> {
  return request(`/squads/${id}/leave`, {
    method: 'DELETE',
  });
}

// Supplements
export function getSupplementCatalog(): Promise<any[]> {
  return request('/supplements/catalog');
}

export function getMyStack(): Promise<any[]> {
  return request('/supplements/stack');
}

export function addToStack(data: {
  supplementId: string;
  dosage: string;
  timing: string;
  monthlyCostKc?: number;
}): Promise<any> {
  return request('/supplements/stack', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function removeFromStack(id: string): Promise<any> {
  return request(`/supplements/stack/${id}`, {
    method: 'DELETE',
  });
}

export function logSupplement(
  userSupplementId: string,
): Promise<any> {
  return request('/supplements/log', {
    method: 'POST',
    body: JSON.stringify({ userSupplementId }),
  });
}

export function getSupplementLog(
  date: string,
): Promise<any[]> {
  return request(`/supplements/log/${date}`);
}

// Gear
export function getMyGear(): Promise<any[]> {
  return request('/gear');
}

export function addGearItem(data: {
  category: string;
  brand: string;
  model: string;
  purchaseDate?: string;
  priceKc?: number;
  maxSessions?: number;
}): Promise<any> {
  return request('/gear', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateGearItem(
  id: string,
  data: any,
): Promise<any> {
  return request(`/gear/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteGearItem(id: string): Promise<any> {
  return request(`/gear/${id}`, { method: 'DELETE' });
}

export function reviewGear(
  id: string,
  data: { rating: number; text?: string },
): Promise<any> {
  return request(`/gear/${id}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Maintenance
export function getMaintenanceStatus(): Promise<any[]> {
  return request('/maintenance');
}

export function getMaintenanceAlerts(): Promise<any[]> {
  return request('/maintenance/alerts');
}

export function markDeload(
  muscleGroup: string,
): Promise<any> {
  return request(`/maintenance/${muscleGroup}/deload`, {
    method: 'POST',
  });
}

export function dismissAlert(id: string): Promise<any> {
  return request(
    `/maintenance/alerts/${id}/dismiss`,
    { method: 'POST' },
  );
}

export function getBodyMileage(): Promise<any> {
  return request('/maintenance/mileage');
}

// Personal Records
export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  category: string;
  bestWeight: number;
  bestReps: number;
  date: string;
  deltaWeight: number | null;
  deltaReps: number | null;
}

export function getPersonalRecords(): Promise<
  PersonalRecord[]
> {
  return request('/records');
}

export function getExerciseRecords(
  exerciseId: string,
): Promise<any> {
  return request(`/records/${exerciseId}`);
}

export function getSectorTimes(
  exerciseSetId: string,
): Promise<any> {
  return request(`/records/sectors/${exerciseSetId}`);
}

// Clips
export function getClipUploadUrl(data: {
  fileName: string;
  contentType: string;
}): Promise<any> {
  return request('/clips/upload-url', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getClipsFeed(
  page = 1,
  limit = 10,
): Promise<any[]> {
  return request(
    `/clips/feed?page=${page}&limit=${limit}`,
  );
}

export function getClipDetail(id: string): Promise<any> {
  return request(`/clips/${id}`);
}

export function createClip(data: {
  s3Key: string;
  durationSeconds: number;
  exerciseId?: string;
  tags?: string[];
  caption?: string;
}): Promise<any> {
  return request('/clips', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function toggleClipLike(id: string): Promise<any> {
  return request(`/clips/${id}/like`, { method: 'POST' });
}

export function commentOnClip(
  id: string,
  text: string,
): Promise<any> {
  return request(`/clips/${id}/comment`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export function deleteClip(id: string): Promise<any> {
  return request(`/clips/${id}`, { method: 'DELETE' });
}

// Playlists
export interface PlaylistLink {
  id: string;
  title: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  bpm?: number;
  workoutType?: string;
  user: { name: string };
}

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
}): Promise<any> {
  return request('/playlists', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Gym Finder
export function getGymReviews(): Promise<any[]> {
  return request('/gym-finder');
}

export function addGymReview(data: any): Promise<any> {
  return request('/gym-finder', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getNearbyGyms(
  lat: number,
  lng: number,
): Promise<any[]> {
  return request(
    `/gym-finder/nearby?lat=${lat}&lng=${lng}`,
  );
}
