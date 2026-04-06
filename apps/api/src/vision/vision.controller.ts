import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { VisionService } from './vision.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vision')
@UseGuards(JwtAuthGuard)
export class VisionController {
  constructor(private visionService: VisionService) {}

  @Post('analyze')
  analyzeFrame(@Body() dto: {
    exerciseName: string;
    jointAngles: { joint: string; angle: number }[];
    imageBase64?: string;
  }) {
    return this.visionService.analyzeFrame(dto);
  }

  @Post('detect-exercise')
  detectExercise(@Body('jointAngles') jointAngles: { joint: string; angle: number }[]) {
    return this.visionService.detectExercise(jointAngles);
  }

  @Post('estimate-weight')
  estimateWeight(@Body('imageBase64') imageBase64: string) {
    return this.visionService.estimateWeight(imageBase64);
  }
}
