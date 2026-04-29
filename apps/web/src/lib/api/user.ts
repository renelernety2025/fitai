import { request, API_URL } from './base';

export interface NotificationPrefs {
  workoutReminder: boolean;
  streakWarning: boolean;
  achievements: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
}

export interface VIPStatus {
  id: string;
  tier: string;
  invitedAt: string;
  privileges: string[];
}

export interface VIPEligibility {
  eligible: boolean;
  xpRank: number;
  totalUsers: number;
  streak: number;
  avgForm: number;
}

export function getNotificationPrefs() {
  return request<NotificationPrefs>(
    '/notifications/preferences',
  );
}

export function updateNotificationPrefs(
  data: Partial<NotificationPrefs>,
) {
  return request<NotificationPrefs>(
    '/notifications/preferences',
    { method: 'PUT', body: JSON.stringify(data) },
  );
}

export function getSmartNotifications(): Promise<any[]> {
  return request('/smart-notifications/upcoming');
}

export function saveNotificationPreferences(
  data: Record<string, unknown>,
): Promise<any> {
  return request('/smart-notifications/preferences', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getUserTitles(): Promise<any[]> {
  return request('/users/titles');
}

export function activateTitle(id: string): Promise<any> {
  return request(`/users/titles/${id}/activate`, {
    method: 'PATCH',
  });
}

export function getUserBrand(): Promise<any> {
  return request('/users/brand');
}

export function updateUserBrand(data: {
  colorTheme?: string;
  avatarConfig?: any;
  monogram?: string;
}): Promise<any> {
  return request('/users/brand', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getVIPStatus(): Promise<VIPStatus | null> {
  return request('/vip/status');
}

export function acceptVIP(): Promise<any> {
  return request('/vip/accept', { method: 'POST' });
}

export function checkVIPEligibility(): Promise<VIPEligibility> {
  return request('/vip/check-eligibility');
}

// ── Billing ──

export function getBillingStatus(): Promise<any> {
  return request('/billing/status');
}

export function createCheckout(
  tier: string,
): Promise<any> {
  return request('/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ tier }),
  });
}

export function getBillingPortal(): Promise<any> {
  return request('/billing/portal', { method: 'POST' });
}

export function getPlans(): Promise<any[]> {
  return request('/billing/plans');
}

// ── Export ──

export async function downloadExport(
  path: string,
  filename: string,
): Promise<void> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('fitai_token')
      : null;
  const res = await fetch(`${API_URL}/${path}`, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
