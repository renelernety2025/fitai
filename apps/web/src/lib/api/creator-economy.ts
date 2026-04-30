import { request } from './base';

export function subscribeToCreator(creatorId: string) {
  return request(`/creator-economy/subscribe/${creatorId}`, { method: 'POST' });
}

export function unsubscribeFromCreator(creatorId: string) {
  return request(`/creator-economy/unsubscribe/${creatorId}`, { method: 'POST' });
}

export function getMySubscriptions() {
  return request('/creator-economy/subscriptions');
}

export function getMySubscribers() {
  return request('/creator-economy/subscribers');
}

export function tipCreator(creatorId: string, xpAmount: number, message?: string) {
  return request(`/creator-economy/tip/${creatorId}`, {
    method: 'POST',
    body: JSON.stringify({ xpAmount, message }),
  });
}

export function getCreatorEarnings() {
  return request('/creator-economy/earnings');
}

export function checkSubscription(creatorId: string) {
  return request(`/creator-economy/check/${creatorId}`);
}

// Creator Dashboard
export function getDashboardStats() {
  return request('/creator-dashboard/stats');
}

export function getSubscriberGrowth(days = 30) {
  return request(`/creator-dashboard/subscriber-growth?days=${days}`);
}

export function getDashboardEarnings(weeks = 12) {
  return request(`/creator-dashboard/earnings?weeks=${weeks}`);
}

export function getPostPerformance(limit = 20) {
  return request(`/creator-dashboard/post-performance?limit=${limit}`);
}

export function getTopHashtags() {
  return request('/creator-dashboard/top-hashtags');
}

export function setSubscriptionPrice(priceXP: number) {
  return request('/creator-dashboard/subscription-price', {
    method: 'PUT',
    body: JSON.stringify({ priceXP }),
  });
}

export function pinPost(postId: string) {
  return request(`/creator-dashboard/pin/${postId}`, { method: 'POST' });
}

export function unpinPost(postId: string) {
  return request(`/creator-dashboard/unpin/${postId}`, { method: 'POST' });
}

export function schedulePost(data: {
  caption?: string;
  type: string;
  photoKeys?: string[];
  publishAt: string;
  isSubscriberOnly?: boolean;
}) {
  return request('/creator-dashboard/schedule-post', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function cancelScheduledPost(postId: string) {
  return request(`/creator-dashboard/schedule/${postId}`, { method: 'DELETE' });
}

export function publishNow(postId: string) {
  return request(`/creator-dashboard/publish-now/${postId}`, { method: 'POST' });
}

export function bulkSubscriberOnly(postIds: string[], isSubscriberOnly: boolean) {
  return request('/creator-dashboard/bulk-subscriber-only', {
    method: 'POST',
    body: JSON.stringify({ postIds, isSubscriberOnly }),
  });
}
