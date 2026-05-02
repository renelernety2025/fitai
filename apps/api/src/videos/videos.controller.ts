import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Logger,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { S3Service } from './s3.service';
import { MediaConvertService } from './mediaconvert.service';
import { PreprocessingService } from '../preprocessing/preprocessing.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { VideoCategory, VideoDifficulty } from '@prisma/client';

@Controller('videos')
export class VideosController {
  private readonly logger = new Logger(VideosController.name);

  constructor(
    private videosService: VideosService,
    private s3Service: S3Service,
    private mediaConvertService: MediaConvertService,
    private preprocessingService: PreprocessingService,
  ) {}

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin() {
    return this.videosService.findAllAdmin();
  }

  @Get()
  findAll(
    @Query('category') category?: VideoCategory,
    @Query('difficulty') difficulty?: VideoDifficulty,
  ) {
    return this.videosService.findAll({ category, difficulty });
  }

  @Get('upload-url')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getUploadUrl(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    return this.s3Service.getPresignedUploadUrl(filename, contentType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videosService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() dto: CreateVideoDto) {
    const video = await this.videosService.create(dto);
    this.mediaConvertService.createTranscodeJob(dto.s3RawKey, video.id).catch((err) => {
      this.logger.error(`Transcode job failed for ${video.id}: ${err.message}`);
    });
    return video;
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard, AdminGuard)
  publish(@Param('id') id: string) {
    return this.videosService.publish(id);
  }

  @Put(':id/reprocess')
  @UseGuards(JwtAuthGuard, AdminGuard)
  reprocess(@Param('id') id: string) {
    return this.preprocessingService.startPipeline(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  delete(@Param('id') id: string) {
    return this.videosService.delete(id);
  }

  @Post('mediaconvert-webhook')
  async handleWebhook(@Body() body: any) {
    // SNS sends a confirmation request first
    if (body.Type === 'SubscriptionConfirmation') {
      this.logger.log(`SNS subscription confirmation: ${body.SubscribeURL}`);
      return { ok: true };
    }

    let message = body;
    if (body.Type === 'Notification' && typeof body.Message === 'string') {
      message = JSON.parse(body.Message);
    }

    const detail = message.detail || message;
    const status = detail.status;
    const videoId = detail.userMetadata?.videoId;

    if (!videoId) {
      this.logger.warn('Webhook received without videoId');
      return { ok: true };
    }

    if (status === 'COMPLETE') {
      await this.mediaConvertService.handleJobComplete(videoId);
    } else if (status === 'ERROR') {
      await this.mediaConvertService.handleJobError(
        videoId,
        detail.errorMessage || 'Unknown error',
      );
    }

    return { ok: true };
  }
}
