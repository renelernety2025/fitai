import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class WrappedQueryDto {
  @IsIn(['monthly', 'yearly'])
  period: 'monthly' | 'yearly';

  /** Required for monthly period, format YYYY-MM */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be YYYY-MM format' })
  month?: string;
}
