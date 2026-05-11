import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsNumber, IsUUID, Max, Min, ValidateNested } from 'class-validator';

export class FitnessTestResultDto {
  @IsUUID()
  exerciseId: string;

  @IsNumber()
  @Min(0)
  @Max(500)
  weight: number;

  @IsInt()
  @Min(1)
  @Max(50)
  reps: number;
}

export class SubmitFitnessTestDto {
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => FitnessTestResultDto)
  results: FitnessTestResultDto[];
}
