import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { PaidChallengesService } from './paid-challenges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaidChallengeDto } from './dto/create-paid-challenge.dto';

@Controller('paid-challenges')
@UseGuards(JwtAuthGuard)
export class PaidChallengesController {
  constructor(private service: PaidChallengesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.service.detail(id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreatePaidChallengeDto) {
    return this.service.create(req.user.id, dto);
  }

  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @Post(':id/join')
  join(@Request() req: any, @Param('id') id: string) {
    return this.service.join(req.user.id, id);
  }

  @Post(':id/complete')
  complete(@Request() req: any, @Param('id') id: string) {
    return this.service.complete(req.user.id, id);
  }
}
