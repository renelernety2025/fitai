import { IsIn, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddToStackDto {
  @IsString()
  supplementId!: string;

  @IsString()
  @MaxLength(100)
  dosage!: string;

  @IsString()
  @MaxLength(50)
  @IsIn(['MORNING', 'PRE_WORKOUT', 'DURING', 'POST_WORKOUT', 'EVENING', 'WITH_MEAL'])
  timing!: string;

  @IsOptional()
  @IsNumber()
  monthlyCostKc?: number;
}
