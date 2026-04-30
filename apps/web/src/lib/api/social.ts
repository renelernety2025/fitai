import { request } from './base';

export interface FeedItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface ChallengeData {
  id: string;
  name: string;
  nameCs: string;
  description: string;
  type: string;
  targetValue: number;
  startDate: string;
  endDate: string;
  _count: { participants: number };
  participants: {
    currentValue: number;
    user: { id: string; name: string };
  }[];
}

export function followUser(userId: string) {
  return request<any>(`/social/follow/${userId}`, {
    method: 'POST',
  });
}

export function unfollowUser(userId: string) {
  return request<any>(`/social/follow/${userId}`, {
    method: 'DELETE',
  });
}

export function getFollowing() {
  return request<
    { id: string; name: string; avatarUrl: string | null }[]
  >('/social/following');
}

export function getFollowers() {
  return request<
    { id: string; name: string; avatarUrl: string | null }[]
  >('/social/followers');
}

export function getFollowCounts() {
  return request<{ following: number; followers: number }>(
    '/social/follow-counts',
  );
}

export function getSocialFeed() {
  return request<FeedItem[]>('/social/feed');
}

export function getPublicFeed() {
  return request<FeedItem[]>('/social/feed/public');
}

export function getChallenges() {
  return request<ChallengeData[]>('/social/challenges');
}

export function joinChallenge(challengeId: string) {
  return request<any>(
    `/social/challenges/${challengeId}/join`,
    { method: 'POST' },
  );
}

export function getLeaderboard(challengeId: string) {
  return request<
    {
      currentValue: number;
      user: { id: string; name: string };
    }[]
  >(`/social/challenges/${challengeId}/leaderboard`);
}

export function createChallenge(data: {
  name: string;
  description?: string;
  type: string;
  targetValue: number;
  durationDays: number;
}): Promise<ChallengeData> {
  return request('/social/challenges', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getChallengeDetail(
  id: string,
): Promise<
  ChallengeData & {
    creator: {
      id: string;
      name: string;
      avatarUrl: string | null;
    } | null;
    daysRemaining: number;
    isExpired: boolean;
  }
> {
  return request(`/social/challenges/${id}`);
}

export function inviteToChallenge(
  challengeId: string,
  userId: string,
): Promise<{ ok: boolean }> {
  return request(
    `/social/challenges/${challengeId}/invite`,
    {
      method: 'POST',
      body: JSON.stringify({ userId }),
    },
  );
}

export function searchUsers(query: string) {
  return request<
    {
      id: string;
      name: string;
      avatarUrl: string | null;
      level: string;
    }[]
  >(`/social/search?q=${encodeURIComponent(query)}`);
}

// Stories
export function getStories(): Promise<any[]> {
  return request('/social/stories');
}

export function createStory(data: any): Promise<any> {
  return request('/social/stories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function viewStory(id: string): Promise<void> {
  return request(`/social/stories/${id}/view`, {
    method: 'POST',
  });
}

// Reactions
export function addReaction(
  targetType: string,
  targetId: string,
  emoji: string,
): Promise<any> {
  return request('/social/react', {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId, emoji }),
  });
}

export function removeReaction(id: string): Promise<void> {
  return request(`/social/react/${id}`, {
    method: 'DELETE',
  });
}

export function getReactions(
  targetType: string,
  targetId: string,
): Promise<any[]> {
  return request(
    `/social/reactions/${targetType}/${targetId}`,
  );
}

// Comments
export function addComment(
  feedItemId: string,
  content: string,
): Promise<any> {
  return request('/social/comments', {
    method: 'POST',
    body: JSON.stringify({ feedItemId, content }),
  });
}

export function getComments(
  feedItemId: string,
): Promise<any[]> {
  return request(`/social/comments/${feedItemId}`);
}

export function deleteComment(id: string): Promise<void> {
  return request(`/social/comments/${id}`, {
    method: 'DELETE',
  });
}

// Props
export function giveProps(
  toUserId: string,
  reason?: string,
): Promise<any> {
  return request('/social/props', {
    method: 'POST',
    body: JSON.stringify({ toUserId, reason }),
  });
}

export function getReceivedProps(): Promise<any[]> {
  return request('/social/props/received');
}

// Flash Challenge
export function getActiveFlash(): Promise<any> {
  return request('/social/flash-challenge/active');
}

export function joinFlash(id: string): Promise<any> {
  return request(`/social/flash-challenge/${id}/join`, {
    method: 'POST',
  });
}

// Share
export function shareToFeed(
  type: string,
  referenceId: string,
): Promise<any> {
  return request('/social/share', {
    method: 'POST',
    body: JSON.stringify({ type, referenceId }),
  });
}

// Public Profile
export function getPublicProfile(id: string): Promise<any> {
  return request(`/social/profile/${id}`);
}

export function updateBio(bio: string): Promise<any> {
  return request('/social/profile/bio', {
    method: 'PUT',
    body: JSON.stringify({ bio }),
  });
}

// Buddy
export function getBuddyCards(): Promise<any[]> {
  return request('/buddy/cards');
}

export function upsertBuddyProfile(
  data: any,
): Promise<any> {
  return request('/buddy/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getBuddyProfile(): Promise<any> {
  return request('/buddy/profile');
}

export function swipeBuddy(
  targetId: string,
  direction: string,
): Promise<any> {
  return request('/buddy/swipe', {
    method: 'POST',
    body: JSON.stringify({ targetId, direction }),
  });
}

export function getBuddyMatches(): Promise<any[]> {
  return request('/buddy/matches');
}

// Messages
export function getConversations(): Promise<any[]> {
  return request('/messages/conversations');
}

export function getMessages(
  conversationId: string,
): Promise<any[]> {
  return request(`/messages/${conversationId}`);
}

export function sendDirectMessage(
  conversationId: string,
  content: string,
): Promise<any> {
  return request(`/messages/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export function startConversation(
  userId: string,
): Promise<any> {
  return request(`/messages/start/${userId}`, {
    method: 'POST',
  });
}

// Feed
export function getForYouFeed(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request(`/api/feed/for-you${params}`);
}

export function getFollowingFeed(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request(`/api/feed/following${params}`);
}

export function getTrendingFeed(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request(`/api/feed/trending${params}`);
}

// Promo
export function getPromoCards() {
  return request('/api/promo/for-feed');
}

export function dismissPromo(id: string) {
  return request(`/api/promo/${id}/dismiss`, { method: 'POST' });
}
