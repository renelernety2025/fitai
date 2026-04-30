import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

const MAX_PROPERTIES_BYTES = 5120; // 5 KB

class TrackEventDto {
  @IsString()
  @MaxLength(100)
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
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('event')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  trackEvent(@Body() dto: TrackEventDto, @Req() req: any) {
    if (dto.properties) {
      const size = JSON.stringify(dto.properties).length;
      if (size > MAX_PROPERTIES_BYTES) {
        throw new BadRequestException(
          `properties exceeds max size (${MAX_PROPERTIES_BYTES} bytes)`,
        );
      }
    }
    const userId = req.user?.id ?? null;
    this.analyticsService.logEvent(userId, dto.event, dto.properties);
    return { ok: true };
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getSummary(@Query() query: SummaryQueryDto, @Req() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true },
    });
    if (!user?.isAdmin) {
      throw new ForbiddenException('Admin only');
    }
    return this.analyticsService.getSummary(query.days ?? 7);
  }
}
