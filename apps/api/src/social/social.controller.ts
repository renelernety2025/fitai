import { Controller, Get, Post, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private socialService: SocialService) {}

  // Follow
  @Post('follow/:userId')
  follow(@Request() req: any, @Param('userId') userId: string) {
    return this.socialService.follow(req.user.id, userId);
  }

  @Delete('follow/:userId')
  unfollow(@Request() req: any, @Param('userId') userId: string) {
    return this.socialService.unfollow(req.user.id, userId);
  }

  @Get('following')
  getFollowing(@Request() req: any) {
    return this.socialService.getFollowing(req.user.id);
  }

  @Get('followers')
  getFollowers(@Request() req: any) {
    return this.socialService.getFollowers(req.user.id);
  }

  @Get('follow-counts')
  getFollowCounts(@Request() req: any) {
    return this.socialService.getFollowCounts(req.user.id);
  }

  @Get('is-following/:userId')
  isFollowing(@Request() req: any, @Param('userId') userId: string) {
    return this.socialService.isFollowing(req.user.id, userId);
  }

  // Feed
  @Get('feed')
  getFeed(@Request() req: any) {
    return this.socialService.getFeed(req.user.id);
  }

  @Get('feed/public')
  getPublicFeed() {
    return this.socialService.getPublicFeed();
  }

  // Challenges
  @Get('challenges')
  getChallenges() {
    return this.socialService.getChallenges();
  }

  @Post('challenges/:id/join')
  joinChallenge(@Request() req: any, @Param('id') id: string) {
    return this.socialService.joinChallenge(req.user.id, id);
  }

  @Get('challenges/:id/leaderboard')
  getLeaderboard(@Param('id') id: string) {
    return this.socialService.getLeaderboard(id);
  }

  // Search
  @Get('search')
  searchUsers(@Request() req: any, @Query('q') query: string) {
    return this.socialService.searchUsers(query || '', req.user.id);
  }
}
