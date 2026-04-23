import {
  IsString,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  IsInt,
  IsBoolean,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BundleItemDto {
  @IsString()
  @MaxLength(50)
  itemType!: string;

  @IsString()
  @MaxLength(100)
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
  @ArrayMaxSize(20)
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
