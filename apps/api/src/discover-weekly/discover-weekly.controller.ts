import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DiscoverWeeklyService } from './discover-weekly.service';

@Controller('discover-weekly')
@UseGuards(JwtAuthGuard)
export class DiscoverWeeklyController {
  constructor(private service: DiscoverWeeklyService) {}

  @Get()
  @Throttle({ short: { ttl: 60_000, limit: 5 } })
  get(@Request() req: any) {
    return this.service.getWeeklyWorkout(req.user.id);
  }
}
