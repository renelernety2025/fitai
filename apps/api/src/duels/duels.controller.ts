import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { DuelsService } from './duels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChallengeDuelDto } from './dto/challenge-duel.dto';
import { SubmitScoreDto } from './dto/submit-score.dto';

@Controller('duels')
@UseGuards(JwtAuthGuard)
export class DuelsController {
  constructor(private duelsService: DuelsService) {}

  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @Post('challenge')
  challenge(@Request() req: any, @Body() dto: ChallengeDuelDto) {
    return this.duelsService.challenge(req.user.id, dto);
  }

  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @Post(':id/accept')
  accept(@Request() req: any, @Param('id') id: string) {
    return this.duelsService.accept(req.user.id, id);
  }

  @Post(':id/decline')
  decline(@Request() req: any, @Param('id') id: string) {
    return this.duelsService.decline(req.user.id, id);
  }

  @Post(':id/score')
  submitScore(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: SubmitScoreDto,
  ) {
    return this.duelsService.submitScore(req.user.id, id, dto.score);
  }

  @Get('active')
  getActive(@Request() req: any) {
    return this.duelsService.getActive(req.user.id);
  }

  @Get('history')
  getHistory(@Request() req: any) {
    return this.duelsService.getHistory(req.user.id);
  }
}
