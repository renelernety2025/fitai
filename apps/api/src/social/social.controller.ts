import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { InviteToChallengeDto, FlashUpdateDto } from './dto/invite-and-flash.dto';
import { CreateStoryDto } from './dto/create-story.dto';
import { ReactDto } from './dto/react.dto';
import { CommentDto } from './dto/comment.dto';
import { PropsDto } from './dto/props.dto';
import { ShareDto } from './dto/share.dto';
import { UpdateBioDto } from './dto/update-bio.dto';

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

  @Post('challenges')
  createChallenge(@Request() req: any, @Body() dto: CreateChallengeDto) {
    return this.socialService.createChallenge(req.user.id, dto);
  }

  @Get('challenges/:id')
  getChallengeDetail(@Param('id') id: string) {
    return this.socialService.getChallengeDetail(id);
  }

  @Post('challenges/:id/join')
  joinChallenge(@Request() req: any, @Param('id') id: string) {
    return this.socialService.joinChallenge(req.user.id, id);
  }

  @Post('challenges/:id/invite')
  inviteToChallenge(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: InviteToChallengeDto,
  ) {
    return this.socialService.inviteToChallenge(req.user.id, id, dto.userId);
  }

  @Get('challenges/:id/leaderboard')
  getLeaderboard(@Param('id') id: string) {
    return this.socialService.getLeaderboard(id);
  }

  // Search
  @Throttle({ default: { limit: 30, ttl: seconds(60) } })
  @Get('search')
  searchUsers(@Request() req: any, @Query('q') query: string) {
    return this.socialService.searchUsers(query || '', req.user.id);
  }

  // Stories
  @Get('stories')
  getStories(@Request() req: any) {
    return this.socialService.getStories(req.user.id);
  }

  @Post('stories')
  createStory(@Request() req: any, @Body() dto: CreateStoryDto) {
    return this.socialService.createStory(req.user.id, dto);
  }

  @Post('stories/:id/view')
  viewStory(@Param('id') id: string) {
    return this.socialService.viewStory(id);
  }

  // Reactions
  @Post('react')
  react(@Request() req: any, @Body() dto: ReactDto) {
    return this.socialService.react(req.user.id, dto);
  }

  @Delete('react/:id')
  unreact(@Request() req: any, @Param('id') id: string) {
    return this.socialService.unreact(req.user.id, id);
  }

  @Get('reactions/:targetType/:targetId')
  getReactions(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.socialService.getReactions(targetType, targetId);
  }

  // Comments
  @Post('comments')
  addComment(@Request() req: any, @Body() dto: CommentDto) {
    return this.socialService.addComment(req.user.id, dto);
  }

  @Get('comments/:feedItemId')
  getComments(@Param('feedItemId') feedItemId: string) {
    return this.socialService.getComments(feedItemId);
  }

  @Delete('comments/:id')
  deleteComment(@Request() req: any, @Param('id') id: string) {
    return this.socialService.deleteComment(req.user.id, id);
  }

  // Props
  @Post('props')
  giveProps(@Request() req: any, @Body() dto: PropsDto) {
    return this.socialService.giveProps(req.user.id, dto);
  }

  @Get('props/received')
  getReceivedProps(@Request() req: any) {
    return this.socialService.getReceivedProps(req.user.id);
  }

  // Flash Challenges
  @Get('flash-challenge/active')
  getActiveFlash() {
    return this.socialService.getActiveFlash();
  }

  @Post('flash-challenge/:id/join')
  joinFlash(@Request() req: any, @Param('id') id: string) {
    return this.socialService.joinFlash(req.user.id, id);
  }

  @Post('flash-challenge/:id/update')
  updateFlash(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: FlashUpdateDto,
  ) {
    return this.socialService.updateFlash(req.user.id, id, dto.value);
  }

  // Share
  @Post('share')
  share(@Request() req: any, @Body() dto: ShareDto) {
    return this.socialService.share(req.user.id, dto);
  }

  // Profile
  @Get('profile/:id')
  getPublicProfile(@Param('id') id: string) {
    return this.socialService.getPublicProfile(id);
  }

  @Put('profile/bio')
  updateBio(@Request() req: any, @Body() dto: UpdateBioDto) {
    return this.socialService.updateBio(req.user.id, dto.bio);
  }
}
