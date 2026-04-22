import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsIn,
  MaxLength,
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
  @MaxLength(50)
  unit: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  lab?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
