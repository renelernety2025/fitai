import { IsIn, IsString, MaxLength } from 'class-validator';

export class AddWishlistItemDto {
  @IsString()
  @MaxLength(50)
  @IsIn(['WISH_EXERCISE', 'WISH_PLAN', 'WISH_RECIPE', 'WISH_EXPERIENCE', 'WISH_BUNDLE', 'WISH_CLIP'])
  itemType!: string;

  @IsString()
  @MaxLength(100)
  itemId!: string;
}
