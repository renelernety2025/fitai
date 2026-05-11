import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class SaveMeasurementsDto {
  @IsInt()
  @Min(10)
  @Max(120)
  age: number;

  @IsNumber()
  @Min(20)
  @Max(500)
  weightKg: number;

  @IsNumber()
  @Min(100)
  @Max(250)
  heightCm: number;
}
