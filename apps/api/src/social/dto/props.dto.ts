import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PropsDto {
  @IsString()
  toUserId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
