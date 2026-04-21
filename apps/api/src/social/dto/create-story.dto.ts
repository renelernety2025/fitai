import { IsOptional, IsString, IsObject } from 'class-validator';

export class CreateStoryDto {
  @IsOptional()
  @IsString()
  gymSessionId?: string;

  @IsOptional()
  @IsObject()
  cardData?: Record<string, unknown>;
}
