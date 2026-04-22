import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsBoolean,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BundleItemDto {
  @IsString()
  itemType!: string;

  @IsString()
  itemId!: string;
}

export class CreateBundleDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  items!: BundleItemDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  priceXP?: number;

  @IsOptional()
  @IsBoolean()
  giftable?: boolean;
}
