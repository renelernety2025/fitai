import { ArrayMaxSize, IsArray, IsString, MaxLength } from 'class-validator';

export class UpdatePriorityMusclesDto {
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  muscles: string[];
}
