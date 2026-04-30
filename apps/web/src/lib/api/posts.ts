import { request } from './base';

export interface PostAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
  badgeType: 'NONE' | 'CREATOR' | 'VERIFIED';
}

export interface PostPhoto {
  id: string;
  s3Key: string;
  width: number | null;
  height: number | null;
  order: number;
}

export interface PostData {
  id: string;
  userId: string;
  user: PostAuthor;
  caption: string | null;
  type: 'TEXT' | 'PHOTO' | 'AUTO_CARD';
  cardData: any;
  photos: PostPhoto[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked?: boolean;
  hashtags?: { hashtag: { name: string } }[];
  createdAt: string;
  feedScore?: number;
}

export interface PostCommentData {
  id: string;
  content: string;
  user: PostAuthor;
  createdAt: string;
}

export function getUploadUrls(count: number, contentType = 'image/jpeg') {
  return request('/posts/upload-url', {
    method: 'POST',
    body: JSON.stringify({ count, contentType }),
  });
}

export function createPost(data: { caption?: string; type: string; photoKeys?: string[]; cardData?: any }) {
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getPost(id: string): Promise<PostData> {
  return request(`/posts/${id}`);
}

export function deletePost(id: string) {
  return request(`/posts/${id}`, { method: 'DELETE' });
}

export function togglePostLike(id: string) {
  return request(`/posts/${id}/like`, { method: 'POST' });
}

export function addPostComment(id: string, content: string) {
  return request(`/posts/${id}/comment`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export function deletePostComment(commentId: string) {
  return request(`/posts/comments/${commentId}`, { method: 'DELETE' });
}

export function getUserPosts(userId: string, cursor?: string): Promise<PostData[]> {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request(`/posts/user/${userId}${params}`);
}
