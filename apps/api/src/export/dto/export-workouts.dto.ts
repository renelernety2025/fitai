import { IsIn, IsOptional } from 'class-validator';

export class ExportWorkoutsDto {
  @IsOptional()
  @IsIn(['csv', 'pdf'])
  format?: 'csv' | 'pdf' = 'csv';
}
