import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgressPhotosService } from './progress-photos.service';
import { UploadPhotoUrlDto } from './dto/upload-photo-url.dto';

type PhotoSide = 'FRONT' | 'SIDE' | 'BACK';

@Controller('progress-photos')
@UseGuards(JwtAuthGuard)
export class ProgressPhotosController {
  constructor(private service: ProgressPhotosService) {}

  /** Get presigned upload URL + DB row id */
  @Post('upload-url')
  uploadUrl(@Request() req: any, @Body() dto: UploadPhotoUrlDto) {
    return this.service.getUploadUrl(req.user.id, {
      contentType: dto.contentType,
      side: dto.side,
      weightKg: dto.weightKg,
      bodyFatPct: dto.bodyFatPct,
      notes: dto.notes,
    });
  }

  /** List all my photos, optionally filtered by side */
  @Get()
  list(@Request() req: any, @Query('side') side?: PhotoSide) {
    return this.service.list(req.user.id, side);
  }

  /** Photo stats: total count, by angle, days tracked */
  @Get('stats')
  stats(@Request() req: any) {
    return this.service.stats(req.user.id);
  }

  /** Get one photo with presigned URL + analysis */
  @Get(':id')
  one(@Request() req: any, @Param('id') id: string) {
    return this.service.getOne(req.user.id, id);
  }

  /** Trigger Claude Vision analysis. Vision calls are expensive (~2k tokens
   * + image data). Reasonable upper bound is 20/day per user. */
  @Post(':id/analyze')
  @Throttle({ default: { limit: 20, ttl: seconds(86400) } }) // 20/day
  analyze(@Request() req: any, @Param('id') id: string) {
    return this.service.analyze(req.user.id, id);
  }

  /** Delete photo (S3 + DB) */
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.delete(req.user.id, id);
  }
}
