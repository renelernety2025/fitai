import { request } from './base';

export type ReportTargetType = 'POST' | 'CLIP' | 'POST_COMMENT' | 'CLIP_COMMENT' | 'USER';
export type ReportReason =
  | 'SPAM'
  | 'HARASSMENT'
  | 'HATE_SPEECH'
  | 'NUDITY'
  | 'VIOLENCE'
  | 'SELF_HARM'
  | 'MISINFORMATION'
  | 'OTHER';

export interface ReportContentParams {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  reporter: { id: string; name: string; email: string };
  targetType: ReportTargetType;
  targetId: string;
  reportedUserId: string | null;
  reportedUser: { id: string; name: string; email: string; bannedAt: string | null } | null;
  reason: ReportReason;
  details: string | null;
  status: 'PENDING' | 'REVIEWED_VALID' | 'REVIEWED_INVALID' | 'DISMISSED';
  reviewerId: string | null;
  reviewer: { id: string; name: string } | null;
  reviewerNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export function reportContent(params: ReportContentParams) {
  return request<{ id: string; status: string }>('/moderation/report', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function blockUser(userId: string) {
  return request<{ blocked: true }>(`/moderation/block/${userId}`, { method: 'POST' });
}

export function unblockUser(userId: string) {
  return request<{ blocked: false }>(`/moderation/block/${userId}`, { method: 'DELETE' });
}

export interface BlockedUser {
  id: string;
  blockedId: string;
  createdAt: string;
  blocked: { id: string; name: string; avatarUrl: string | null };
}

export function getBlockedUsers() {
  return request<BlockedUser[]>('/moderation/blocked');
}

// ── Admin ──

export function listPendingReports(status: 'PENDING' | 'REVIEWED_VALID' | 'REVIEWED_INVALID' | 'DISMISSED' = 'PENDING') {
  return request<ContentReport[]>(`/moderation/admin/reports?status=${status}`);
}

export function reviewReport(
  id: string,
  action: 'HIDE_CONTENT' | 'BAN_USER' | 'DISMISS',
  notes?: string,
) {
  return request(`/moderation/admin/reports/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ action, notes }),
  });
}

export function adminBanUser(userId: string, reason?: string) {
  return request(`/moderation/admin/users/${userId}/ban`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function adminUnbanUser(userId: string) {
  return request(`/moderation/admin/users/${userId}/unban`, { method: 'POST' });
}
