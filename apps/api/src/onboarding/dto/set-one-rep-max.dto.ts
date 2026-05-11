import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class SetManualOneRMDto {
  @IsUUID()
  exerciseId: string;

  @IsNumber()
  @Min(0)
  @Max(500)
  oneRMKg: number;
}
