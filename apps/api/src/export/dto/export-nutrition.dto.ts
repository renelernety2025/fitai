import { IsString, Matches } from 'class-validator';

export class ExportNutritionDto {
  /** Start date in YYYY-MM-DD format. */
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from must be YYYY-MM-DD' })
  from: string;

  /** End date in YYYY-MM-DD format (inclusive). */
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'to must be YYYY-MM-DD' })
  to: string;
}
