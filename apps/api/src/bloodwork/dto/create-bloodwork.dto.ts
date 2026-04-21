import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

const VALID_TESTS = [
  'testosterone', 'iron', 'vitaminD', 'crp',
  'cholesterol', 'glucose', 'hba1c',
];

export class CreateBloodworkDto {
  @IsString()
  @IsIn(VALID_TESTS)
  testType: string;

  @IsNumber()
  value: number;

  @IsString()
  unit: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  lab?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
