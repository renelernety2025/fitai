import { IsIn, IsString } from 'class-validator';

export class SwipeDto {
  @IsString()
  targetId!: string;

  @IsString()
  @IsIn(['right', 'left'])
  direction!: string;
}
