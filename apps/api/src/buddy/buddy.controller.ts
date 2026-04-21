import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BuddyService } from './buddy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BuddyProfileDto } from './dto/buddy-profile.dto';
import { SwipeDto } from './dto/swipe.dto';

@Controller('buddy')
@UseGuards(JwtAuthGuard)
export class BuddyController {
  constructor(private buddyService: BuddyService) {}

  @Get('cards')
  getCards(@Request() req: any) {
    return this.buddyService.getCards(req.user.id);
  }

  @Post('profile')
  upsertProfile(@Request() req: any, @Body() dto: BuddyProfileDto) {
    return this.buddyService.upsertProfile(req.user.id, dto);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.buddyService.getProfile(req.user.id);
  }

  @Post('swipe')
  swipe(@Request() req: any, @Body() dto: SwipeDto) {
    return this.buddyService.swipe(
      req.user.id,
      dto.targetId,
      dto.direction,
    );
  }

  @Get('matches')
  getMatches(@Request() req: any) {
    return this.buddyService.getMatches(req.user.id);
  }
}
