import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CronTrackingService } from './cron-tracking.service';

@Controller('admin/cron')
@UseGuards(JwtAuthGuard, AdminGuard)
export class CronTrackingController {
  constructor(private service: CronTrackingService) {}

  @Get('summary')
  getSummary() {
    return this.service.getSummary();
  }

  @Get('runs')
  listRecent(@Query('limit') limit?: string) {
    return this.service.listRecent(limit ? parseInt(limit, 10) || 100 : 100);
  }
}
