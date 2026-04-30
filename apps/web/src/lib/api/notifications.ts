import { request } from './base';

export function getSocialNotifications(cursor?: string) {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return request(`/smart-notifications/social${params}`);
}

export function getUnreadCount(): Promise<{ unreadCount: number }> {
  return request('/smart-notifications/unread-count');
}

export function markNotificationRead(id: string) {
  return request(`/smart-notifications/${id}/read`, { method: 'POST' });
}

export function markAllNotificationsRead() {
  return request('/smart-notifications/read-all', { method: 'POST' });
}
