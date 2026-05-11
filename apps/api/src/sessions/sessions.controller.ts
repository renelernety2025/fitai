import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EndSessionDto } from './dto/end-session.dto';
import { PoseSnapshotDto } from './dto/pose-snapshot.dto';
import { StartSessionDto } from './dto/start-session.dto';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post('start')
  start(@Request() req: any, @Body() dto: StartSessionDto) {
    return this.sessionsService.startSession(req.user.id, dto.videoId);
  }

  @Post(':id/end')
  end(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: EndSessionDto,
  ) {
    return this.sessionsService.endSession(id, req.user.id, dto);
  }

  @Post(':id/pose-snap')
  poseSnap(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: PoseSnapshotDto,
  ) {
    return this.sessionsService.savePoseSnapshot(id, req.user.id, dto);
  }

  @Get('my')
  getMySessions(@Request() req: any) {
    return this.sessionsService.getMySessions(req.user.id);
  }

  @Get('my/stats')
  getMyStats(@Request() req: any) {
    return this.sessionsService.getMyStats(req.user.id);
  }
}
