import { request } from './base';

export interface VideoData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  durationSeconds: number;
  thumbnailUrl: string;
  hlsUrl: string | null;
  s3RawKey: string;
  choreographyUrl: string | null;
  preprocessingStatus:
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED';
  preprocessingError: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface PreprocessingStatusData {
  id: string;
  preprocessingStatus: string;
  preprocessingError: string | null;
  preprocessingJobId: string | null;
  choreographyUrl: string | null;
}

export interface Lesson {
  id: string;
  slug: string;
  titleCs: string;
  category: string;
  bodyCs: string;
  durationMin: number;
  publishedAt: string;
}

export interface GlossaryTerm {
  id: string;
  termCs: string;
  definitionCs: string;
  category: string | null;
}

export function getVideos(filters?: {
  category?: string;
  difficulty?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.category)
    params.set('category', filters.category);
  if (filters?.difficulty)
    params.set('difficulty', filters.difficulty);
  const qs = params.toString();
  return request<VideoData[]>(
    `/videos${qs ? `?${qs}` : ''}`,
  );
}

export function getVideo(id: string) {
  return request<VideoData>(`/videos/${id}`);
}

export function getUploadUrl(
  filename: string,
  contentType: string,
) {
  const params = new URLSearchParams({
    filename,
    contentType,
  });
  return request<{ uploadUrl: string; s3Key: string }>(
    `/videos/upload-url?${params}`,
  );
}

export function createVideo(dto: {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  durationSeconds: number;
  thumbnailUrl: string;
  s3RawKey: string;
}) {
  return request<VideoData>('/videos', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function publishVideo(id: string) {
  return request<VideoData>(`/videos/${id}/publish`, {
    method: 'PUT',
  });
}

export function deleteVideo(id: string) {
  return request<void>(`/videos/${id}`, {
    method: 'DELETE',
  });
}

export function startPreprocessing(videoId: string) {
  return request<{
    jobId: string;
    status: string;
    message: string;
  }>('/preprocessing/start', {
    method: 'POST',
    body: JSON.stringify({ videoId }),
  });
}

export function getPreprocessingStatus(videoId: string) {
  return request<PreprocessingStatusData>(
    `/preprocessing/status/${videoId}`,
  );
}

export function reprocessVideo(videoId: string) {
  return request<{
    jobId: string;
    status: string;
    message: string;
  }>(`/videos/${videoId}/reprocess`, { method: 'PUT' });
}

export function getLessons(category?: string) {
  return request<Lesson[]>(
    `/education/lessons${category ? `?category=${category}` : ''}`,
  );
}

export function getLessonOfTheWeek() {
  return request<Lesson | null>(
    '/education/lessons/of-the-week',
  );
}

export function getLesson(slug: string) {
  return request<Lesson>(`/education/lessons/${slug}`);
}

export function getGlossary(query?: string) {
  return request<GlossaryTerm[]>(
    `/education/glossary${query ? `?q=${encodeURIComponent(query)}` : ''}`,
  );
}

export function getDiscoverWeekly(): Promise<any> {
  return request('/discover-weekly');
}

export function getRecommendations(): Promise<any> {
  return request('/recommendations');
}

export interface FormCheckAnalysis {
  overallScore: number;
  phases: {
    name: string;
    score: number;
    feedback: string;
  }[];
  improvements: string[];
  positives: string[];
}

export function getFormCheckUploadUrl(data: {
  fileName: string;
  contentType: string;
}): Promise<{ uploadUrl: string; s3Key: string }> {
  return request('/form-check/upload-url', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function analyzeForm(data: {
  s3Key: string;
  exerciseId: string;
}): Promise<FormCheckAnalysis> {
  return request('/form-check/analyze', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getFormCheckHistory(): Promise<any[]> {
  return request('/form-check/history');
}
