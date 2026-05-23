import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ContentReportReason, ContentReportTargetType } from '@prisma/client';

// Strip angle-bracket content as defense-in-depth before persistence. The admin
// queue today renders via React (auto-escapes) but any future server-rendered
// email digest or PDF report would XSS without this. Cheap to apply at the DTO
// layer (single regex per request).
const stripTags = (v: unknown) => (typeof v === 'string' ? v.replace(/<[^>]*>/g, '') : v);

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
  @Transform(({ value }) => stripTags(value))
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
