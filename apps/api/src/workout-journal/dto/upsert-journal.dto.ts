import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum JournalMoodDto {
  GREAT = 'GREAT',
  GOOD = 'GOOD',
  NEUTRAL = 'NEUTRAL',
  TIRED = 'TIRED',
  BAD = 'BAD',
}

class MeasurementsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  chestCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  waistCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  armCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  thighCm?: number;
}

export class UpsertJournalDto {
  @IsOptional()
  @IsUUID()
  gymSessionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsEnum(JournalMoodDto)
  mood?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MeasurementsDto)
  measurements?: MeasurementsDto;
}
