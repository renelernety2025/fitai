import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedService } from './feed.service';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get('for-you')
  async getForYou(@Request() req, @Query('cursor') cursor?: string) {
    return this.feedService.getForYouFeed(req.user.id, cursor);
  }

  @Get('following')
  async getFollowing(@Request() req, @Query('cursor') cursor?: string) {
    return this.feedService.getFollowingFeed(req.user.id, cursor);
  }

  @Get('trending')
  async getTrending(@Query('cursor') cursor?: string) {
    return this.feedService.getTrendingFeed(cursor);
  }
}
