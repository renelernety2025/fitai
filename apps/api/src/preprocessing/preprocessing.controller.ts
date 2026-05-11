import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { PreprocessingService } from './preprocessing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { StartPreprocessingDto } from './dto/start-preprocessing.dto';

@Controller('preprocessing')
export class PreprocessingController {
  constructor(private preprocessingService: PreprocessingService) {}

  @Post('start')
  @UseGuards(JwtAuthGuard, AdminGuard)
  start(@Body() dto: StartPreprocessingDto) {
    return this.preprocessingService.startPipeline(dto.videoId);
  }

  @Get('status/:videoId')
  @UseGuards(JwtAuthGuard)
  getStatus(@Param('videoId') videoId: string) {
    return this.preprocessingService.getStatus(videoId);
  }
}
