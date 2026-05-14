import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class BuddyProfileDto {
  @IsString()
  @IsIn(['buddy', 'spotter', 'group'])
  lookingFor: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  gym?: string;

  @IsOptional()
  @IsString()
  @IsIn(['morning', 'afternoon', 'evening'])
  schedule?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  goals?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
