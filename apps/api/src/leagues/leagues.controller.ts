import { Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LeaguesService } from './leagues.service';
import { LeaderboardQueryDto } from './dto/league-query.dto';

@Controller('leagues')
@UseGuards(JwtAuthGuard)
export class LeaguesController {
  constructor(private service: LeaguesService) {}

  @Get('current')
  getCurrent(@Request() req: any) {
    return this.service.getCurrent(req.user.id);
  }

  @Post('join')
  join(@Request() req: any) {
    return this.service.joinLeague(req.user.id);
  }

  @Get('leaderboard')
  getLeaderboard(
    @Request() req: any,
    @Query() query: LeaderboardQueryDto,
  ) {
    return this.service.getLeaderboard(
      query.tier || 'BRONZE',
      this.service.getCurrentWeekStart(),
    );
  }
}
