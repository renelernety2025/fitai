import { IsString, Matches } from 'class-validator';

export class ExportJournalDto {
  /** Month in YYYY-MM format, e.g. "2026-04". */
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be YYYY-MM format' })
  month: string;
}
