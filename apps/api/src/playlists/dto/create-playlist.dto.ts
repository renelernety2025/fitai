import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  spotifyUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  appleMusicUrl?: string;

  @IsOptional()
  @IsString()
  exerciseId?: string;

  @IsOptional()
  @IsString()
  workoutType?: string;

  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(220)
  bpm?: number;
}
