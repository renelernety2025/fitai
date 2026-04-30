import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatorDashboardService } from './creator-dashboard.service';
import { SubscriptionPriceDto } from './dto/subscription-price.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { BulkSubscriberOnlyDto } from './dto/bulk-subscriber-only.dto';

@Controller('creator-dashboard')
@UseGuards(JwtAuthGuard)
export class CreatorDashboardController {
  constructor(private service: CreatorDashboardService) {}

  @Get('stats')
  async getStats(@Request() req) {
    return this.service.getStats(req.user.id);
  }

  @Get('subscriber-growth')
  async getSubscriberGrowth(@Request() req, @Query('days') days?: string) {
    return this.service.getSubscriberGrowth(req.user.id, days ? parseInt(days) : 30);
  }

  @Get('earnings')
  async getEarnings(@Request() req, @Query('weeks') weeks?: string) {
    return this.service.getEarnings(req.user.id, weeks ? parseInt(weeks) : 12);
  }

  @Get('post-performance')
  async getPostPerformance(@Request() req, @Query('limit') limit?: string) {
    return this.service.getPostPerformance(req.user.id, limit ? parseInt(limit) : 20);
  }

  @Get('top-hashtags')
  async getTopHashtags(@Request() req) {
    return this.service.getTopHashtags(req.user.id);
  }

  @Put('subscription-price')
  async setPrice(@Request() req, @Body() dto: SubscriptionPriceDto) {
    return this.service.setSubscriptionPrice(req.user.id, dto.priceXP);
  }

  @Post('pin/:postId')
  async pin(@Param('postId') postId: string, @Request() req) {
    return this.service.pinPost(req.user.id, postId);
  }

  @Post('unpin/:postId')
  async unpin(@Param('postId') postId: string, @Request() req) {
    return this.service.unpinPost(req.user.id, postId);
  }

  @Post('schedule-post')
  async schedule(@Request() req, @Body() dto: SchedulePostDto) {
    return this.service.schedulePost(req.user.id, dto);
  }

  @Put('schedule/:postId')
  async updateSchedule(@Param('postId') postId: string, @Request() req, @Body() dto: SchedulePostDto) {
    return this.service.updateScheduledPost(req.user.id, postId, dto);
  }

  @Delete('schedule/:postId')
  async cancelSchedule(@Param('postId') postId: string, @Request() req) {
    return this.service.cancelScheduledPost(req.user.id, postId);
  }

  @Post('publish-now/:postId')
  async publishNow(@Param('postId') postId: string, @Request() req) {
    return this.service.publishNow(req.user.id, postId);
  }

  @Post('bulk-subscriber-only')
  async bulkSubscriberOnly(@Request() req, @Body() dto: BulkSubscriberOnlyDto) {
    return this.service.bulkSubscriberOnly(req.user.id, dto.postIds, dto.isSubscriberOnly);
  }
}
