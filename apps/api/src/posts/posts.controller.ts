import { Controller, Get, Post, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post('upload-url')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async getUploadUrl(
    @Request() req,
    @Body() body: { count: number; contentType: string },
  ) {
    return this.postsService.getUploadUrls(req.user.id, body.count || 1, body.contentType || 'image/jpeg');
  }

  @Get('user/:userId')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.postsService.getUserPosts(userId, cursor);
  }

  @Post()
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async create(@Request() req, @Body() dto: CreatePostDto) {
    return this.postsService.create(req.user.id, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.postsService.findById(id, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.postsService.deletePost(id, req.user.id);
  }

  @Post(':id/like')
  async toggleLike(@Param('id') id: string, @Request() req) {
    return this.postsService.toggleLike(id, req.user.id);
  }

  @Post(':id/comment')
  async addComment(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.addComment(id, req.user.id, dto);
  }

  @Delete('comments/:commentId')
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    return this.postsService.deleteComment(commentId, req.user.id);
  }
}
