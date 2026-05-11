import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SaveMeasurementsDto } from './dto/save-measurements.dto';
import { SubmitFitnessTestDto } from './dto/fitness-test.dto';
import { SetManualOneRMDto } from './dto/set-one-rep-max.dto';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Get('status')
  getStatus(@Request() req: any) {
    return this.onboardingService.getStatus(req.user.id);
  }

  @Get('test-exercises')
  getTestExercises() {
    return this.onboardingService.getTestExercises();
  }

  @Put('measurements')
  saveMeasurements(@Request() req: any, @Body() dto: SaveMeasurementsDto) {
    return this.onboardingService.saveMeasurements(req.user.id, dto);
  }

  @Post('fitness-test')
  submitFitnessTest(@Request() req: any, @Body() dto: SubmitFitnessTestDto) {
    return this.onboardingService.submitFitnessTest(req.user.id, dto.results);
  }

  @Put('one-rep-max')
  setManualOneRM(@Request() req: any, @Body() dto: SetManualOneRMDto) {
    return this.onboardingService.setManualOneRM(req.user.id, dto.exerciseId, dto.oneRMKg);
  }

  @Post('complete')
  complete(@Request() req: any) {
    return this.onboardingService.complete(req.user.id);
  }

  @Get('suggested-weights')
  getSuggestedWeights(@Request() req: any) {
    return this.onboardingService.getSuggestedWeights(req.user.id);
  }
}
