import { request } from './base';

export function getAdminVideos() {
  return request<any[]>('/videos/admin/all');
}

export function getAdminAnalytics(): Promise<any> {
  return request('/admin/analytics');
}
