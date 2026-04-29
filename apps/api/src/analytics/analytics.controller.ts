import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

class TrackEventDto {
  @IsString()
  event: string;

  @IsOptional()
  properties?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  timestamp?: string;
}

class SummaryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days?: number;
}

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('event')
  trackEvent(@Body() dto: TrackEventDto, @Req() req: any) {
    const userId = req.user?.id ?? null;
    this.analyticsService.logEvent(userId, dto.event, dto.properties);
    return { ok: true };
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  getSummary(@Query() query: SummaryQueryDto, @Req() req: any) {
    if (!req.user?.isAdmin) {
      throw new ForbiddenException('Admin only');
    }
    return this.analyticsService.getSummary(query.days ?? 7);
  }
}
