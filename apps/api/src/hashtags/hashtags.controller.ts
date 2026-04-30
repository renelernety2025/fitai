import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HashtagsService } from './hashtags.service';

@Controller('hashtags')
@UseGuards(JwtAuthGuard)
export class HashtagsController {
  constructor(private hashtagsService: HashtagsService) {}

  @Get('trending')
  async getTrending(@Query('period') period?: string) {
    const p = period === 'D7' ? 'D7' : 'H24';
    return this.hashtagsService.getTrending(p);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.length < 1) return [];
    return this.hashtagsService.search(query);
  }

  @Get('suggested')
  async getSuggested() {
    return this.hashtagsService.getSuggested();
  }

  @Get(':name/posts')
  async getByHashtag(
    @Param('name') name: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.hashtagsService.getPostsByHashtag(name, cursor);
  }
}
