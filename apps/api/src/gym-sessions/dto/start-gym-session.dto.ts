import { IsString, IsOptional, IsInt, IsArray, IsEnum } from 'class-validator';

export class StartGymSessionDto {
  @IsOptional()
  @IsString()
  workoutPlanId?: string;

  @IsOptional()
  @IsInt()
  workoutDayIndex?: number;

  @IsOptional()
  @IsEnum(['DRILL', 'CHILL', 'MOTIVATIONAL'])
  coachPersonality?: 'DRILL' | 'CHILL' | 'MOTIVATIONAL';

  @IsOptional()
  @IsArray()
  adHocExercises?: { exerciseId: string; targetSets: number; targetReps: number; targetWeight?: number; restSeconds?: number }[];
}
