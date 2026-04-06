import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { PreprocessingService } from './preprocessing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('preprocessing')
export class PreprocessingController {
  constructor(private preprocessingService: PreprocessingService) {}

  @Post('start')
  @UseGuards(JwtAuthGuard, AdminGuard)
  start(@Body('videoId') videoId: string) {
    return this.preprocessingService.startPipeline(videoId);
  }

  @Get('status/:videoId')
  @UseGuards(JwtAuthGuard)
  getStatus(@Param('videoId') videoId: string) {
    return this.preprocessingService.getStatus(videoId);
  }
}
