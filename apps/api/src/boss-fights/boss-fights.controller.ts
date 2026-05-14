import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BossFightsService } from './boss-fights.service';
import { CompleteBossDto } from './dto/complete-boss.dto';

@Controller('boss-fights')
@UseGuards(JwtAuthGuard)
export class BossFightsController {
  constructor(private service: BossFightsService) {}

  @Get()
  getAll(@Request() req: any) {
    return this.service.getAll(req.user.id);
  }

  @Post(':code/start')
  @Throttle({ default: { limit: 20, ttl: seconds(3600) } })
  start(@Request() req: any, @Param('code') code: string) {
    return this.service.start(req.user.id, code);
  }

  @Post(':code/complete')
  @Throttle({ default: { limit: 20, ttl: seconds(3600) } })
  complete(
    @Request() req: any,
    @Param('code') code: string,
    @Body() dto: CompleteBossDto,
  ) {
    return this.service.complete(req.user.id, code, dto);
  }
}
