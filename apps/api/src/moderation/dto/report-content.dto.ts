import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ContentReportReason, ContentReportTargetType } from '@prisma/client';

export class ReportContentDto {
  @IsEnum(ContentReportTargetType)
  targetType: ContentReportTargetType;

  @IsString()
  @IsUUID()
  targetId: string;

  @IsEnum(ContentReportReason)
  reason: ContentReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;
}

export class ReviewReportDto {
  @IsEnum(['HIDE_CONTENT', 'BAN_USER', 'DISMISS'] as const)
  action: 'HIDE_CONTENT' | 'BAN_USER' | 'DISMISS';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class BanUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
