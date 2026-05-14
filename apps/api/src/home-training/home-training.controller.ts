import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { HomeTrainingService } from './home-training.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('home-training')
@UseGuards(JwtAuthGuard)
@Throttle({ default: { limit: 60, ttl: seconds(60) } })
export class HomeTrainingController {
  constructor(private service: HomeTrainingService) {}

  @Get('quick')
  quick() {
    return this.service.getQuick();
  }

  @Get('home')
  home() {
    return this.service.getHome();
  }

  @Get('travel')
  travel() {
    return this.service.getTravel();
  }
}
