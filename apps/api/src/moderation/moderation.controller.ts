import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { ContentReportStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ModerationService } from './moderation.service';
import { BanUserDto, ReportContentDto, ReviewReportDto } from './dto/report-content.dto';

@Controller('moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(private service: ModerationService) {}

  // User-facing: file a report against content or another user.
  @Post('report')
  @Throttle({ default: { limit: 10, ttl: seconds(3600) } })
  fileReport(@Request() req: any, @Body() dto: ReportContentDto) {
    return this.service.fileReport(req.user.id, dto);
  }

  // User-facing: block / unblock.
  @Post('block/:userId')
  @Throttle({ default: { limit: 30, ttl: seconds(3600) } })
  blockUser(@Request() req: any, @Param('userId') userId: string) {
    return this.service.blockUser(req.user.id, userId);
  }

  @Delete('block/:userId')
  unblockUser(@Request() req: any, @Param('userId') userId: string) {
    return this.service.unblockUser(req.user.id, userId);
  }

  @Get('blocked')
  listBlocked(@Request() req: any) {
    return this.service.listBlocked(req.user.id);
  }

  // ── Admin-only ──

  @Get('admin/reports')
  @UseGuards(AdminGuard)
  listReports(
    @Query('status', new ParseEnumPipe(ContentReportStatus, { optional: true }))
    status?: ContentReportStatus,
  ) {
    return this.service.listReports(status ?? 'PENDING');
  }

  @Post('admin/reports/:id/review')
  @UseGuards(AdminGuard)
  reviewReport(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewReportDto,
  ) {
    return this.service.reviewReport(id, req.user.id, dto);
  }

  @Post('admin/users/:userId/ban')
  @UseGuards(AdminGuard)
  banUser(@Param('userId') userId: string, @Body() dto: BanUserDto) {
    return this.service.banUser(userId, dto.reason);
  }

  @Post('admin/users/:userId/unban')
  @UseGuards(AdminGuard)
  unbanUser(@Param('userId') userId: string) {
    return this.service.unbanUser(userId);
  }
}
