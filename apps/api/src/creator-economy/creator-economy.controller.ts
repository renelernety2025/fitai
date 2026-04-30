import { Controller, Get, Post, Param, Body, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatorEconomyService } from './creator-economy.service';
import { TipDto } from './dto/tip.dto';

@Controller('creator-economy')
@UseGuards(JwtAuthGuard)
export class CreatorEconomyController {
  constructor(private service: CreatorEconomyService) {}

  @Post('subscribe/:creatorId')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async subscribe(@Param('creatorId') creatorId: string, @Request() req) {
    return this.service.subscribe(req.user.id, creatorId);
  }

  @Post('unsubscribe/:creatorId')
  async unsubscribe(@Param('creatorId') creatorId: string, @Request() req) {
    return this.service.unsubscribe(req.user.id, creatorId);
  }

  @Get('subscriptions')
  async getSubscriptions(@Request() req) {
    return this.service.getSubscriptions(req.user.id);
  }

  @Get('subscribers')
  async getSubscribers(@Request() req) {
    return this.service.getSubscribers(req.user.id);
  }

  @Post('tip/:creatorId')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async tip(@Param('creatorId') creatorId: string, @Request() req, @Body() dto: TipDto) {
    return this.service.tip(req.user.id, creatorId, dto.xpAmount, dto.message);
  }

  @Get('earnings')
  async getEarnings(@Request() req) {
    return this.service.getEarnings(req.user.id);
  }

  @Get('check/:creatorId')
  async checkSubscription(@Param('creatorId') creatorId: string, @Request() req) {
    return this.service.checkSubscription(req.user.id, creatorId);
  }
}
