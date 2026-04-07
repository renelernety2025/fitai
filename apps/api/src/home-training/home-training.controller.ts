import { Controller, Get } from '@nestjs/common';
import { HomeTrainingService } from './home-training.service';

@Controller('home-training')
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
