import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { GymSessionsService } from './gym-sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StartGymSessionDto } from './dto/start-gym-session.dto';
import { CompleteSetDto } from './dto/complete-set.dto';

@Controller('gym-sessions')
export class GymSessionsController {
  constructor(private gymSessionsService: GymSessionsService) {}

  @Post('start')
  @UseGuards(JwtAuthGuard)
  start(@Request() req: any, @Body() dto: StartGymSessionDto) {
    return this.gymSessionsService.startSession(req.user.id, dto);
  }

  @Post(':id/set/complete')
  @UseGuards(JwtAuthGuard)
  completeSet(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: CompleteSetDto,
  ) {
    return this.gymSessionsService.completeSet(id, req.user.id, dto);
  }

  @Post(':id/end')
  @UseGuards(JwtAuthGuard)
  end(@Param('id') id: string, @Request() req: any) {
    return this.gymSessionsService.endSession(id, req.user.id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMySessions(@Request() req: any) {
    return this.gymSessionsService.getMySessions(req.user.id);
  }

  @Get('my/weekly-volume')
  @UseGuards(JwtAuthGuard)
  getWeeklyVolume(@Request() req: any) {
    return this.gymSessionsService.getMyWeeklyVolume(req.user.id);
  }

  @Get(':id/share-card')
  getShareCard(@Param('id') id: string) {
    return this.gymSessionsService.getShareCard(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getSession(@Param('id') id: string) {
    return this.gymSessionsService.getSession(id);
  }
}
