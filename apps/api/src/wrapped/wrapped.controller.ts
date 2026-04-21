import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WrappedService } from './wrapped.service';
import { WrappedQueryDto } from './dto/wrapped-query.dto';

@Controller('wrapped')
@UseGuards(JwtAuthGuard)
export class WrappedController {
  constructor(private service: WrappedService) {}

  @Get()
  @Throttle({ short: { ttl: 60_000, limit: 5 } })
  getWrapped(@Request() req: any, @Query() query: WrappedQueryDto) {
    return this.service.getWrapped(req.user.id, query.period, query.month);
  }
}
