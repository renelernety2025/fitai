import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClipsService } from './clips.service';
import { CreateClipDto } from './dto/create-clip.dto';
import { UploadClipUrlDto } from './dto/upload-clip-url.dto';
import { CommentClipDto } from './dto/comment-clip.dto';

@Controller('clips')
@UseGuards(JwtAuthGuard)
export class ClipsController {
  constructor(private service: ClipsService) {}

  @Post('upload-url')
  uploadUrl(@Request() req: any, @Body() dto: UploadClipUrlDto) {
    return this.service.getUploadUrl(
      req.user.id,
      dto.fileName,
      dto.contentType,
    );
  }

  @Get('feed')
  feed(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getFeed(
      req.user.id,
      parseInt(page || '1', 10),
      Math.min(parseInt(limit || '20', 10), 50),
    );
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateClipDto) {
    return this.service.create(req.user.id, dto);
  }

  @Post(':id/like')
  like(@Request() req: any, @Param('id') id: string) {
    return this.service.toggleLike(req.user.id, id);
  }

  @Post(':id/comment')
  comment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CommentClipDto,
  ) {
    return this.service.addComment(req.user.id, id, dto.text);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.id, id);
  }
}
