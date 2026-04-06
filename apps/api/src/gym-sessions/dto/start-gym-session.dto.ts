import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';

export class StartGymSessionDto {
  @IsOptional()
  @IsString()
  workoutPlanId?: string;

  @IsOptional()
  @IsInt()
  workoutDayIndex?: number;

  @IsOptional()
  @IsArray()
  adHocExercises?: { exerciseId: string; targetSets: number; targetReps: number; targetWeight?: number; restSeconds?: number }[];
}
