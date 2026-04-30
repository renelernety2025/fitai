import { request } from './base';

export interface HashtagData {
  id: string;
  name: string;
  postCount: number;
}

export interface TrendingHashtag {
  name: string;
  postCount: number;
  score: number;
  rank: number;
}

export function getTrendingHashtags(period: '24h' | '7d' = '24h'): Promise<TrendingHashtag[]> {
  return request(`/api/hashtags/trending?period=${period === '7d' ? 'D7' : 'H24'}`);
}

export function searchHashtags(query: string): Promise<HashtagData[]> {
  return request(`/api/hashtags/search?q=${encodeURIComponent(query)}`);
}

export function getSuggestedHashtags(): Promise<HashtagData[]> {
  return request('/api/hashtags/suggested');
}

export function getPostsByHashtag(name: string, cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request(`/api/hashtags/${encodeURIComponent(name)}/posts${params}`);
}
