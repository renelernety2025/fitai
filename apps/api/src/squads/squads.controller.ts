import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SquadsService } from './squads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSquadDto } from './dto/create-squad.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Controller('squads')
@UseGuards(JwtAuthGuard)
export class SquadsController {
  constructor(private squadsService: SquadsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateSquadDto) {
    return this.squadsService.create(req.user.id, dto);
  }

  @Get('mine')
  getMine(@Request() req: any) {
    return this.squadsService.getMine(req.user.id);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.squadsService.getLeaderboard();
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.squadsService.getDetail(id);
  }

  @Post(':id/invite')
  invite(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.squadsService.invite(req.user.id, id, dto.userId);
  }

  @Delete(':id/leave')
  leave(@Request() req: any, @Param('id') id: string) {
    return this.squadsService.leave(req.user.id, id);
  }
}
