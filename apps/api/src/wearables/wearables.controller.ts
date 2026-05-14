import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { WearablesService } from './wearables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SyncWearablesDto } from './dto/sync-wearables.dto';

@Controller('wearables')
@UseGuards(JwtAuthGuard)
export class WearablesController {
  constructor(private wearablesService: WearablesService) {}

  @Post('sync')
  @Throttle({ default: { limit: 20, ttl: seconds(3600) } })
  sync(@Request() req: any, @Body() dto: SyncWearablesDto) {
    return this.wearablesService.syncData(req.user.id, dto);
  }

  @Get('heart-rate/:sessionId')
  getHeartRate(@Request() req: any, @Param('sessionId') sessionId: string) {
    return this.wearablesService.getSessionHeartRate(req.user.id, sessionId);
  }

  @Get('recovery')
  getRecovery(@Request() req: any) {
    return this.wearablesService.getRecoveryScore(req.user.id);
  }

  @Get('calories/:sessionId')
  getCalories(
    @Request() req: any,
    @Param('sessionId') sessionId: string,
    @Query('duration') duration: string,
  ) {
    return this.wearablesService.getCaloriesEstimate(req.user.id, sessionId, parseInt(duration) || 30);
  }
}
