import { IsString, IsOptional, IsEnum, IsArray, MaxLength, ArrayMaxSize } from 'class-validator';

export enum PostTypeDto {
  TEXT = 'TEXT',
  PHOTO = 'PHOTO',
  AUTO_CARD = 'AUTO_CARD',
}

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  caption?: string;

  @IsEnum(PostTypeDto)
  type: PostTypeDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
  photoKeys?: string[];

  @IsOptional()
  cardData?: Record<string, any>;
}
