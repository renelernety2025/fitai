import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, Min, Max, IsDateString } from 'class-validator';

export class CreatePromoDto {
  @IsEnum(['FEATURE_DISCOVERY', 'UPGRADE', 'CHALLENGE', 'CONTENT'])
  type: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  ctaText: string;

  @IsString()
  ctaUrl: string;

  @IsOptional()
  @IsString()
  imageS3Key?: string;

  @IsOptional()
  @IsEnum(['ALL', 'FREE_TIER', 'NO_STREAK', 'NEW_USER', 'NO_MEAL_PLAN', 'NO_JOURNAL'])
  targetAudience?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
