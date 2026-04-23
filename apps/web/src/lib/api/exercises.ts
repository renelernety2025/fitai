import { request } from './base';

export interface ExerciseData {
  id: string;
  name: string;
  nameCs: string;
  description: string;
  descriptionCs: string;
  muscleGroups: string[];
  difficulty: string;
  phases: any[];
  thumbnailUrl: string | null;
}

export interface PersonalBest {
  hasPR: boolean;
  bestWeight?: number;
  bestReps?: number;
  avgFormScore?: number;
  totalVolume?: number;
}

export interface MicroWorkoutData {
  title: string;
  durationMinutes: number;
  exercises: (ExerciseData & {
    targetReps: number;
    targetSets: number;
    restSeconds: number;
  })[];
}

export function getExercises(filters?: {
  muscleGroup?: string;
  difficulty?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.muscleGroup)
    params.set('muscleGroup', filters.muscleGroup);
  if (filters?.difficulty)
    params.set('difficulty', filters.difficulty);
  const qs = params.toString();
  return request<ExerciseData[]>(
    `/exercises${qs ? `?${qs}` : ''}`,
  );
}

export function getExercise(id: string) {
  return request<ExerciseData>(`/exercises/${id}`);
}

export function getExercisePersonalBest(id: string) {
  return request<PersonalBest>(`/exercises/${id}/personal-best`);
}

export function getMicroWorkout() {
  return request<MicroWorkoutData>('/exercises/micro-workout');
}
