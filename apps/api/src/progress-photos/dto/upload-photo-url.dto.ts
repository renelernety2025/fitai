import { IsIn, IsOptional, IsNumber, IsString, Min, Max, MaxLength } from 'class-validator';

export class UploadPhotoUrlDto {
  @IsIn(['image/jpeg', 'image/png', 'image/heic'])
  contentType: string;

  @IsIn(['FRONT', 'SIDE', 'BACK'])
  side: 'FRONT' | 'SIDE' | 'BACK';

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bodyFatPct?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
