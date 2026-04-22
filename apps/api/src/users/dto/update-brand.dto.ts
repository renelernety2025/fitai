import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  colorTheme?: string;

  @IsOptional()
  @IsString()
  avatarConfig?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  monogram?: string;
}
