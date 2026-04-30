import { IsString, IsOptional, IsEnum, IsArray, MaxLength, ArrayMaxSize, IsDateString } from 'class-validator';

export class SchedulePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  caption?: string;

  @IsEnum(['TEXT', 'PHOTO', 'AUTO_CARD'])
  type: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
  photoKeys?: string[];

  @IsDateString()
  publishAt: string;

  @IsOptional()
  isSubscriberOnly?: boolean;
}
