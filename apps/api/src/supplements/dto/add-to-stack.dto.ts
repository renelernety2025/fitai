import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AddToStackDto {
  @IsString()
  supplementId!: string;

  @IsString()
  dosage!: string;

  @IsString()
  timing!: string;

  @IsOptional()
  @IsNumber()
  monthlyCostKc?: number;
}
