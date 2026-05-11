import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { VisionService } from './vision.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyzeFrameDto, DetectExerciseDto, EstimateWeightDto } from './dto/analyze-frame.dto';

@Controller('vision')
@UseGuards(JwtAuthGuard)
@Throttle({ default: { limit: 60, ttl: seconds(60) } })
export class VisionController {
  constructor(private visionService: VisionService) {}

  @Post('analyze')
  analyzeFrame(@Body() dto: AnalyzeFrameDto) {
    return this.visionService.analyzeFrame(dto);
  }

  @Post('detect-exercise')
  detectExercise(@Body() dto: DetectExerciseDto) {
    return this.visionService.detectExercise(dto.jointAngles);
  }

  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @Post('estimate-weight')
  estimateWeight(@Body() dto: EstimateWeightDto) {
    return this.visionService.estimateWeight(dto.imageBase64);
  }
}
