import {
  IsString,
  IsArray,
  IsNumber,
  IsIn,
  IsOptional,
  IsUUID,
  MaxLength,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class WearableEntryDto {
  @IsIn(['heart_rate', 'hrv', 'resting_hr', 'sleep', 'steps', 'calories'])
  dataType: string;

  @IsNumber()
  value: number;

  @IsString()
  @MaxLength(20)
  unit: string;

  @IsString()
  @MaxLength(30)
  timestamp: string;
}

export class SyncWearablesDto {
  @IsIn(['apple_health', 'google_fit', 'health_connect', 'garmin', 'fitbit', 'polar', 'whoop'])
  provider: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => WearableEntryDto)
  entries: WearableEntryDto[];
}
