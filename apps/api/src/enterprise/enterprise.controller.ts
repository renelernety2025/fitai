import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EnterpriseService } from './enterprise.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrgDto } from './dto/create-org.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { CreateOrgChallengeDto } from './dto/create-org-challenge.dto';

@Controller('enterprise')
@UseGuards(JwtAuthGuard)
export class EnterpriseController {
  constructor(private service: EnterpriseService) {}

  @Get('my-org')
  getMyOrg(@Request() req: any) {
    return this.service.getMyOrg(req.user.id);
  }

  @Post('create')
  create(@Request() req: any, @Body() dto: CreateOrgDto) {
    return this.service.create(req.user.id, dto);
  }

  @Post(':id/invite')
  invite(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.service.invite(req.user.id, id, dto.email);
  }

  @Get(':id/dashboard')
  getDashboard(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.service.getDashboard(req.user.id, id);
  }

  @Get(':id/leaderboard')
  getLeaderboard(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.service.getLeaderboard(req.user.id, id);
  }

  @Post(':id/challenges')
  createChallenge(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateOrgChallengeDto,
  ) {
    return this.service.createChallenge(
      req.user.id,
      id,
      dto,
    );
  }

  @Get(':id/challenges')
  getChallenges(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.service.getChallenges(req.user.id, id);
  }
}
