import { IsString } from 'class-validator';

export class AddWishlistItemDto {
  @IsString()
  itemType!: string;

  @IsString()
  itemId!: string;
}
